SHELL := /bin/sh

COMPOSE := docker compose -f containerization/docker-compose.yml
WRANGLER := ./cloudflare/node_modules/.bin/wrangler

.DEFAULT_GOAL := help

.PHONY: help install build build-webapp build-organization-portals up down clean stop restart logs ps check test test-basic test-providers test-journeys test-deployed-journeys \
	cloudflare-check cloudflare-check-pods cloudflare-check-website \
	cloudflare-check-app cloudflare-check-organizations \
	cloudflare-deploy-organizations cloudflare-dev-pods cloudflare-deploy-pods

help:
	@printf '%s\n' \
		'make install             Install repository and webapp dependencies' \
		'make build               Build the webapp bundle and all local images' \
		'make up                  Build and start the complete local demo' \
		'make down                Stop and remove the local demo containers' \
		'make clean               Remove the local demo and its locally built images' \
		'make stop                Stop the local demo without removing it' \
		'make restart             Recreate the complete local demo' \
		'make logs                Follow logs from all local services' \
		'make ps                  Show local service status' \
		'make check               Validate source and Compose configuration' \
		'make test                Run all three test layers' \
		'make test-basic          Run basic operation tests' \
		'make test-providers      Run provider interoperability tests' \
		'make test-journeys       Run tutorial journey tests' \
		'make test-deployed-journeys  Exercise journeys against the deployed services' \
		'make cloudflare-check    Dry-run every Cloudflare deployment' \
		'make cloudflare-check-organizations   Dry-run every organization Worker' \
		'make cloudflare-deploy-organizations  Deploy every organization Worker' \
		'make cloudflare-dev-pods     Run the Solid pod Worker locally with Wrangler' \
		'make cloudflare-deploy-pods  Deploy the Solid pod Worker and CSS container'

install:
	npm --prefix cloudflare install
	npm --prefix webapp install

build-webapp:
	npm --prefix webapp run build

build-organization-portals: build-webapp
	node organizations/build.js

build: build-organization-portals
	$(COMPOSE) build

up:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down --remove-orphans

clean:
	$(COMPOSE) down --remove-orphans --rmi local

stop:
	$(COMPOSE) stop

restart: down up

logs:
	$(COMPOSE) logs --follow

ps:
	$(COMPOSE) ps

check: build-webapp
	node --check organizations/shared/pod-config.js
	node --check organizations/shared/pod-storage.js
	node --check cloudflare/organization-worker.js
	$(COMPOSE) config --quiet

test: test-basic test-providers test-journeys

test-basic:
	node --test tests/basic-operation.test.js

test-providers:
	node --test tests/provider-interoperability.test.js

test-journeys:
	node --test tests/user-journeys.test.js

test-deployed-journeys:
	node --test tests/deployed-user-journeys.test.js

cloudflare-check: cloudflare-check-pods cloudflare-check-website cloudflare-check-app cloudflare-check-organizations

cloudflare-check-pods:
	$(WRANGLER) deploy --dry-run --config cloudflare/wrangler.pods.jsonc

cloudflare-check-website:
	$(WRANGLER) deploy --dry-run --config cloudflare/wrangler.website.jsonc

cloudflare-check-app: build-webapp
	$(WRANGLER) deploy --dry-run --config cloudflare/wrangler.app.jsonc

cloudflare-check-organizations: build-organization-portals
	node cloudflare/deploy-organizations.js --dry-run

cloudflare-deploy-organizations: build-organization-portals
	node cloudflare/deploy-organizations.js

cloudflare-dev-pods:
	$(WRANGLER) dev --config cloudflare/wrangler.pods.jsonc

cloudflare-deploy-pods:
	$(WRANGLER) deploy --config cloudflare/wrangler.pods.jsonc
