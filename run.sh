#!/bin/bash
set -e

if [ ! -f "logs/.env" ]; then
    echo ".env for logs not exists"
fi

if [ ! -f ".env" ]; then
    echo ".env not exists"
fi

docker network create no_name 2>/dev/null || true

docker compose -f logs/docker-compose.yaml up --build -d
docker compose -f docker-compose.yaml up --build -d
