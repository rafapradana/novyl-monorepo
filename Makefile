.PHONY: dev dev-infra dev-api dev-web prod prod-build prod-stop stop clean db-migrate db-reset lint typecheck test

# ============================================
# Development
# ============================================

dev:
	@echo "Starting Novyl development environment..."
	@docker compose --env-file .env -f docker/docker-compose.yml up -d
	@echo "Waiting for infrastructure..."
	@sleep 3
	@pnpm --filter @novyl/web install
	@make -j3 _dev-api _dev-web _dev-infra-logs

_dev-api:
	@cd api && $$(go env GOPATH)/bin/air

_dev-web:
	@pnpm --filter @novyl/web dev

_dev-infra-logs:
	@docker compose --env-file .env -f docker/docker-compose.yml logs -f

dev-infra:
	@docker compose --env-file .env -f docker/docker-compose.yml up

dev-api:
	@cd api && $$(go env GOPATH)/bin/air

dev-web:
	@pnpm --filter @novyl/web install
	@pnpm --filter @novyl/web dev

# ============================================
# Production
# ============================================

prod:
	@docker compose --env-file .env -f docker/docker-compose.prod.yml up --build

prod-build:
	@docker compose --env-file .env -f docker/docker-compose.prod.yml build

prod-stop:
	@docker compose --env-file .env -f docker/docker-compose.prod.yml down

# ============================================
# Utilities
# ============================================

stop:
	@docker compose --env-file .env -f docker/docker-compose.yml down

clean:
	@docker compose --env-file .env -f docker/docker-compose.yml down -v
	@rm -rf api/tmp
	@rm -rf apps/web/.next
	@rm -rf apps/web/node_modules
	@rm -rf node_modules
	@pnpm store prune

db-migrate:
	@cd api && go run cmd/server/main.go --migrate

db-reset:
	@docker compose --env-file .env -f docker/docker-compose.yml down -v
	@docker compose --env-file .env -f docker/docker-compose.yml up -d
	@sleep 3
	@make db-migrate

lint:
	@pnpm lint

typecheck:
	@pnpm typecheck

test:
	@echo "Running Go tests..."
	@cd api && go test ./... -v
	@echo "Running frontend tests..."
	@pnpm -r test 2>/dev/null || echo "No frontend tests configured yet"
