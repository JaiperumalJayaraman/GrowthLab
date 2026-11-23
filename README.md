# GrowthLab — SaaS Growth Decision Studio

**A working APM portfolio project about finding and fixing SaaS onboarding friction.**

GrowthLab turns a synthetic, reproducible user journey dataset into product decisions: conversion funnels, segmented behavior, cohort retention, an illustrative A/B experiment, and a transparent what-if revenue model.

> **Data integrity:** All users, experiments and business outcomes in this repository are **simulated**. They are not observations from a real company or evidence of real uplift.

## The product question

**Why do newly signed-up teams fail to reach their first meaningful task, and which intervention should a product manager prioritize?**

Instead of a generic analytics dashboard, GrowthLab connects a user problem to evidence, a scoped feature hypothesis, experiment design, and a business trade-off.

## Run locally

Requires **Node.js 18+**. No dependencies, environment variables, API keys, or sign-up required.

```bash
npm run dev
```

Open **http://localhost:4173** in your browser.

Run the analytics test suite:

```bash
npm test
```

For a deployed demo, the site is entirely static and can be published using GitHub Pages from the repository root (choose **Settings → Pages → Deploy from a branch → main → /(root)**).

## What to explore

| Workspace | What it demonstrates |
| --- | --- |
| Growth overview | Activation and acquisition trends from reproducible user events |
| Onboarding funnel | Step-wise conversion, friction, and selectable diagnosis |
| Retention cohorts | Week 1–4 retention by signup cohort |
| Experiment readout | Control vs guided onboarding with lift, confidence interval, and sample-ratio check |
| Decision lab | Opportunity scoring and an editable, assumption-based impact model |
| Product brief | North-star metric, personas, UX opportunities, and explicit trade-offs |

**Filters are functional:** device, acquisition channel, and customer tier update the analytical views. Metrics can be exported as CSV. A PM hypothesis can be saved locally in your browser.

## Technology

Vanilla HTML/CSS and ES modules, deterministic seeded synthetic data, a pure analytics module with Node's built-in test runner, and a tiny zero-dependency development server. No fake AI calls or paid services.

## PM case-study artifacts

- [Product requirements & UX decisions](docs/PRD.md)
- [Experiment specification & interpretation guardrails](docs/EXPERIMENT_PLAN.md)
- [Recruiter-friendly case study and decisions](docs/CASE_STUDY.md)

## Definitions and limits

- **Activation:** completion of the first task after signup (in the illustrative onboarding journey).
- **Week-N retention:** a simulated activated user returning in week N; non-activated users count as not retained.
- **Experiment conversion:** workspace-created users who go on to create their first project.
- **Estimated MRR:** model-based activated users × illustrative paid conversion rate × a monthly price assumption. This is **not real revenue**.
- Simulated cohorts and treatments deliberately illustrate decision-making; they do not constitute evidence of causal product impact, market demand, or statistical validity in a deployed product.

## Author

Built as a product management portfolio demonstration emphasizing **user experience, engineering feasibility, analytics, and commercial prioritization**.
