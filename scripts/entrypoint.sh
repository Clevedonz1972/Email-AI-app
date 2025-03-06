#!/bin/bash
set -e

# Function to wait for a service
wait_for_service() {
    local host="$1"
    local port="$2"
    local service="$3"
    
    echo "Waiting for $service to be ready..."
    while ! nc -z "$host" "$port"; do
        sleep 0.1
    done
    echo "$service is ready!"
}

# Wait for PostgreSQL
wait_for_service "db" "5432" "PostgreSQL"

# Wait for Redis
wait_for_service "redis" "6379" "Redis"

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start Celery worker in the background
echo "Starting Celery worker..."
celery -A backend.worker.celery worker --loglevel=info &

# Start Flower in the background
echo "Starting Flower..."
celery -A backend.worker.celery flower --port=5555 &

# Wait for services to be fully up
sleep 5

# Start FastAPI application with proper logging
echo "Starting FastAPI application..."
exec uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload --log-level info 