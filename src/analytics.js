/** Pure, testable product analytics. All ratios use explicit denominators. */
export const STAGES = [
  { label: "Signed up", short: "Signup", question: "Did the value proposition bring in the right audience?" },
  { label: "Created workspace", short: "Workspace", question: "Is setup simple enough to reach a usable workspace?" },
  { label: "Created first project", short: "Project", question: "Can people find a starting point without a blank canvas?" },
  { label: "Created first task", short: "First task", question: "Have people reached their first meaningful outcome?" },
  { label: "Invited a teammate", short: "Invitation", question: "Does solo value translate into team adoption?" }
];

export function ratio(part, whole) {
  return whole > 0 ? part / whole : 0;
}

export function filterUsers(users, filters = {}) {
  return users.filter((u) =>
    (!filters.device || filters.device === "All" || u.device === filters.device) &&
    (!filters.channel || filters.channel === "All" || u.channel === filters.channel) &&
    (!filters.tier || filters.tier === "All" || u.tier === filters.tier)
  );
}

export function funnel(users) {
  return STAGES.map((stage, index) => {
    const count = index === 0 ? users.length : users.filter((u) => u.stage >= index).length;
    const previous = index === 0 ? users.length : users.filter((u) => u.stage >= index - 1).length;
    return {
      ...stage,
      index,
      count,
      stepRate: index === 0 ? 1 : ratio(count, previous),
      overallRate: ratio(count, users.length),
      dropped: Math.max(previous - count, 0)
    };
  });
}

export function summary(users) {
  const stages = funnel(users);
  const activated = stages[3].count;
  const paying = users.filter((u) => u.paid).length;
  const week4 = users.filter((u) => u.lastActiveWeek >= 4).length;
  return {
    signups: users.length,
    activated,
    activationRate: ratio(activated, users.length),
    week4Retention: ratio(week4, users.length),
    paying,
    syntheticMRR: paying * 29
  };
}

export function cohortRetention(users) {
  const groups = new Map();
  for (const u of users) {
    if (!groups.has(u.cohortDate)) groups.set(u.cohortDate, []);
    groups.get(u.cohortDate).push(u);
  }
  return Array.from(groups, ([date, cohortUsers]) => ({
    date,
    signups: cohortUsers.length,
    weeks: [0, 1, 2, 3, 4].map((week) =>
      week === 0 ? 1 : ratio(cohortUsers.filter((u) => u.lastActiveWeek >= week).length, cohortUsers.length)
    )
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export function weeklyActivation(users) {
  const groups = new Map();
  for (const u of users) {
    if (!groups.has(u.cohortDate)) groups.set(u.cohortDate, []);
    groups.get(u.cohortDate).push(u);
  }
  return Array.from(groups, ([date, cohortUsers]) => ({
    date,
    rate: ratio(cohortUsers.filter((u) => u.stage >= 3).length, cohortUsers.length),
    signups: cohortUsers.length
  })).sort((a, b) => a.date.localeCompare(b.date));
}

// Abramowitz-Stegun approximation, adequate for a clearly labelled demo readout.
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return sign * y;
}
function normalCdf(z) { return (1 + erf(z / Math.sqrt(2))) / 2; }
function twoSidedP(z) { return Math.min(1, 2 * (1 - normalCdf(Math.abs(z)))); }

export function experiment(users) {
  // Allocation is at signup. Demo treatment affects project creation, not workspace creation.
  const arm = (name) => {
    const eligible = users.filter((u) => u.arm === name && u.stage >= 1);
    const converted = eligible.filter((u) => u.stage >= 2).length;
    return { name, n: eligible.length, converted, rate: ratio(converted, eligible.length) };
  };
  const control = arm("Control");
  const guided = arm("Guided");
  const lift = guided.rate - control.rate;
  const relativeLift = control.rate > 0 ? lift / control.rate : 0;
  const se = Math.sqrt(ratio(guided.rate * (1 - guided.rate), guided.n) + ratio(control.rate * (1 - control.rate), control.n));
  const pooled = ratio(guided.converted + control.converted, guided.n + control.n);
  const pooledSe = Math.sqrt(pooled * (1 - pooled) * (ratio(1, guided.n) + ratio(1, control.n)));
  const pValue = pooledSe > 0 ? twoSidedP(lift / pooledSe) : 1;
  const srmZ = (guided.n + control.n) > 0 ? (guided.n - control.n) / Math.sqrt(guided.n + control.n) : 0;
  return {
    control,
    guided,
    absoluteLift: lift,
    relativeLift,
    confidence95: [lift - 1.96 * se, lift + 1.96 * se],
    pValue,
    srmPValue: twoSidedP(srmZ),
    significant: control.n >= 30 && guided.n >= 30 && pValue < 0.05,
    sufficientSample: control.n >= 30 && guided.n >= 30
  };
}

export function opportunities(users) {
  const steps = funnel(users);
  const mobile = users.filter((u) => u.device === "Mobile");
  const mobileLost = funnel(mobile)[1].dropped;
  return [
    { id: "templates", name: "Guided project templates", stageIndex: 1, category: "Onboarding", reach: steps[2].dropped, impact: 1.8, confidence: 0.82, effort: 3, detail: "Reduce blank-canvas anxiety at the workspace → project handoff.", evidence: "People leave before they have a first project." },
    { id: "mobile", name: "One-screen mobile setup", stageIndex: 0, category: "UX friction", reach: mobileLost, impact: 1.5, confidence: 0.73, effort: 4, detail: "Collapse setup into one accessible screen with a clear primary action.", evidence: "Mobile users lose momentum at workspace creation." },
    { id: "checklist", name: "First-value task checklist", stageIndex: 2, category: "Activation", reach: steps[3].dropped, impact: 1.4, confidence: 0.78, effort: 2.5, detail: "Offer three contextual starter steps that lead to a first completed task.", evidence: "Project creation is not the same as reaching first value." }
  ].map((o) => ({ ...o, rice: o.reach * o.impact * o.confidence / o.effort }))
    .sort((a, b) => b.rice - a.rice);
}

export function simulateImpact(users, stageIndex, recoveryPercent = 20, paidConversionPercent = 12, price = 29) {
  if (![0, 1, 2].includes(stageIndex)) throw new RangeError("Only pre-activation stages can be simulated");
  const rows = funnel(users);
  const entrants = rows[stageIndex].count;
  const lost = rows[stageIndex + 1].dropped;
  const recovered = lost * Math.min(100, Math.max(0, recoveryPercent)) / 100;
  const downstreamRate = ratio(rows[3].count, rows[stageIndex + 1].count);
  const additionalActivated = recovered * downstreamRate;
  const extraPaid = additionalActivated * Math.min(100, Math.max(0, paidConversionPercent)) / 100;
  return { entrants, lost, recovered, downstreamRate, additionalActivated, extraPaid, monthlyRevenue: extraPaid * price, annualRevenue: extraPaid * price * 12 };
}
