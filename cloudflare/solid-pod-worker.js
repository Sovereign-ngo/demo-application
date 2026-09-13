import { Container, getContainer } from '@cloudflare/containers';

const CONTAINER_ID = 'shared-solid-server';

export class SolidPodContainer extends Container {
  defaultPort = 3000;
  sleepAfter = '30m';

  envVars = {
    CSS_PORT: '3000',
    CSS_BASE_URL: this.env.CSS_BASE_URL,
    CSS_CONFIG: 'config/file.json',
    CSS_ROOT_FILE_PATH: '/data',
    R2_ACCOUNT_ID: this.env.R2_ACCOUNT_ID,
    R2_BUCKET_NAME: this.env.R2_BUCKET_NAME,
    AWS_ACCESS_KEY_ID: this.env.R2_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: this.env.R2_SECRET_ACCESS_KEY
  };
}

export default {
  async fetch(request, env) {
    const container = getContainer(env.SOLID_POD, CONTAINER_ID);
    return container.fetch(request);
  }
};
