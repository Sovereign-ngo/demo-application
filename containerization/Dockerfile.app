FROM node:22-alpine AS webapp-build

WORKDIR /build/webapp
COPY webapp/package.json webapp/package-lock.json ./
RUN npm ci
COPY webapp ./
COPY organizations/shared /build/organizations/shared
COPY containerization/demo-users.json /build/containerization/demo-users.json
RUN npm run build

FROM nginx:1.29-alpine

COPY --from=webapp-build /build/webapp/dist /usr/share/nginx/html

# Nginx's standard container entrypoint expands this template from runtime
# environment variables. The image contains no environment-specific URLs.
ENV NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html

RUN <<'RUNTIME_CONFIG' sh
mkdir -p /etc/nginx/templates
cat > /etc/nginx/templates/config.js.template <<'EOF'
window.SovereignRuntimeConfig = Object.freeze({
  environment: '${DEPLOYMENT_ENVIRONMENT}',
  services: Object.freeze({
    website: '${WEBSITE_URL}',
    app: '${APP_URL}',
    pods: '${PODS_URL}',
    organizations: Object.freeze(${ORGANIZATION_URLS_JSON})
  })
});
EOF
RUNTIME_CONFIG

RUN <<'NGINX_CONFIG' sh
cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
  listen 8080;
  absolute_redirect off;
  server_name _;
  root /usr/share/nginx/html;

  location / {
    try_files $uri $uri/ $uri/index.html =404;
  }
}
EOF
NGINX_CONFIG
