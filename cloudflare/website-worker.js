export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/config.js') {
      const config = {
        environment: env.DEPLOYMENT_ENVIRONMENT || 'preview',
        services: {
          app: env.APP_URL || 'https://app.demo.sovereign.ngo/'
        }
      };
      return new Response(`window.SovereignRuntimeConfig = Object.freeze(${JSON.stringify(config)});\n`, {
        headers: {
          'content-type': 'application/javascript; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }
      });
    }
    return env.ASSETS.fetch(request);
  }
};
