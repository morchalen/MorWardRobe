.PHONY: help dev-up dev-down dev-build db-init clean

help: ## 显示帮助信息
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'FS = ":.*?## "; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev-up: ## 启动所有开发服务
	docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
	@echo "✅ Services started at:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8080"
	@echo "   API Docs: http://localhost:8080/swagger/index.html"

dev-down: ## 停止所有服务
	docker compose -f infrastructure/docker/docker-compose.dev.yml down

dev-build: ## 构建后端二进制
	cd apps/api-server && go build -o bin/server ./cmd/server/

db-init: ## 初始化数据库（首次运行）
	@echo "Initializing database..."
	docker exec -it smartwardrobe-postgres psql -U postgres -c "CREATE DATABASE smartwardrobe_dev;"
	@echo "✅ Database initialized"

clean: ## 清理构建产物
	rm -rf apps/api-server/bin
	rm -rf apps/web-client/dist
