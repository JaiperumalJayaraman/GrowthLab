import { DEMO_USERS } from "./data.js";
import { filterUsers, funnel, summary, cohortRetention, weeklyActivation, experiment, opportunities, simulateImpact, STAGES } from "./analytics.js";

// Deliberately dependency-free: all calculations are reproducible, with no data leaving the browser.
const state = { device: "All", channel: "All", tier: "All", selectedStage: 1, scenarioStage: 1, recovery: 20, paid: 12, selectedOpportunity: "templates" };
const byId = (id) => document.getElementById(id);
const number = (n) => Math.round(n).toLocaleString("en-US");
const percent = (p, digits = 1) => (100 * p).toFixed(digits) + "%";
const dollars = (n) => "$" + Math.round(n).toLocaleString("en-US");
const point = (n) => (n >= 0 ? "+" : "") + (100 * n).toFixed(1) + " pp";
const dateLabel = (date) => new Date(date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

let visible = DEMO_USERS;
let toastTimeout;

function notify(message) {
  const box = byId("toast");
  box.textContent = message;
  box.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => box.classList.remove("visible"), 3000);
}

function paintSummary(users) {
  const metrics = summary(users);
  byId("audience-count").textContent = "· " + number(users.length) + " users selected";
  byId("kpi-signups").textContent = number(metrics.signups);
  byId("kpi-activation").textContent = percent(metrics.activationRate);
  byId("kpi-retention").textContent = percent(metrics.week4Retention);
  byId("kpi-revenue").textContent = dollars(metrics.syntheticMRR);
  byId("activation-count").textContent = number(metrics.activated) + " activated";
  byId("insight-activated").textContent = number(metrics.activated);
}

function paintTrend(users) {
  const rows = weeklyActivation(users);
  const width = 680, height = 230, left = 43, right = 24, top = 14, bottom = 33;
  const pw = width - left - right, ph = height - top - bottom;
  const yMin = 0, yMax = 0.6;
  const x = (i) => left + (rows.length < 2 ? pw / 2 : (i / (rows.length - 1)) * pw);
  const y = (v) => top + (1 - (v - yMin) / (yMax - yMin)) * ph;
  const parts = [];
  parts.push('<svg viewBox="0 0 680 230" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">');
  parts.push('<defs><linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#7665ed" stop-opacity=".2"/><stop offset="100%" stop-color="#7665ed" stop-opacity="0"/></linearGradient></defs>');
  for (let v = 0; v <= 0.6 + 0.001; v += 0.15) {
    parts.push('<line x1="' + left + '" y1="' + y(v) + '" x2="' + (width - right) + '" y2="' + y(v) + '" stroke="#eceef5" stroke-dasharray="4 5"/>');
    parts.push('<text x="' + (left - 10) + '" y="' + (y(v) + 4) + '" font-size="10" text-anchor="end" fill="#a1abba">' + Math.round(v * 100) + '%</text>');
  }
  if (rows.length) {
    const coords = rows.map((r, i) => [x(i), y(r.rate)]);
    const line = coords.map((p, i) => (i ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2)).join(" ");
    const area = line + " L" + coords[coords.length - 1][0] + " " + y(0) + " L" + coords[0][0] + " " + y(0) + " Z";
    parts.push('<path d="' + area + '" fill="url(#area-fill)"/>');
    parts.push('<path d="' + line + '" stroke="#6c5cec" fill="none" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>');
    coords.forEach((p, i) => {
      parts.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5" fill="#fff" stroke="#6c5cec" stroke-width="2.5"><title>' + dateLabel(rows[i].date) + ": " + percent(rows[i].rate) + '</title></circle>');
      parts.push('<text x="' + p[0] + '" y="' + (height - 9) + '" font-size="10" text-anchor="middle" fill="#a1abba">' + dateLabel(rows[i].date) + '</text>');
    });
  }
  parts.push("</svg>");
  byId("trend-chart").innerHTML = parts.join("");
  byId("trend-caption").textContent = rows.length ? "Latest cohort: " + percent(rows[rows.length - 1].rate) : "No data";
}

function paintFunnel(users) {
  const rows = funnel(users);
  byId("funnel-rows").innerHTML = rows.map((r) =>
    '<button type="button" class="funnel-step' + (r.index === state.selectedStage ? ' active' : '') + '" data-step="' + r.index + '" aria-pressed="' + (r.index === state.selectedStage) + '">' +
    '<div class="funnel-step-main"><span class="funnel-step-title"><span class="step-index">' + String(r.index + 1).padStart(2, "0") + '</span>' + r.label + '</span><span class="funnel-step-count">' + number(r.count) + '</span></div>' +
    '<div class="funnel-track"><div class="funnel-fill" style="width:' + (r.overallRate * 100).toFixed(2) + '%"></div></div>' +
    '<div class="funnel-step-bottom"><span>' + percent(r.overallRate) + ' of signups</span><strong>' + (r.index === 0 ? 'Starting point' : percent(r.stepRate) + ' from prior step') + '</strong></div></button>'
  ).join("");
  document.querySelectorAll("[data-step]").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.step);
    state.selectedStage = index;
    if (index <= 2) { state.scenarioStage = index; state.selectedOpportunity = ""; byId("scenario-stage").value = String(index); }
    paintFunnel(visible);
    paintInsight(visible);
    paintOpportunities(visible);
    paintScenario(visible);
  }));
}

const stepIdeas = [
  "Review channel intent and landing-page promise before trying to increase acquisition spend.",
  "Shorten required fields, show the end state, and create a usable workspace in one pass.",
  "Offer three task-oriented starter templates, make skip visible, and measure first-project creation.",
  "Add an optional, contextual first-task checklist instead of adding more dashboard widgets.",
  "Ask for teammates only after a user has experienced individual value; make inviting optional."
];
const insightTitles = [
  "Is the right user arriving?",
  "Setup should feel effortless.",
  "The blank canvas problem.",
  "Give users a first win.",
  "Earn the team invitation."
];

function paintInsight(users) {
  const stage = state.selectedStage;
  const row = funnel(users)[stage];
  const dropped = row.dropped;
  const title = insightTitles[stage];
  const metric = stage === 0 ? number(row.count) : number(dropped);
  const label = stage === 0 ? "people entered the journey" : "people did not reach this step";
  const question = STAGES[stage].question;
  byId("step-insight").innerHTML =
    '<div><h3>' + title + '</h3><p>' + question + '</p>' +
    '<div class="diagnosis-number">' + metric + '</div><div class="diagnosis-metric">' + label + (stage === 0 ? '' : ' · ' + percent(1 - row.stepRate) + ' drop-off') + '</div>' +
    '<div class="diagnosis-action"><strong>PRODUCT OPPORTUNITY</strong><span>' + stepIdeas[stage] + '</span><a href="./prototype.html" class="try-prototype">Try the interactive onboarding prototype ↗</a></div></div>';
}

function paintRetention(users) {
  const rows = cohortRetention(users);
  if (!rows.length) { byId("cohort-table").textContent = "No cohorts match these filters."; return; }
  let html = '<table class="cohort-table"><thead><tr><th>Signup cohort</th><th>Users</th><th>W0</th><th>W1</th><th>W2</th><th>W3</th><th>W4</th></tr></thead><tbody>';
  rows.forEach((row) => {
    html += "<tr><td>Week of " + dateLabel(row.date) + '</td><td class="cohort-signups">' + number(row.signups) + "</td>";
    row.weeks.forEach((r) => {
      const alpha = (0.09 + r * 0.47).toFixed(3);
      html += '<td style="background:rgba(106,88,231,' + alpha + ');color:' + (r > 0.52 ? "#ffffff" : "#51478c") + '">' + percent(r, 0) + "</td>";
    });
    html += "</tr>";
  });
  html += "</tbody></table>";
  byId("cohort-table").innerHTML = html;
}

function paintExperiment(users) {
  const r = experiment(users);
  byId("control-rate").textContent = percent(r.control.rate);
  byId("guided-rate").textContent = percent(r.guided.rate);
  byId("control-sample").textContent = number(r.control.converted) + " / " + number(r.control.n) + " eligible users";
  byId("guided-sample").textContent = number(r.guided.converted) + " / " + number(r.guided.n) + " eligible users";
  byId("control-bar").style.width = (100 * r.control.rate) + "%";
  byId("guided-bar").style.width = (100 * r.guided.rate) + "%";
  byId("experiment-lift").textContent = point(r.absoluteLift);
  byId("experiment-ci").textContent = point(r.confidence95[0]) + " to " + point(r.confidence95[1]);
  byId("experiment-p").textContent = r.pValue < 0.001 ? "< 0.001" : r.pValue.toFixed(3);
  byId("experiment-srm").textContent = r.srmPValue < 0.01 ? "Flag (p < .01)" : "No flag";
  byId("experiment-verdict").textContent = !r.sufficientSample ? "NOT ENOUGH DATA" : r.srmPValue < 0.01 ? "CHECK ALLOCATION" : r.significant ? "DIRECTIONAL SIGNAL • DEMO" : "INCONCLUSIVE • DEMO";
}

function paintOpportunities(users) {
  const items = opportunities(users);
  byId("opportunity-list").innerHTML = items.map((item, index) =>
    '<button type="button" class="opportunity-card' + (item.id === state.selectedOpportunity ? " active" : "") + '" data-opportunity="' + item.id + '">' +
    '<div class="opportunity-main"><span class="opportunity-rank">' + String(index + 1).padStart(2, "0") + '</span><span class="opportunity-copy"><strong>' + item.name + '</strong><small>' + item.detail + '</small></span>' +
    '<span class="opportunity-score">' + number(item.rice) + '<small>RICE SCORE</small></span></div>' +
    '<div class="opportunity-meta"><span>' + item.category + '</span><span>' + number(item.reach) + ' users at risk</span><span>Effort ' + item.effort + '</span></div></button>'
  ).join("");
  document.querySelectorAll("[data-opportunity]").forEach((button) => button.addEventListener("click", () => {
    const chosen = items.find((x) => x.id === button.dataset.opportunity);
    if (!chosen) return;
    state.selectedOpportunity = chosen.id;
    state.selectedStage = chosen.stageIndex;
    state.scenarioStage = chosen.stageIndex;
    byId("scenario-stage").value = String(chosen.stageIndex);
    paintOpportunities(visible);
    paintFunnel(visible);
    paintInsight(visible);
    paintScenario(visible);
    notify("Scenario updated for " + chosen.name);
  }));
}

function paintScenario(users) {
  const calc = simulateImpact(users, state.scenarioStage, state.recovery, state.paid);
  byId("recovery-value").textContent = state.recovery + "%";
  byId("paid-value").textContent = state.paid + "%";
  byId("scenario-mrr").textContent = dollars(calc.monthlyRevenue);
  byId("scenario-details").textContent = number(calc.lost) + " drop-offs × " + state.recovery + "% recovered × " + percent(calc.downstreamRate) + " downstream activation → ~" + number(calc.additionalActivated) + " new activated users";
}

function repaint() {
  visible = filterUsers(DEMO_USERS, state);
  paintSummary(visible);
  paintTrend(visible);
  paintFunnel(visible);
  paintInsight(visible);
  paintRetention(visible);
  paintExperiment(visible);
  paintOpportunities(visible);
  paintScenario(visible);
}

function csvCell(v) {
  const s = String(v);
  return '"' + s.replaceAll('"', '""') + '"';
}
function exportMetrics() {
  const f = funnel(visible);
  const s = summary(visible);
  const e = experiment(visible);
  const rows = [
    ["kind", "metric", "value"],
    ["metadata", "data_type", "SYNTHETIC"],
    ["filter", "device", state.device], ["filter", "channel", state.channel], ["filter", "tier", state.tier],
    ["kpi", "signups", s.signups], ["kpi", "activated", s.activated], ["kpi", "activation_rate", s.activationRate],
    ["kpi", "week4_retention_all_signups", s.week4Retention], ["kpi", "synthetic_mrr_usd", s.syntheticMRR],
    ["experiment", "control_workspace_eligible", e.control.n], ["experiment", "control_project_conversion", e.control.rate],
    ["experiment", "guided_workspace_eligible", e.guided.n], ["experiment", "guided_project_conversion", e.guided.rate],
    ["experiment", "p_value", e.pValue], ["experiment", "srm_p_value", e.srmPValue],
    ...f.map((r) => ["funnel", r.short.toLowerCase().replaceAll(" ", "_"), r.count]),
    ...cohortRetention(visible).flatMap((c) => c.weeks.map((r, i) => ["cohort_" + c.date, "week_" + i + "_retention", r]))
  ];
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "growthlab-synthetic-metrics.csv";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify("Filtered synthetic metrics exported");
}

function setup() {
  ["device", "channel", "tier"].forEach((filter) => byId(filter + "-filter").addEventListener("change", (event) => {
    state[filter] = event.target.value;
    repaint();
  }));
  byId("reset-filters").addEventListener("click", () => {
    ["device", "channel", "tier"].forEach((filter) => { state[filter] = "All"; byId(filter + "-filter").value = "All"; });
    repaint();
    notify("Showing all 9,600 synthetic users");
  });
  byId("scenario-stage").value = String(state.scenarioStage);
  byId("scenario-stage").addEventListener("change", (event) => {
    state.scenarioStage = Number(event.target.value);
    state.selectedStage = state.scenarioStage;
    state.selectedOpportunity = "";
    paintScenario(visible);
    paintOpportunities(visible);
    paintFunnel(visible);
    paintInsight(visible);
  });
  byId("recovery-slider").addEventListener("input", (event) => { state.recovery = Number(event.target.value); paintScenario(visible); });
  byId("paid-slider").addEventListener("input", (event) => { state.paid = Number(event.target.value); paintScenario(visible); });
  byId("export-button").addEventListener("click", exportMetrics);
  try {
    const note = localStorage.getItem("growthlab-hypothesis-v1");
    if (note) { byId("hypothesis-note").value = note; byId("hypothesis-status").textContent = "Your saved hypothesis"; }
  } catch { byId("hypothesis-status").textContent = "Local storage is unavailable"; }
  byId("save-hypothesis").addEventListener("click", () => {
    const text = byId("hypothesis-note").value.trim();
    if (!text) { notify("Write a hypothesis before saving"); return; }
    try {
      localStorage.setItem("growthlab-hypothesis-v1", text);
      byId("hypothesis-status").textContent = "Saved locally";
      notify("Hypothesis saved on this device");
    } catch { byId("hypothesis-status").textContent = "Could not save in this browser"; notify("Local storage is unavailable"); }
  });
  document.querySelectorAll("[data-nav]").forEach((link) => link.addEventListener("click", () => {
    document.querySelectorAll("[data-nav]").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  }));
  repaint();
}
setup();
