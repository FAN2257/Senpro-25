FROM node:20-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1 \
    PORT=8000 \
    APP_HOME=/app

WORKDIR ${APP_HOME}

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      libxcb1 \
      libx11-6 \
      libxext6 \
      libxrender1 \
      libsm6 \
      libglib2.0-0 \
      libgomp1 \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./backend/static/

RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir -r backend/requirements.txt

EXPOSE 8000

CMD ["sh", "-c", "cd backend && uvicorn api:app --host 0.0.0.0 --port ${PORT}"]