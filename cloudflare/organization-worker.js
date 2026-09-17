import entities from '../organizations/registry.js';

const organizationHostnameAliases = Object.freeze({
  nolichucky: 'nolichucky_family_clinic',
  riverbend: 'riverbend_dental_clinic',
  passport: 'united_states_passport_office',
  'driver-license': 'state_driver_licensing_agency'
});

const directoryFor = (organizationId) => organizationId.replaceAll('_', '-');

const hostnameFor = (organizationId) => {
  const alias = Object.entries(organizationHostnameAliases)
    .find(([, id]) => id === organizationId)?.[0];
  return `${alias || directoryFor(organizationId)}.api.demo.sovereign.ngo`;
};

const resolveOrganization = (request, env) => {
  if (env.ORGANIZATION_ID) {
    return { id: env.ORGANIZATION_ID, directory: directoryFor(env.ORGANIZATION_ID), local: true };
  }

  const hostname = new URL(request.url).hostname;
  const suffix = '.api.demo.sovereign.ngo';
  if (!hostname.endsWith(suffix)) return null;
  const label = hostname.slice(0, -suffix.length);
  const id = organizationHostnameAliases[label] || label.replaceAll('-', '_');
  return entities[id] ? { id, directory: directoryFor(id), local: false } : null;
};

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET, POST, OPTIONS'
};

const json = (value, init = {}) => new Response(JSON.stringify(value, null, 2), {
  ...init,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...cors,
    ...(init.headers || {})
  }
});

const trustEndpointOverrides = (env) => {
  try {
    return JSON.parse(env.TRUST_ENDPOINTS_JSON || '{}');
  } catch {
    return {};
  }
};

const handlers = {
  health: ({ organization }) => json({ ok: true, organizationId: organization.id }),
  info: ({ organization }) => json({ ...organization, transactions: [] }),
  trust: ({ trust, env }) => {
    const overrides = trustEndpointOverrides(env);
    return json({
      organizationId: trust.organizationId,
      trustedOrganizations: trust.trustedOrganizations.map((peer) => ({
        ...peer,
        apiUrl: overrides[peer.id] || peer.apiUrl
      }))
    });
  },
  config: ({ organization, env, request }) => {
    const organizationUrls = Object.fromEntries(Object.keys(entities).map((id) => [
      id,
      `https://${hostnameFor(id)}/`
    ]));
    Object.assign(organizationUrls, {
      nolichucky_family_clinic: env.NOLICHUCKY_API_URL || organizationUrls.nolichucky_family_clinic,
      riverbend_dental_clinic: env.RIVERBEND_API_URL || organizationUrls.riverbend_dental_clinic,
      united_states_passport_office: env.PASSPORT_API_URL || organizationUrls.united_states_passport_office,
      state_driver_licensing_agency: env.DRIVER_LICENSE_API_URL || organizationUrls.state_driver_licensing_agency
    });
    organizationUrls[organization.id] = env.ORGANIZATION_API_URL || `${new URL(request.url).origin}/`;
    const config = {
      environment: env.DEPLOYMENT_ENVIRONMENT || 'preview',
      services: {
        website: env.WEBSITE_URL,
        app: env.APP_URL,
        pods: env.PODS_URL,
        organizations: organizationUrls
      }
    };
    return new Response(`window.SovereignRuntimeConfig = Object.freeze(${JSON.stringify(config)});\n`, {
      headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-store', ...cors }
    });
  },
  submitPresentation: async ({ organization, request }) => {
    const presentation = await request.json().catch(() => null);
    if (!presentation) return json({ ok: false, error: 'A JSON presentation is required.' }, { status: 400 });
    return json({ ok: true, organizationId: organization.id, accepted: true }, { status: 202 });
  }
};

export default {
  async fetch(request, env = {}) {
    const selected = resolveOrganization(request, env);
    const entity = selected && entities[selected.id];
    if (!entity) return json({ ok: false, error: 'Unknown organization hostname or ORGANIZATION_ID.' }, { status: 404 });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const { pathname } = new URL(request.url);
    const operation = entity.api.operations.find((entry) => entry.method === request.method && entry.path === pathname);
    if (!operation) {
      if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        if (selected.local) return env.ASSETS.fetch(request);
        const assetUrl = new URL(request.url);
        assetUrl.pathname = `/${selected.directory}${pathname}`;
        return env.ASSETS.fetch(new Request(assetUrl, request));
      }
      return json({ ok: false, error: 'Not found' }, { status: 404 });
    }

    const handler = handlers[operation.handler];
    if (!handler) return json({ ok: false, error: 'Organization API references an unsupported handler.' }, { status: 500 });
    return handler({ ...entity, env, request });
  }
};
