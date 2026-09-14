# Community Solid Server

The active container setup intentionally runs the unmodified upstream Community Solid Server image.

## Local development

```bash
make up
```

Local Compose selects CSS's memory configuration and does not mount `/data`, so all accounts and pods are discarded when the container is recreated. Access CSS through its local URL below.

CSS's native seed configuration creates five synthetic accounts and pods at startup. Each prepared pod receives persona-specific starter records and a synthetic identity credential when it is first connected to the webapp. The shared password is `SovereignDemo!`:

| Person | Email | Pod |
| --- | --- | --- |
| Alex Sovereign | `alex@demo.sovereign.ngo` | `/alex/` |
| Betty Medina | `betty@demo.sovereign.ngo` | `/betty/` |
| Charlie Krier | `charlie@demo.sovereign.ngo` | `/charlie/` |
| Debra Harbor | `debra@demo.sovereign.ngo` | `/debra/` |
| Ed Erins | `ed@demo.sovereign.ngo` | `/ed/` |

These public credentials and all associated data are strictly for synthetic demonstration use. Pod Manager also supports creating a new account and pod for custom test data.

`demo-users.json` is the canonical source for the prepared accounts. CSS reads the email, password, and pod name fields; the web application reads the profile, starter records, and starter credentials to describe each account and initialize its selected pod.

## Local tests

The test suite runs locally with Node and does not contact Cloudflare:

```bash
make test
```

Run an individual layer with `make test-basic`, `make test-providers`, or `make test-journeys`.

After deployment, exercise only the user journeys against the live application and provider endpoints:

```bash
make test-deployed-journeys
```

Override the defaults with `DEPLOYED_APP_URL` and `DEPLOYED_API_DOMAIN` when testing a preview deployment.

### First Solid login

1. Start the stack and open `http://localhost:8080/tutorial/pod-manager/`.
2. Select **Create account and pod**. Register an account in CSS, then create a pod from the CSS account page. CSS automatically creates and links a WebID when no external WebID is supplied.
3. Return to the Solid pod page and select **Log in with Solid**. Authenticate with the account and approve the WebID when CSS asks.
4. Select the discovered pod and choose **Use selected pod**.

The app then stores its state in `sovereign-demo-state.json` at the selected pod root. The selected pod is carried in the app's `?pod=` URL and application state is held only in page memory while the pod resource remains authoritative. Logging out removes the pod URL parameter. The Solid-OIDC client retains only the session material required to keep the browser authenticated. Because local CSS uses memory storage, recreating its container also removes its accounts, WebIDs, and pods.

The `dist/shared/solid-session.js` browser bundle is generated from `organizations/shared/solid-session.js`. The app Dockerfile performs this build in its own Node stage and copies only the static webapp artifact into the final Nginx image. Rebuild it outside Docker after changing the Solid integration:

```bash
make install
make build-webapp
```

The complete local host map is:

| Local URL | Production URL | Responsibility |
| --- | --- | --- |
| `http://localhost:8080` | `https://demo.sovereign.ngo` | Landing page and shared role-based demo application |
| `http://localhost:3000` | `https://pods.demo.sovereign.ngo` | Community Solid Server |
| `http://localhost:8789` | `https://passport.api.demo.sovereign.ngo` | Demonstration passport issuer |
| `http://localhost:8790` | `https://driver-license.api.demo.sovereign.ngo` | Demonstration state driver licensing agency |
| `http://localhost:8787` | `https://nolichucky.api.demo.sovereign.ngo` | Nolichucky Family Clinic API |
| `http://localhost:8788` | `https://riverbend.api.demo.sovereign.ngo` | Riverbend Dental Clinic API |
| `http://localhost:8791`–`8835` | Per-organization `*.api.demo.sovereign.ngo` hosts | Remaining provider organization portals and APIs |

The organization containers and production deployments execute the same shared `cloudflare/organization-worker.js`. The generic organization Dockerfile and the shared Wrangler configuration select an entity with `ORGANIZATION_ID`. Organization services do not use containers in production.

Compose passes the public browser URLs to the app container as environment variables. The standard Nginx entrypoint expands them into `/config.js` when the container starts. Cloudflare serves the webapp as static assets, including a production `config.js`; the browser application code is identical across local, preview, and production deployments.

Each of the 49 organizations owns its portal source, entity definition, API surface, trust manifest, local container, production Worker deployment, hostname, and OIDC browser session. The generic organization build packages shared browser libraries into each organization's generated static artifact. The shared Worker is stateless runtime code, not a shared deployment. There is no central API or organization directory service. Each organization's `/trust` endpoint identifies the peers and relationships it accepts.

For this demo, organization Workers are checked and deployed as a fleet. The fleet runner discovers every organization definition and applies its values to the single `cloudflare/wrangler.organization.jsonc` configuration:

```bash
make cloudflare-check-organizations
make cloudflare-deploy-organizations
```

The Cloudflare Git build for the organization fleet can therefore use `make install` as its build command and `make cloudflare-deploy-organizations` as its deploy command.

## Cloudflare deployment

The same upstream image can run as a Cloudflare Container. CSS's official image uses `/data` for its file-backed configuration, but Cloudflare Container disks are ephemeral.

R2 is not currently a declarative volume type for Cloudflare Containers. Cloudflare's documented R2 filesystem approach installs and starts a FUSE client such as `tigrisfs` inside the image. Consequently, these requirements cannot all be satisfied simultaneously:

1. use the completely unmodified upstream CSS image;
2. expose R2 as CSS's `/data` filesystem; and
3. use only Cloudflare Containers.

`Dockerfile.css-fuse` builds only the temporary CSS-with-FUSE production container. Local Compose references the pinned upstream CSS image directly and therefore needs no local pod Dockerfile. The production wrapper adds a pinned `tigrisfs` binary, mounts R2 at `/data`, and executes CSS's original command. Its self-contained entrypoint fails closed if the mount is unavailable so CSS can never silently store production pod data on ephemeral disk.

This is not a general Cloudflare deployment image. Additional containerized services should use their own clearly named Dockerfiles. The Cloudflare Worker that routes requests to this container is JavaScript and is deployed separately by Wrangler.

The wrapper requires these runtime variables:

- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

The access key values must be injected as encrypted Cloudflare secrets rather than committed to this repository.

The Worker maps the encrypted `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` secrets to the standard AWS variable names expected by the FUSE client.

The previous multi-service demonstration stack is retained under `containerization/old/` for reference.
