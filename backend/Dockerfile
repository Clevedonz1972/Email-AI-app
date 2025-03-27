# Build stage
FROM python:3.9-slim AS builder

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VERSION=1.4.2 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1 \
    PYTHONPATH="/app"

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        netcat-traditional \
        libpq-dev \
        libffi-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="${POETRY_HOME}/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install dependencies and update lock file
RUN poetry lock \
    && poetry install --no-dev --no-interaction --no-ansi

# Production stage
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH="/app"

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        netcat-traditional \
        libpq-dev \
        redis-tools \
        gcc \
        python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy installed dependencies from builder stage
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Install bcrypt explicitly
RUN pip install bcrypt==4.0.1

# Copy application code
COPY backend/ backend/
COPY alembic/ alembic/
COPY alembic.ini .

# Create logs directory
RUN mkdir -p /app/logs

# Create entrypoint script
COPY scripts/entrypoint.sh .
RUN chmod +x entrypoint.sh

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/ || exit 1

# Expose ports
EXPOSE 8000 5555

# Set entrypoint
ENTRYPOINT ["./entrypoint.sh"] 