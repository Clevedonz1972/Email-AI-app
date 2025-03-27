#!/bin/bash

# Wait for Redis to be ready
echo "Waiting for Redis..."
while ! nc -z redis 6379; do
    sleep 1
done
echo "Redis is ready!"

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start Celery worker in the background
echo "Starting Celery worker..."
celery -A backend.tasks.worker worker --loglevel=info &

# Start Celery beat for scheduled tasks
echo "Starting Celery beat..."
celery -A backend.tasks.worker beat --loglevel=info &

# Start Flower for monitoring Celery
echo "Starting Flower..."
celery -A backend.tasks.worker flower --port=5555 &

# Start the FastAPI application
echo "Starting FastAPI application..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload 