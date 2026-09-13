# Sovereign Individual Demo

## Purpose

This repository centers on one primary experience: the **Individual Tutorial** at `webapp/tutorial/individual/`.

It demonstrates a sovereign data model where:

- each provider remains the source of truth for its own records,
- the resident controls consent and sharing,
- cross-provider coordination happens through explicit, auditable handoffs.

## Documentation Map

- `docs/README.md` (this file): high-level architecture and run guidance.
- `docs/executive-summary.md`: first-principles, non-technical explanation of what the demo proves and why it matters.
- `docs/standards-profile.md`: standards adopted now vs standards intentionally out of scope in demo mode.
- `docs/compliance-baseline.md`: demo-safe compliance baseline and production hardening requirements.
- `docs/production-hardening-checklist.md`: actionable implementation checklist before any real-world data use.
- `docs/control-matrix.md`: control-by-control evidence matrix mapped to concrete implementation anchors.
- `docs/transaction-classes.md`: the six transaction classes used in the demo, with abilities, use cases, and examples.

## What The Individual Demo Does Today

- Runs guided tutorial chains across common service pathways (health, housing, legal, workforce, identity documents, and related handoffs).
- Highlights the exact next control to click and advances only when the expected action is completed.
- Models resident login, service actions, referral issuance, and referral fulfillment.
- Enforces credential requirements for selected transactions.
- Stores and exchanges credentials in W3C VC JSON-LD shape across issuer, provider, and audit flows.
- Organizes workflows into six repeatable transaction classes:
  - direct service action,
  - sovereign-mediated record sharing,
  - cross-org workflow handoff,
  - shared-state coordination,
  - credential trust lifecycle,
  - consent and audit governance.
- Demonstrates record access pass behavior:
  - a source provider can issue access for a specific source record,
  - long-term passes can be saved by another provider in its provider-pod context for future reuse.

## Supporting Surfaces Behind The Individual Demo

The following surfaces support the Individual experience:

- `organizations/` (49 independently configured organization portals and APIs)
- `webapp/tutorial/credential-manager/`
- `webapp/tutorial/pod-manager/`

Organization portal source is owned and deployed by each organization. Each portal is an independent Solid-OIDC client and establishes its own session with the resident's identity provider. The walkthrough passes the selected pod URL as navigation context, never an authentication token.

## Runtime Modes

- **Local Compose mode**: the website, webapp, 49 organization services, and unmodified Community Solid Server run entirely on the local machine.
- **Cloudflare mode**: static sites and organization Workers use the same built assets and Worker source; CSS runs in its dedicated container wrapper.

Browser state is only an in-memory working copy. The selected Solid pod resource is authoritative; the Solid-OIDC library retains only authentication session material.

The organization-facing pod state client lives in `organizations/shared/pod-state.js`; tutorial-only coordination lives in `webapp/tutorial/shared/`.

## Container Topology

`containerization/docker-compose.yml` defines the website, webapp, unmodified upstream Community Solid Server, and one local container for each organization. Every organization container runs the shared Cloudflare Worker through a Docker-only HTTP adapter embedded in `Dockerfile.organization`.

## Compliance And Security Posture (Demo)

This is a policy and interoperability demonstration, not a production system.

It is not:

- production security/compliance implementation,
- a full EHR/HMIS/claims platform,
- real clinical or legal decision automation.

For exact details, see:

- `docs/standards-profile.md`
- `docs/compliance-baseline.md`
- `docs/production-hardening-checklist.md`

## Current Limits

- Organization presentation submission currently validates only that JSON was supplied and returns a demo acceptance response.
- Credential construction and service-portal exchange events are demo-oriented and are not cryptographically authoritative production issuance or a complete wallet/trust framework.
- Status-list URLs in demo credentials are identifier-style references used for policy demonstration, not live public dereference endpoints in the static website deployment.

## Run The Individual Demo

From repo root:

```bash
make up
```

Then open:

- `http://localhost:8080/` for the landing website,
- `http://localhost:8081/tutorial/individual/` for the tutorial,
- `http://localhost:3000/` for Community Solid Server.

Notes:

- Local CSS uses its memory configuration. Accounts and pods are discarded when the container is recreated.
- The 49 local organization services use ports `8787` through `8835`.
- The previous provider, standards, gateway, and custom CSS implementation is archived under `containerization/old/`.

### Cloudflare Solid Pod Container

The Cloudflare pod deployment uses `Dockerfile.css-fuse`, a temporary wrapper that mounts R2 through FUSE before starting upstream CSS. See `containerization/README.md` for its storage requirements and limitations.

The Worker is deliberately only a transport router. CSS remains responsible for accounts, Solid-OIDC, WebIDs, pod creation, and resource authorization.

## Near-Term Direction

1. Strengthen provider API contracts and service boundaries.
2. Expand consent policy simulation (purpose, duration, revocation behavior).
3. Add more end-to-end workflow templates mapped to common city pressure points.
4. Keep backend adapters swappable so production infrastructure can replace demo storage/services with minimal UI change.
5. Improve non-identifying observability and audit reporting.

## Repository Anchors

- Demo app: `webapp/`
- Container orchestration: `containerization/`
- Demo docs: `docs/`
