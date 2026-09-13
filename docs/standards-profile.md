# Standards Profile (Demo)

This document records which standards are actively modeled in the Individual Demo, and which are intentionally deferred because the project is still demo-stage.

Date of this snapshot: **April 6, 2026**.

## In Scope Today

### 1) W3C Verifiable Credentials Data Model v2 (shape-level)

- Demo credentials use `@context: https://www.w3.org/ns/credentials/v2`.
- Credential entries are validated in the shared store before use.
- VC status includes Status List 2021 entry metadata.

Implementation anchors:

- `organizations/shared/pod-state.js`

### 2) Status List 2021 entry metadata

- `credentialStatus` fields are modeled as `StatusList2021Entry` with revocation purpose.
- Issuance and revocation state are kept internally and validated.

Implementation anchors:

- `organizations/shared/pod-state.js`
- `organizations/*/credentials-verify.json`

### 3) DID-based identifiers (`did:web` namespace in demo domain)

- Providers, issuers, verifiers, and subjects are represented with `did:web:demo.sovereign.ngo:*` identifiers.

Implementation anchors:

- `webapp/tutorial/provider-catalog.global.js`
- `organizations/riverbend-dental-clinic/credentials-issue.json`
- `organizations/riverbend-dental-clinic/credentials-verify.json`
- `organizations/shared/pod-state.js`

### 4) Credential and presentation envelope modeling

- The browser demo models W3C credential payloads and presentation-oriented exchanges.
- Organization policies declare intended `vc+jwt` and EdDSA verification requirements.
- The current organization Worker does not yet perform authoritative signature verification or production issuance.

Implementation anchors:

- `organizations/nolichucky-family-clinic/index.html`
- `cloudflare/organization-worker.js`
- `organizations/*/credentials-issue.json`
- `organizations/*/credentials-verify.json`

### 5) Consent and auditable handoff model

- Consent grant/revoke is explicit in the credential manager.
- Referrals and cross-provider record access passes are explicitly modeled.
- Tutorial events are recorded in the resident-controlled demo state stored in the selected pod.

Implementation anchors:

- `webapp/tutorial/credential-manager/index.html`
- `organizations/shared/pod-state.js`
- `organizations/shared/pod-storage.js`

### 6) Taxonomy alignment in service catalog

- Service providers are tagged with NAICS and AIRS/211 mappings.
- HUD HMIS mappings appear where relevant in catalog entries.

Implementation anchors:

- `webapp/tutorial/provider-catalog.global.js`
- `webapp/tutorial/naics-sectors.global.js`

### 7) Solid identity and storage

- Community Solid Server provides account registration, Solid-OIDC login, WebIDs, pods, and resource authorization.
- Local Compose uses CSS memory storage; the Cloudflare container wrapper mounts R2 through FUSE for persistence.

Implementation anchors:

- `containerization/docker-compose.yml`
- `containerization/Dockerfile.css-fuse`
- `cloudflare/solid-pod-worker.js`

## Intentionally Deferred (Not Full Standard Implementations Yet)

### 1) OID4VCI / OID4VP protocol flows

- The demo uses direct browser-to-organization JSON exchanges.
- Full OID4 challenge endpointing, metadata discovery, wallet-style redirect flows, and verifier-initiated protocol exchange are not implemented as formal OID4 profiles.

### 2) DID method resolution and trust registry

- Organizations publish explicit local trust manifests, but no federated DID resolver or trust registry is implemented.
- Full production DID operations (key lifecycle governance, external resolver federation, formal trust governance workflows) are not implemented.

### 3) Public, dereferenceable status-list endpoints

- Credentials contain status-list-shaped references, but the active topology does not publish live status-list documents.

### 4) Full wallet interoperability test profile

- The demo illustrates architecture and exchange controls.
- It is not yet a certified interoperability profile against external wallet ecosystems.

## Interpretation Guide

- This project is **standards-aligned in structure** and **demo-enforced in critical exchange checks**, but not yet complete as a production-grade standards implementation.
- See `docs/compliance-baseline.md` for security/compliance implications.
