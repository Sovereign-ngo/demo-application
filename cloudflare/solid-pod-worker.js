import { DurableObject } from 'cloudflare:workers';

const CONTAINER_ID = 'shared-solid-server';
const CONTAINER_PORT = 3000;

export class SolidPodContainer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;

    ctx.blockConcurrencyWhile(async () => {
      await ctx.container.setInactivityTimeout(30 * 60 * 1000);
      this.startContainer();
    });
  }

  startContainer() {
    if (this.ctx.container.running) return;
    this.ctx.container.start({
      env: {
        CSS_PORT: String(CONTAINER_PORT),
        CSS_BASE_URL: this.env.CSS_BASE_URL,
        CSS_CONFIG: 'config/file.json',
        CSS_ROOT_FILE_PATH: '/data',
        R2_ACCOUNT_ID: this.env.R2_ACCOUNT_ID,
        R2_BUCKET_NAME: this.env.R2_BUCKET_NAME,
        AWS_ACCESS_KEY_ID: this.env.R2_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: this.env.R2_SECRET_ACCESS_KEY
      },
      enableInternet: true
    });
  }

  async fetch(request) {
    this.startContainer();
    const port = this.ctx.container.getTcpPort(CONTAINER_PORT);
    let lastError;
    for (let attempt = 0; attempt < 240; attempt += 1) {
      try {
        await port.fetch('http://container/');
        return port.fetch(request);
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    throw lastError;
  }
}

export default {
  fetch(request, env) {
    return env.SOLID_POD.getByName(CONTAINER_ID).fetch(request);
  }
};
