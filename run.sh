#!/bin/bash
set -e

if [ ! -f "logs-service/.env" ]; then
    echo ".env for logs not exists"
fi

if [ ! -f ".env" ]; then
    echo ".env not exists"
fi

docker network create no_name 2>/dev/null || true

echo "Shutdown before build"
# not delete volume for log


docker compose -f docker-compose.yaml down -v

echo "build"

docker compose -f logs-service/docker-compose.yaml up --build -d
docker compose -f docker-compose.yaml up --build -d
