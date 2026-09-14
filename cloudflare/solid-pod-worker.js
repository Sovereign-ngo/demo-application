import { DurableObject } from 'cloudflare:workers';

const CONTAINER_ID = 'shared-solid-server';
const CONTAINER_PORT = 3000;

export class SolidPodContainer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);

    ctx.blockConcurrencyWhile(async () => {
      await ctx.container.setInactivityTimeout(30 * 60 * 1000);
      if (!ctx.container.running) {
        ctx.container.start({
          env: {
            CSS_PORT: String(CONTAINER_PORT),
            CSS_BASE_URL: env.CSS_BASE_URL,
            CSS_CONFIG: 'config/file.json',
            CSS_ROOT_FILE_PATH: '/data',
            R2_ACCOUNT_ID: env.R2_ACCOUNT_ID,
            R2_BUCKET_NAME: env.R2_BUCKET_NAME,
            AWS_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY
          },
          enableInternet: true
        });
      }

      const port = ctx.container.getTcpPort(CONTAINER_PORT);
      let lastError;
      for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
          await port.fetch('http://container/');
          return;
        } catch (error) {
          lastError = error;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      throw lastError;
    });
  }

  fetch(request) {
    return this.ctx.container.getTcpPort(CONTAINER_PORT).fetch(request);
  }
}

export default {
  fetch(request, env) {
    return env.SOLID_POD.getByName(CONTAINER_ID).fetch(request);
  }
};
