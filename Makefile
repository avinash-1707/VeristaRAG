BACKEND_DIR  = backend
AI_DIR       = ai_service
FRONTEND_DIR = frontend

.PHONY: install migrate backend ai worker dev kill

install:
	cd $(BACKEND_DIR)  && uv venv && uv pip install -r requirements.txt
	cd $(AI_DIR)       && uv venv && uv pip install -r requirements.txt
	cd $(FRONTEND_DIR) && pnpm install

migrate:
	cd $(BACKEND_DIR) && uv run python manage.py migrate

backend:
	cd $(BACKEND_DIR) && uv run uvicorn config.asgi:application \
		--host 0.0.0.0 --port 8000 --reload

ai:
	cd $(AI_DIR) && uv run uvicorn main:app \
		--host 0.0.0.0 --port 8001 --reload

worker:
	cd $(BACKEND_DIR) && uv run celery -A config worker \
		--loglevel=info --concurrency=2

dev:
	$(MAKE) -j3 backend ai worker

kill:
	@fuser -k 8000/tcp 2>/dev/null || true
	@fuser -k 8001/tcp 2>/dev/null || true
	@fuser -k 3000/tcp 2>/dev/null || true
	@pkill -f "celery -A config" 2>/dev/null || true
	@echo "done"
