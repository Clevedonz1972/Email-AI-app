#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL is ready!"

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
while ! nc -z redis 6379; do
  sleep 0.1
done
echo "Redis is ready!"

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
echo "Starting the application..."
if [ "$CELERY_WORKER" = "true" ]; then
    celery -A backend.worker worker --loglevel=info
else
    uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
fi 