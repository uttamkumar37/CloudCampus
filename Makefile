.PHONY: test build image compose-local compose-staging compose-prod preflight-prod smoke-local

test:
	cd backend && mvn test

build:
	cd backend && mvn -B package

image:
	docker build -f backend/Dockerfile -t cloudcampus-backend:local .

compose-local:
	docker compose -f docker-compose.local.yml config

compose-staging:
	docker compose --env-file .env.staging.example -f docker-compose.staging.yml config

compose-prod:
	docker compose --env-file .env.production.example -f docker-compose.prod.yml config

preflight-prod:
	./scripts/deploy/preflight.sh prod

smoke-local:
	./scripts/deploy/smoke.sh http://localhost:$${CLOUDCAMPUS_BACKEND_PORT:-18080}
