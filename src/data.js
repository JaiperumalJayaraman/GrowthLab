/**
 * GrowthLab demo fixture.
 * Every record is simulated and reproducible. No customer data is collected.
 */
const CHANNELS = ["Organic", "Paid", "Referral", "Content"];
const TIERS = ["Free", "Trial"];

function randomGenerator(seed) {
  let state = seed >>> 0;
  return function () {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedPick(rnd, values, weights) {
  const draw = rnd();
  let running = 0;
  for (let i = 0; i < weights.length; i += 1) {
    running += weights[i];
    if (draw < running) return values[i];
  }
  return values[values.length - 1];
}

export function generateUsers(count = 9600, seed = 20261124) {
  if (!Number.isInteger(count) || count < 0) throw new RangeError("count must be a non-negative integer");
  const rnd = randomGenerator(seed);
  const users = [];

  for (let i = 0; i < count; i += 1) {
    const cohort = i % 8;
    const date = new Date(Date.UTC(2026, 8, 7 + 7 * cohort));
    const channel = weightedPick(rnd, CHANNELS, [0.38, 0.23, 0.21, 0.18]);
    const tier = rnd() < 0.82 ? TIERS[0] : TIERS[1];
    const device = rnd() < 0.55 ? "Desktop" : "Mobile";
    const arm = i % 2 === 0 ? "Control" : "Guided";
    const mobile = device === "Mobile";
    const later = cohort >= 4 ? 0.025 : 0;
    let stage = 0;

    const workspaceRate = (mobile ? 0.67 : 0.81) + (channel === "Referral" ? 0.04 : 0) + later;
    if (rnd() < workspaceRate) stage = 1;

    const projectRate = (arm === "Guided" ? 0.74 : 0.63) - (mobile ? 0.05 : 0) + later;
    if (stage >= 1 && rnd() < projectRate) stage = 2;

    const taskRate = (mobile ? 0.69 : 0.75) + (tier === "Trial" ? 0.06 : 0);
    if (stage >= 2 && rnd() < taskRate) stage = 3;
    if (stage >= 3 && rnd() < 0.49) stage = 4;

    // Survival curves: a returning user in week 4 also returned in weeks 1–3.
    const churnDraw = rnd();
    let lastActiveWeek = 0;
    if (stage >= 3) {
      if (churnDraw < 0.33 + later) lastActiveWeek = 4;
      else if (churnDraw < 0.44 + later) lastActiveWeek = 3;
      else if (churnDraw < 0.53 + later) lastActiveWeek = 2;
      else if (churnDraw < 0.64 + later) lastActiveWeek = 1;
    }

    const paid = rnd() < (stage >= 3 ? 0.14 : 0.025);
    users.push({
      id: "GL-" + String(i + 1).padStart(5, "0"),
      cohort,
      cohortDate: date.toISOString().slice(0, 10),
      channel,
      tier,
      device,
      arm,
      stage,
      lastActiveWeek,
      paid
    });
  }
  return users;
}

export const DEMO_USERS = generateUsers();
export const DATA_DESCRIPTION = "9,600 synthetic SaaS signups across 8 weekly cohorts (Sep–Oct 2026).";
