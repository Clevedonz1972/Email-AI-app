#!/bin/bash
# Setup script for the OpenAI integration

set -e  # Exit immediately if a command exits with a non-zero status

echo "=== ASTI OpenAI Integration Setup ==="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install it and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is not installed. Please install it and try again."
    exit 1
fi

# Install required packages
echo "Installing required packages..."
pip3 install openai pydantic sqlalchemy

# Check if .env file exists
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." &> /dev/null && pwd )"
ENV_FILE="$PROJECT_ROOT/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file template..."
    cat > "$ENV_FILE" << EOL
# OpenAI API Key
OPENAI_API_KEY=your-api-key-here

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/asti

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-for-development-only
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application Configuration
TESTING=False
LOG_LEVEL=INFO
FRONTEND_URL=http://localhost:3000
EOL
    echo ".env file created at $ENV_FILE"
    echo "Please edit it to add your OpenAI API key."
else
    # Check if OPENAI_API_KEY is set in .env
    if grep -q "OPENAI_API_KEY=" "$ENV_FILE"; then
        OPENAI_API_KEY=$(grep "OPENAI_API_KEY=" "$ENV_FILE" | cut -d '=' -f2)
        if [ "$OPENAI_API_KEY" = "your-api-key-here" ]; then
            echo "Warning: OPENAI_API_KEY is set to the default value."
            echo "Please update it in $ENV_FILE"
        else
            echo "OPENAI_API_KEY is set in $ENV_FILE"
        fi
    else
        echo "Warning: OPENAI_API_KEY is not set in $ENV_FILE"
        echo "Please add it with the format: OPENAI_API_KEY=your-api-key-here"
    fi
fi

echo ""
echo "Setup complete!"
echo "You can now run the following to test the OpenAI integration:"
echo "python backend/scripts/check_api_key.py"
echo "python backend/scripts/test_email_ai.py"
echo ""
echo "=== Setup Completed ===" 