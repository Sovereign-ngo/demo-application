# Compliance Baseline (Demo Capacity)

This document defines what is currently acceptable in **demo mode** and what must change before any production or real-world sensitive data use.

Date of this snapshot: **April 6, 2026**.

## Scope

- Primary scope: `webapp/tutorial/individual/` and its supporting tutorial tools.
- Deployment contexts:
  - local Docker Compose over `http://localhost` ports,
  - Cloudflare static assets, Workers, and the CSS container wrapper.
- This baseline assumes **synthetic demo data only**.

## What Is Already Enforced In Demo

### 1) Explicit consent and handoff model

- Consent can be granted and revoked.
- Referrals are explicit and auditable.
- Cross-provider record access pass flow is explicit and scoped.

### 2) Credential policy modeling

- Organization policies declare proof formats, algorithms, required claims, issuer relationships, subject matching, validity, and status requirements.
- These policies demonstrate the intended contract; the current Worker does not enforce production-grade cryptographic verification.

### 3) Resident-controlled tutorial event history

- Demo events are written to the selected Solid pod with the rest of the tutorial state.
- A durable organization-side audit ledger is not implemented.

### 4) Deployment transport

- Local Compose intentionally uses loopback HTTP.
- Cloudflare custom domains terminate public TLS at the edge.

### 5) Solid authentication

- Community Solid Server provides account management and Solid-OIDC authentication for pod access.

### 6) Non-identifiable export path for accountability

- Individual view supports non-identifiable audit export for demonstration of accountability without raw source-document disclosure.

### 7) Explicit organization trust declarations

- Every organization owns a trust manifest and exposes it through `/trust`.
- Trust declarations are demo metadata and are not yet a production trust registry.

## Demo-Only Controls (Not Production Compliant)

### 1) Authentication model is not production identity assurance

- Login is selection-based in UI (no production IAM, no MFA, no hardware-backed auth).

### 2) Organization API authorization is incomplete

- The organization Worker currently accepts presentation JSON without authenticating the calling service or enforcing the declared verification policy.

### 3) Replay protection is partial

- Challenge/nonce consistency is checked, but there is no persistent nonce/jti replay ledger.

### 4) Key custody is not production-grade

- Demo credential construction occurs in browser code and is not backed by managed issuer keys.

### 5) Privacy minimization is not strict in interactive screens

- Service views still expose human-readable identifiers and raw event feeds.

### 6) Live trust and status infrastructure is absent

- Status-list references are illustrative and no production DID resolver, issuer registry, or status service is included.

### 7) Administrative and operational controls are incomplete

- No production BAA workflow,
- no full retention/legal-hold policy enforcement in runtime,
- no formal incident SLAs wired into runtime controls,
- no formalized least-privilege IAM model for each operational actor.

## HIPAA-Oriented Interpretation For This Demo

- This demo can be used to explain HIPAA-relevant design patterns (minimum necessary sharing, consented flows, auditable exchanges).
- It is **not HIPAA compliant by default for live PHI operations**.
- Treat the entire demo as non-production unless the hardening checklist is completed and validated.

## Go / No-Go Rule

- **Go (demo use):** synthetic data, workshop/training, architecture validation, interoperability prototyping.
- **No-Go (production use):** real PHI/PII, real claims operations, real clinical/legal decisions, regulated operational deployment.

## Next Document

Use `docs/production-hardening-checklist.md` as the implementation plan for closing these gaps.
