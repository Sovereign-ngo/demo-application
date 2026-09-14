import { DurableObject } from 'cloudflare:workers';

const CONTAINER_ID = 'shared-solid-server';
const CONTAINER_PORT = 3000;
const START_ATTEMPTS = 240;
const START_RETRY_MS = 500;

export class SolidPodContainer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;
    this.ready = false;
    this.startup = null;

    ctx.blockConcurrencyWhile(() => ctx.container.setInactivityTimeout(30 * 60 * 1000));
  }

  async ensureReady() {
    if (this.ready && this.ctx.container.running) {
      return this.ctx.container.getTcpPort(CONTAINER_PORT);
    }
    if (this.startup) return this.startup;

    this.ready = false;
    this.startup = this.startAndWait().then(
      (port) => {
        this.ready = true;
        this.startup = null;
        return port;
      },
      (error) => {
        this.startup = null;
        throw error;
      }
    );
    return this.startup;
  }

  async startAndWait() {
    if (!this.ctx.container.running) {
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

    const port = this.ctx.container.getTcpPort(CONTAINER_PORT);
    let lastError;
    for (let attempt = 0; attempt < START_ATTEMPTS; attempt += 1) {
      try {
        const probe = await port.fetch('http://container/');
        await probe.body?.cancel();
        return port;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, START_RETRY_MS));
      }
    }
    throw lastError;
  }

  async fetch(request) {
    const port = await this.ensureReady();
    return port.fetch(request);
  }
}

export default {
  fetch(request, env) {
    return env.SOLID_POD.getByName(CONTAINER_ID).fetch(request);
  }
};
