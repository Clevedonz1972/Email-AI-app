#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to run database migrations
run_migrations() {
    echo -e "${GREEN}Running database migrations...${NC}"
    alembic upgrade head
}

# Function to create a new migration
create_migration() {
    echo -e "${GREEN}Creating new migration: $1${NC}"
    alembic revision --autogenerate -m "$1"
}

# Function to backup database
backup_db() {
    echo -e "${GREEN}Creating database backup...${NC}"
    pg_dump $DATABASE_URL > "backups/backup_$(date +%Y%m%d_%H%M%S).sql"
}

# Main script
case "$1" in
    "migrate")
        run_migrations
        ;;
    "create")
        if [ -z "$2" ]; then
            echo -e "${RED}Please provide a migration name${NC}"
            exit 1
        fi
        create_migration "$2"
        ;;
    "backup")
        backup_db
        ;;
    *)
        echo -e "${RED}Usage: $0 {migrate|create|backup}${NC}"
        exit 1
        ;;
esac 