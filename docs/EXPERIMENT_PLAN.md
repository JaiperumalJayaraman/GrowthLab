# GrowthLab — Experiment: Guided project templates

**Status:** Proposed research design illustrated by simulated treatment and control records. No actual randomized trial was conducted.

## Hypothesis

If new workspace creators see three optional starter templates, more will create their first project, because the blank canvas becomes a recognizable set of actions rather than an unstructured decision.

This is a falsifiable hypothesis, not an observed product finding.

## Variant design

| Arm | Experience |
| --- | --- |
| A / Control | Empty project creation screen: user invents project and first task |
| B / Guided | Three context-specific starter templates; task prefill; opt-out to blank project |

Try the experiences in the working UX prototype: ../prototype.html.

## Eligibility and assignment

Randomize 50/50 at signup using persistent assignment, but expose the project templates only **after workspace creation**. The primary readout uses workspace creators as eligible users.

This conditioning is safe from post-treatment selection only if the treatment truly cannot affect workspace creation. If it can, use intent-to-treat metrics for all randomized users. Real analysis must separately inspect assignment integrity and exposure logs.

## Outcomes

- **Primary leading metric:** First-project creation / workspace creators.
- **Key secondary:** First-task activation / all randomized signups.
- **Guardrails:** Week-1 and week-4 retention, setup abandonment, invitation rate, accessibility, latency, error rate, and user trust.
- **Do not optimize:** Number of clicks or project starts at the expense of actual value.

## Test design

- Statistical test: two-sided, two-proportion z-test.
- Alpha: 0.05; target power: 80%.
- Decision scale: absolute percentage-point difference, not just relative uplift.
- Report sample sizes and 95% confidence interval.
- Run a sample ratio mismatch check for assignment and eligibility; investigate p under .01.
- Predeclare a sample-size target and stopping rule. Do not stop at the first favorable p-value.
- Predeclare mobile-vs-desktop subgroup analysis; avoid uncorrected multiple comparisons.

### Illustrative sample planning

Assume p0 = .63, a meaningful change to p1 = .68, alpha = .05 two-sided, and power = .80.

Approximate eligible sample size per arm:

n ≈ [1.96 × sqrt(2 × .655 × .345) + .84 × sqrt(.63 × .37 + .68 × .32)]² / (.05)² ≈ **1,420 users per arm**.

This is an **example calculation**, not an actual sample obtained. A production plan must account for eligible traffic, duration, missing data, and final analytical method.

## Interpretation and decision gates

1. Check assignment, exposure, and missing-event integrity first.
2. Determine whether the lift is **practically** as well as statistically meaningful.
3. Check activation and retention guardrails. A larger project-conversion rate with declining first-task activation is not success.
4. Compare value with engineering and maintenance cost.
5. If inconclusive, complete the planned sample or revisit the hypothesis; do not present a filtered subgroup as a definitive win.

The current dashboard uses a normal-approximation interval and pooled z-test. Small samples and boundary rates call for a better analysis design.

## Why the synthetic readout is not evidence

The fixture generator directly makes the guided variant more likely to create a project. Therefore, the simulated difference is expected **by construction**. This readout shows how a PM can analyze and challenge evidence; it does not validate the effect on a real SaaS user population.

The incremental-MRR slider is likewise a transparent assumption exercise, not a causal revenue effect identified by this test.

## Interview challenges

- What if the primary metric rises but week-4 retention falls?
- Why randomize at signup if treatment starts at workspace creation?
- How would you measure time to first value accurately?
- How would you protect expert users from an intrusive template chooser?
- What would you do if mobile lift looked stronger but was underpowered?
