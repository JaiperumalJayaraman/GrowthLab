# GrowthLab — Product Requirements Document

**Portfolio project:** GrowthLab SaaS Growth Decision Studio
**Fictional product:** Flowboard, a team-work management SaaS
**Status:** Functional demo with synthetic data; not a real product launch

## 1. Problem

New team leads sign up for workflow software and encounter an empty workspace. Before experiencing any value, they must decide how to organize a project and which task to create. Some leave early. Buying more acquisition does not fix first-value friction.

**Core question:** Where do people stop between signup and first task, and which minimal intervention deserves testing?

## 2. Target customer and job

- **Hypothetical persona:** Startup founder, project lead, or small-team operator new to the tool.
- **Job to be done:** “Help me organize our first project and take a useful action quickly.”
- **Pain:** Ambiguous first steps, blank-canvas anxiety, excessive configuration.
- **Value moment:** The first meaningful task is created.
- **Evidence status:** These are hypotheses. No interviews or user research were conducted.

Proposed research before production: 5–8 moderated usability sessions, session analysis, and interviews with activated and abandoned users.

## 3. North star and guardrails

| Metric | Definition | Purpose |
| --- | --- | --- |
| Activation | First-task creators / all signups | North-star proxy |
| Workspace conversion | Workspace creators / signups | Setup friction |
| Project conversion | First-project creators / workspace creators | Blank-canvas friction |
| Week-4 signup retention | Week-4 returning users / all signups | Continued value |
| Team invitation rate | Inviting users / activated users | Collaborative use |
| Synthetic MRR | Generated paying users × $29/month | Demonstration only |

The synthetic records model an ordered onboarding journey, not timestamped production events. A real activation definition would specify first-task completion **within seven days of signup**, with event timestamps.

## 4. User stories and delivered features

1. As a PM, I can filter by device, acquisition channel, and plan. All KPIs and analyses update together.
2. As a PM, I can click each onboarding funnel step to inspect its denominator, drop-off and potential UX solution.
3. As a PM, I can compare signup cohorts across weeks 0–4 without conflating them with activated-only retention.
4. As a PM, I can inspect an illustrative A/B test with conversion rates, lift, approximate 95% CI, p-value, and sample ratio diagnostic.
5. As a PM, I can compare opportunities using an explicit RICE heuristic and vary the assumed business impact.
6. As a first-time user, I can try a real control-vs-guided onboarding experience in a separate prototype.
7. As an evaluator, I can export aggregate synthetic metrics or local prototype events without creating an account.
8. As a PM, I can save a hypothesis locally in the browser.

## 5. UX decisions

| Design choice | User-centered logic | Trade-off |
| --- | --- | --- |
| Three optional starter templates | Reduce initial decision load | Fewer preset use cases |
| Preserve the blank path | Allow expert autonomy | Another visible choice |
| Defer invitation until after first task | Prioritize individual value | Team adoption happens later |
| Clearly label all denominators | Avoid misleading percent-only metrics | Slightly denser dashboard |
| Mark synthetic data visibly | Maintain evidence integrity | Cannot claim real uplift |

Responsive layout, semantic buttons, keyboard focus, input labels, reduced-motion support, and text alongside color form the accessibility baseline.

## 6. Production instrumentation specification (proposed)

Each recorded event would include:
- event_id: UUID for deduplication
- user_id: stable pseudonymous identifier
- timestamp: UTC ISO8601
- event_name: one of signup_completed, workspace_created, first_project_created, first_task_created, teammate_invite_sent, session_started, project_template_selected, template_skipped
- experiment_id and variant: stable assignment
- exposure_at: timestamp when the variant was shown
- device, acquisition_channel, workspace_id: analysis dimensions

Production analysis would count only the first qualifying event per user, specify an eligibility window, and exclude internal testers using rules decided in advance.

**The current prototype event trace is generated only in the user's browser and is not connected to the synthetic dashboard fixture.**

## 7. Architecture and non-goals

- HTML/CSS and browser ES modules; no paid provider or API keys.
- Reproducible seeded demo dataset in src/data.js: 9,600 signups, 8 weekly cohorts.
- Pure calculation module in src/analytics.js, tested by the Node built-in test runner.
- Stateful views in src/app.js and UX experiment walkthrough in src/prototype.js.
- Zero-dependency local development server; browser localStorage only for the user's optional hypothesis note.

No live users, payments, outbound invitations, backend tracking, claimed AI model, or actual randomized field test.

## 8. Acceptance criteria

- [x] Synthetic-data origin is visible throughout.
- [x] Filters update all decision views.
- [x] Funnel steps are monotonic with transparent denominators.
- [x] Week 0–4 retention is available by weekly cohort.
- [x] Experiment includes sample sizes, CI, p-value, and sample ratio warning.
- [x] Zero recovery yields zero incremental scenario revenue.
- [x] Both onboarding UX variants reach a simulated first-task success state.
- [x] Markdown PRD, experiment plan, and product narrative are included.
- [ ] Conduct actual research and a real randomized test before making performance claims.

## 9. Risks and rollout plan

**Risks:** Synthetic data embeds expected effects; segment behavior may differ from real users; improved project creation may not increase activation; financial estimates are highly assumption-sensitive.

**Next steps:** Research → instrument baseline → iterate smallest treatment → QA randomization and exposure → preregister test → monitor activation and retention → decide rollout based on real evidence.
