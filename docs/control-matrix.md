# Control Matrix (Demo Baseline)

Date of this snapshot: **April 6, 2026**.

This matrix links key controls to implementation evidence and identifies what still needs to be hardened for production.

| Control Area | Current Demo Status | Evidence Anchor(s) | Gap To Production |
|---|---|---|---|
| Webapp hosting | Implemented | `webapp/`, `cloudflare/wrangler.app.jsonc` | Static assets only; access control belongs at the application/data-service boundaries |
| Exchange signing and verification | Shape-level demo only | `organizations/shared/pod-state.js`, `cloudflare/organization-worker.js`, `organizations/*/credentials-verify.json` | Implement authoritative server-side issuance, signature verification, key lifecycle, and verifier policy enforcement |
| VC data model shape (W3C VC v2 + status entry metadata) | Implemented | `organizations/shared/pod-state.js` | Needs live dereference status infrastructure and ecosystem trust integration |
| Consent grant/revoke flow | Implemented | `webapp/tutorial/credential-manager/index.html`, `organizations/shared/pod-state.js` | Needs policy-grade purpose binding, retention, and governance controls |
| Referral lifecycle controls | Implemented | `organizations/nolichucky-family-clinic/index.html`, `organizations/shared/pod-state.js` | Needs policy enforcement for role, purpose, and stronger org-level authorization |
| Record access pass model | Implemented | `organizations/nolichucky-family-clinic/index.html`, `organizations/shared/pod-state.js` | Needs production-grade token/access governance and service-side validation controls |
| Organization API audit trail | Not implemented | `cloudflare/organization-worker.js` | Add durable, integrity-protected audit storage, retention policy, and independent verification |
| Transport security | Local HTTP / Cloudflare edge TLS | `containerization/docker-compose.yml`, `cloudflare/wrangler.organization.jsonc` | Define service-to-service authentication and production origin security controls |
| Replay resistance | Not implemented | `cloudflare/organization-worker.js` | Add persistent nonce/jti replay store and challenge lifecycle enforcement |
| Service authentication | Not implemented | `cloudflare/organization-worker.js` | Add per-organization service identity, authorization, and rotation |
| Key custody | Demo-only | `organizations/nolichucky-family-clinic/index.html` | Remove browser-stored signing private keys for operational trust assertions |
| Data minimization in UI | Partial | `organizations/nolichucky-family-clinic/index.html`, `organizations/riverbend-dental-clinic/index.html`, `webapp/tutorial/credential-manager/index.html` | Reduce direct identifiers in operational views by default and introduce role-sensitive redaction |
| Non-identifiable export for accountability | Implemented | `webapp/tutorial/individual/index.html` | Needs policy alignment, evidence retention strategy, and auditing governance for production |

## Notes

- “Implemented” here means implemented for demonstration behavior, not automatically compliant for regulated production use.
- The authoritative production transition path remains:
  - `docs/compliance-baseline.md`
  - `docs/production-hardening-checklist.md`
  - `docs/implementation-roadmap.md`
