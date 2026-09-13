# Executive Summary

Date of this snapshot: **April 6, 2026**.

## What This Demo Is

The Individual Demo is a working model of coordinated services where:

- one person can move across many organizations,
- each organization keeps its own records,
- data sharing is controlled by permissioned steps,
- handoffs are visible and auditable.

It is designed to show how cross-agency coordination can improve without creating one giant shared database.

## What This Demo Proves

## 1) Person-controlled coordination is practical

- The person can move through health, housing, legal, benefits, and support workflows.
- Handoffs are explicit (referrals and record access passes), not hidden.

## 2) Identity and document readiness can be unified

- Common identity/proof documents can be converted into digital credentials.
- Providers can require specific credential categories before selected actions proceed.

## 3) Accountability can exist without exposing full personal records

- The demo includes non-identifiable audit export.
- Tutorial activity can be reviewed through the resident-controlled event history and non-identifiable export.

## 4) Provider autonomy and interoperability can coexist

- Every organization keeps an independent interface, API surface, policy, and trust configuration while the resident-selected Solid pod remains authoritative for tutorial state.
- Cross-provider exchange is modeled as consented, reviewable transactions.

## Why This Matters

In real communities, service pathways often fail at handoffs: repeated intake, missing documents, unclear consent state, and unclear accountability.

This demo shows a practical alternative:

- fewer repeated document checks,
- clearer responsibility at each step,
- stronger transparency around who did what, when, and why.

## What This Demo Is Not

- Not a production deployment.
- Not a full EHR/HMIS/claims platform.
- Not legal or clinical decision automation.
- Not a default HIPAA-compliant operational system for live PHI.

## Current Delivery Modes

- Local Docker Compose mode for the website, webapp, Solid server, and organization fleet.
- Cloudflare mode for static sites, organization Workers, and the CSS container wrapper.

## Decision Guidance

- Use this demo for architecture validation, stakeholder education, workflow design, and interoperability prototyping.
- Do not use this demo unchanged for live regulated operations.
- For production planning, use:
  - `docs/compliance-baseline.md`
  - `docs/production-hardening-checklist.md`
