import test from "node:test";
import assert from "node:assert/strict";
import { generateUsers } from "../src/data.js";
import { filterUsers, funnel, summary, cohortRetention, weeklyActivation, experiment, opportunities, simulateImpact } from "../src/analytics.js";

const users = generateUsers(9600);

test("seeded data is exactly reproducible", () => {
  assert.deepEqual(generateUsers(50, 99), generateUsers(50, 99));
  assert.notDeepEqual(generateUsers(50, 99), generateUsers(50, 100));
  assert.equal(new Set(users.map((u) => u.id)).size, 9600);
});

test("each funnel step is a subset of the prior step", () => {
  const rows = funnel(users);
  assert.equal(rows[0].count, 9600);
  rows.slice(1).forEach((step, i) => {
    assert.ok(step.count <= rows[i].count);
    assert.equal(step.dropped, rows[i].count - step.count);
    assert.ok(step.stepRate >= 0 && step.stepRate <= 1);
  });
  assert.equal(rows[3].count, summary(users).activated);
});

test("filters update data without changing the original records", () => {
  const subset = filterUsers(users, { device: "Mobile", channel: "Referral", tier: "Trial" });
  assert.ok(subset.length > 0 && subset.length < users.length);
  assert.ok(subset.every((u) => u.device === "Mobile" && u.channel === "Referral" && u.tier === "Trial"));
  assert.equal(users.length, 9600);
});

test("retention is bounded, nonincreasing, and cohort counts reconcile", () => {
  const cohorts = cohortRetention(users);
  assert.equal(cohorts.length, 8);
  assert.equal(cohorts.reduce((n, r) => n + r.signups, 0), users.length);
  cohorts.forEach((row) => {
    assert.equal(row.weeks[0], 1);
    row.weeks.slice(1).forEach((r, i) => assert.ok(r >= 0 && r <= row.weeks[i]));
  });
  assert.equal(weeklyActivation(users).length, 8);
});

test("A/B readout uses workspace entrants as denominators", () => {
  const result = experiment(users);
  assert.equal(result.control.n + result.guided.n, funnel(users)[1].count);
  assert.ok(result.guided.rate > result.control.rate);
  assert.ok(result.confidence95[0] <= result.absoluteLift && result.confidence95[1] >= result.absoluteLift);
  assert.ok(result.pValue >= 0 && result.pValue <= 1);
});

test("simulated revenue is a bounded transparent what-if, not observed uplift", () => {
  const noRecovery = simulateImpact(users, 1, 0, 12);
  const recovery = simulateImpact(users, 1, 20, 12);
  assert.equal(noRecovery.monthlyRevenue, 0);
  assert.ok(recovery.monthlyRevenue > 0);
  assert.ok(recovery.additionalActivated <= recovery.recovered);
  assert.equal(recovery.annualRevenue, recovery.monthlyRevenue * 12);
  assert.throws(() => simulateImpact(users, 4, 20), RangeError);
});

test("handles empty segments without NaN or crashes", () => {
  assert.equal(summary([]).activationRate, 0);
  assert.equal(experiment([]).pValue, 1);
  assert.equal(simulateImpact([], 1, 20).monthlyRevenue, 0);
  assert.deepEqual(cohortRetention([]), []);
  assert.deepEqual(opportunities([]).map((o) => o.rice), [0, 0, 0]);
});

test("RICE opportunities are sorted and based on observed simulated dropoffs", () => {
  const items = opportunities(users);
  assert.equal(items.length, 3);
  assert.ok(items[0].rice >= items[1].rice && items[1].rice >= items[2].rice);
  assert.ok(items.every((o) => Number.isFinite(o.rice) && o.effort > 0));
});
