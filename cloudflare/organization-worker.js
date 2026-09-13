import entities from '../organizations/registry.js';

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
  config: ({ organization, env }) => {
    const organizationUrls = {
      nolichucky_family_clinic: env.NOLICHUCKY_API_URL,
      riverbend_dental_clinic: env.RIVERBEND_API_URL,
      united_states_passport_office: env.PASSPORT_API_URL,
      state_driver_licensing_agency: env.DRIVER_LICENSE_API_URL
    };
    if (env.ORGANIZATION_API_URL) organizationUrls[organization.id] = env.ORGANIZATION_API_URL;
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
    const entity = entities[env.ORGANIZATION_ID];
    if (!entity) return json({ ok: false, error: 'Unknown or missing ORGANIZATION_ID.' }, { status: 500 });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const { pathname } = new URL(request.url);
    const operation = entity.api.operations.find((entry) => entry.method === request.method && entry.path === pathname);
    if (!operation) {
      if (env.ASSETS && typeof env.ASSETS.fetch === 'function') return env.ASSETS.fetch(request);
      return json({ ok: false, error: 'Not found' }, { status: 404 });
    }

    const handler = handlers[operation.handler];
    if (!handler) return json({ ok: false, error: 'Organization API references an unsupported handler.' }, { status: 500 });
    return handler({ ...entity, env, request });
  }
};
