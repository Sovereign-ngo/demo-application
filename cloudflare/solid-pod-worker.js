import { DurableObject } from 'cloudflare:workers';

const CONTAINER_ID = 'shared-solid-server';
const CONTAINER_PORT = 3000;
const START_TIMEOUT_MS = 2 * 60 * 1000;
const POLL_INTERVAL_MS = 300;

// This is the small start/wait/forward path used by @cloudflare/containers,
// implemented locally so this Worker has no npm runtime dependency. The
// upstream helper is available under the MIT or Apache-2.0 license.
export class SolidPodContainer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;
    this.ready = false;
    this.startInFlight = null;
    ctx.container.setInactivityTimeout(30 * 60 * 1000);
  }

  startOptions() {
    return {
      enableInternet: true,
      env: {
        CSS_PORT: String(CONTAINER_PORT),
        CSS_BASE_URL: this.env.CSS_BASE_URL,
        CSS_CONFIG: 'config/file.json',
        CSS_ROOT_FILE_PATH: '/data',
        R2_ACCOUNT_ID: this.env.R2_ACCOUNT_ID,
        R2_BUCKET_NAME: this.env.R2_BUCKET_NAME,
        AWS_ACCESS_KEY_ID: this.env.R2_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: this.env.R2_SECRET_ACCESS_KEY
      }
    };
  }

  async waitUntilReady() {
    if (this.ready && this.ctx.container.running) {
      return this.ctx.container.getTcpPort(CONTAINER_PORT);
    }
    if (this.startInFlight) return this.startInFlight;

    this.ready = false;
    this.startInFlight = this.startAndWait();
    try {
      const port = await this.startInFlight;
      this.ready = true;
      return port;
    } finally {
      this.startInFlight = null;
    }
  }

  async startAndWait() {
    const container = this.ctx.container;
    if (!container.running) container.start(this.startOptions());

    const port = container.getTcpPort(CONTAINER_PORT);
    const attempts = Math.ceil(START_TIMEOUT_MS / POLL_INTERVAL_MS);
    let lastError;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const response = await port.fetch('http://containerstarthealthcheck');
        await response.body?.cancel();
        return port;
      } catch (error) {
        lastError = error;
        if (!container.running) throw error;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    }

    throw lastError ?? new Error('Container port did not become ready');
  }

  async fetch(request) {
    try {
      const port = await this.waitUntilReady();
      const containerUrl = request.url.replace(/^https:/, 'http:');
      return await port.fetch(containerUrl, request);
    } catch (error) {
      console.error('Unable to reach the Solid pod container', error);
      return new Response('The Solid pod server is starting. Please try again shortly.', {
        status: 503,
        headers: { 'retry-after': '5' }
      });
    }
  }
}

export default {
  fetch(request, env) {
    return env.SOLID_POD.getByName(CONTAINER_ID).fetch(request);
  }
};
