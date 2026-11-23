# GrowthLab — A product decision from first-run friction

> Portfolio case study. All users, experiments, engagement, and financials are **synthetic**. No customer validation or real rollout is claimed.

## 30-second pitch

**Product:** Flowboard, a fictional team-work management SaaS.
**Problem:** New users complete signup but can struggle to reach their first useful task.
**Opportunity:** An optional guided first-project experience may reduce blank-canvas friction.
**Work delivered:** A functional onboarding A/B UX prototype, a reproducible 9,600-user event fixture, a segmented product analytics dashboard, an experiment plan, and an assumption-driven opportunity prioritization tool.
**Decision:** Recommend validating guided templates through qualitative research and a real controlled test before shipping.

## 1. Start with the job, not the feature

A small-team operator wants to organize work and see momentum immediately. Blank onboarding asks them to define their entire structure before receiving value.

**Hypotheses:** Initial uncertainty causes abandonment; some users may benefit from contextual starter templates; more project creation could lead to more first tasks. None of these has been validated through interviews in this project.

## 2. Make the outcome explicit

GrowthLab uses first-task creation as its demo north-star activation proxy. The funnel separates signup, workspace, first project, first task, and team invitation. This prevents acquisition volume from masking first-value friction.

The dashboard uses **9,600 generated users in eight weekly cohorts**, with responsive filters for device, acquisition, and plan. This is a transparent reproducible simulation—not production telemetry.

## 3. Understand the funnel

In the dashboard's User journey section, clicking a stage reveals the denominator, user loss, and a possible design intervention.

The generator includes more mobile setup friction, a deliberately higher project-conversion rate in the guided group, and declining week-by-week retention. These are authored assumptions to demonstrate product analysis—not discoveries from real users.

## 4. Prototype the user experience

Try prototype.html.

**Control:** Users create a workspace, invent a first project, and write their first task.

**Guided:** Users create a workspace, select a starter template, can opt out, and edit a prefilled first task.

The prototype records a *local, downloadable walkthrough trace*, separate from synthetic dashboard events. No signup, outbound email, or backend is involved.

**UX concepts:** progressive disclosure, reducing choice overload, recognition over recall, expert opt-out, and deferring invitations until after first value.

## 5. Design a defensible experiment

The dashboard shows eligible users, conversion by arm, absolute lift, an approximate 95% confidence interval, a two-sided p-value, and a sample-ratio diagnostic.

**Why honesty matters:** The seeded data generator encodes improved guided-project conversion. Statistical significance in a constructed simulation is not evidence that actual users will respond that way.

A real experiment would also require event timestamps, exposure logging, predeclared sample and stopping rules, assignment QA, and activation and retention guardrails. See EXPERIMENT_PLAN.md.

## 6. Choose the opportunity, not the prettiest feature

The opportunity board compares:

| Candidate | Friction solved | Trade-off |
| --- | --- | --- |
| Starter project templates | Blank workspace → first project | Could constrain experts |
| One-screen mobile workspace setup | Signup → workspace | More engineering work |
| First-task checklist | Project → first task | Risks becoming intrusive |

The dashboard's RICE ranking is a **heuristic** based on synthetic drop-off counts and assumed impact, confidence, and effort. It supports prioritization discussion, not guaranteed ROI.

The scenario model multiplies selected drop-offs, an assumed recoverable fraction, remaining activation conversion, assumed paid-conversion, and fictional $29 monthly price. It is a sensitivity analysis, not a forecast or measured treatment effect.

## 7. What would happen next at a real company

1. Conduct 5–8 moderated first-run sessions with the target persona.
2. Instrument real signup-to-task events, timestamps, and exposure.
3. Diagnose differences by platform, tenure, and acquisition quality.
4. Test the smallest optional guided-template change with a preregistered experiment.
5. Ship only if the change produces meaningful first-task activation without harming retention or trust.

## 8. What recruiters can evaluate

**UX:** Clear problem framing, before/after flow, first-value focus, opt-out and accessibility.

**Tech:** Reproducible simulation, event-level logic, cohort calculations, testable analysis, real interactive flow, and client-only privacy.

**Business:** North star, opportunity sizing, RICE trade-offs, paid conversion sensitivity, experiment guardrails.

**PM communication:** Problem → evidence → prototype → experiment → prioritized decision.

## A 90-second demo script

“GrowthLab investigates why SaaS users sign up but don't reach their first task. I start with a north-star activation metric, then inspect the conversion funnel and segment mobile users to identify likely friction. I also built an interactive before-and-after onboarding prototype, so you can experience a blank project and a guided template flow yourself. Next, I framed that design change as a falsifiable experiment and show the statistical readout with its limitations. Finally, the decision board compares three interventions and lets you challenge the revenue assumptions. The data is intentionally synthetic: the project demonstrates the way I reason about product choices and the evidence I'd collect before shipping.”

## Implementation map

- Dashboard: ../index.html
- Guided vs control experience: ../prototype.html
- Reproducible fixture: ../src/data.js
- Analytics math: ../src/analytics.js
- Browser app: ../src/app.js
- UX prototype state machine: ../src/prototype.js
- Automated analytics assertions: ../tests/analytics.test.mjs

Run locally with **npm run dev** and **npm test**. Node.js 18+; no npm packages required.
