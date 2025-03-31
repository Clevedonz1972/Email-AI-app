# Email AI Assistant

A modern web application that combines email management with AI-powered assistance, calendar integration, and voice commands.

## Features

- 📧 Email Management
  - View and manage emails
  - AI-powered email composition
  - Smart email organization

- 📅 Calendar Integration
  - Event management
  - Meeting scheduling
  - Calendar sync

- 🎙️ Voice Assistant
  - Voice commands for email and calendar
  - Natural language processing
  - Hands-free operation
  - Text-to-speech and speech-to-text capabilities
  - Real-time AI conversations with voice or text input

- 🔒 Authentication
  - Secure user authentication
  - Protected routes
  - User settings management

## Tech Stack

- Frontend:
  - Next.js 14
  - TypeScript
  - Material-UI
  - FullCalendar
  - Axios

- Backend:
  - Node.js
  - Express
  - MongoDB
  - JWT Authentication

## Key Components

### SpeakToMe AI Conversation

The application features a powerful AI conversation system that allows users to interact with ASTI (the assistant) using either text or voice:

- **Speech Recognition**: Users can speak directly to the assistant using their device's microphone
- **Voice Recording**: Audio is sent to the backend for advanced processing
- **Text-to-Speech**: ASTI's responses can be read aloud using browser speech synthesis
- **Conversation History**: All conversations are saved and can be reviewed later
- **Mock Mode**: Development environment can use mock responses for testing

Example usage:
1. Click the "SPEAK TO ME" button from the dashboard
2. Enable microphone access when prompted
3. Speak naturally to ASTI or type your message
4. Receive AI-generated responses based on context and history

The system uses a REST API to communicate with the backend AI service, which can be configured to use various AI models.

## ASTI: AI Assistant for Neurodivergent Users

ASTI is a neuro-aware assistant designed to help neurodivergent users better manage their email and calendar information. ASTI uses OpenAI's GPT models to:

- Analyze emails for stress factors and important details
- Generate clear summaries and action items
- Suggest responses and next steps
- Create personalized daily briefings

### AI Processing Pipeline

ASTI uses a sophisticated AI pipeline to process user data:

1. **Email Analysis**: Emails are analyzed using GPT-4 to extract:
   - Clear summaries
   - Emotional tone detection
   - Explicit and implicit expectations
   - Suggested actions with specific steps
   - Response templates

2. **Vector Memory**: All processed items are stored in a vector memory system for:
   - Semantic search
   - Context-aware recommendations
   - Long-term memory and pattern recognition

3. **Knowledge Graph**: ASTI builds a knowledge graph connecting:
   - Emails
   - Calendar events
   - Tasks
   - Emotional states
   - People and relationships

4. **Daily Brief Generation**: ASTI creates personalized daily briefs that include:
   - Important email summaries
   - Upcoming events
   - Suggested priorities
   - Wellbeing tips

### OpenAI API Integration

The application uses the following OpenAI models:

- `gpt-4-turbo`: For nuanced understanding of email content and generating recommendations
- `gpt-3.5-turbo`: For simpler analysis tasks and content generation
- `text-embedding-3-small`: For generating vector embeddings of content

#### Integration Architecture

1. **Core OpenAI Service** (`backend/services/openai_service.py`):
   - Provides a unified API interface for all OpenAI models
   - Handles error recovery and retries
   - Logs token usage for cost tracking
   - Contains specialized analyzers for emails and content

2. **Vector Memory Service** (`backend/services/vector_memory.py`):
   - Stores embeddings of processed content
   - Enables semantic search across user data
   - Maintains contextual references for knowledge retrieval
   
3. **ASTI Brain Service** (`backend/services/asti_brain.py`):
   - Orchestrates AI processing across multiple models
   - Manages user-specific preferences and adaptations
   - Builds knowledge representations for long-term memory

4. **REST API Endpoints**:
   - `/asti/analyze-email`: Process an email with AI analysis
   - `/asti/daily-brief`: Get a personalized daily brief
   - `/asti/analyze-calendar-event`: Process a calendar event
   - `/asti/memories`: Store/retrieve memories in the vector database

#### Performance Considerations

The system uses a tiered approach to balance quality, cost, and performance:

- **GPT-4-turbo**: Used for tasks requiring deep understanding (email analysis, daily briefs)
- **GPT-3.5-turbo**: Used for simpler tasks (content summarization, reply generation)
- **Embeddings**: Cached and stored efficiently to minimize API calls

Token usage is logged for all API calls to monitor costs and optimize usage.

#### Setup

Run the setup script to install required packages and prepare your environment:

```bash
# Unix/MacOS
./backend/scripts/setup_ai.sh

# Windows
# Run the commands manually:
pip install openai pydantic sqlalchemy
```

This script will:
1. Install necessary Python packages (openai, pydantic, sqlalchemy)
2. Create a template .env file if it doesn't exist 
3. Check if your OpenAI API key is configured

Make sure to set your OpenAI API key in the `.env` file:

```
OPENAI_API_KEY=your-api-key-here
```

#### Testing the AI Integration

The project includes several scripts to test the OpenAI integration:

1. **Check API Key**:
   ```bash
   python backend/scripts/check_api_key.py
   ```
   Verifies that your OpenAI API key is properly configured and working.

2. **Simplified Email Analysis Test** (No Database Required):
   ```bash
   python backend/scripts/test_email_ai.py
   ```
   Tests the email analysis with sample emails without requiring database setup.

3. **Test OpenAI Integration**:
   ```bash
   python backend/scripts/test_openai_integration.py
   ```
   Tests basic functionality like email summarization and embedding generation.

4. **Generate Test Emails**:
   ```bash
   python backend/scripts/generate_test_emails.py
   ```
   Creates a set of realistic test emails, processes them with the AI, and stores them in the database.

5. **Display Email Analysis**:
   ```bash
   python backend/scripts/display_email_analysis.py [email_id]
   ```
   Displays the AI analysis for all emails or a specific email ID, showing summaries, emotional context, and suggested actions.

These scripts help you verify that the AI pipeline is working correctly before integrating with the frontend.

#### Testing in Docker

If you're using Docker, you can test the OpenAI integration with these commands:

```bash
# Copy the test scripts to the backend container
docker cp backend/scripts/test_email_ai.py email-ai-app-backend-1:/app/backend/scripts/
docker cp backend/scripts/setup_ai.sh email-ai-app-backend-1:/app/backend/scripts/

# Make the scripts executable
docker exec email-ai-app-backend-1 chmod +x /app/backend/scripts/test_email_ai.py /app/backend/scripts/setup_ai.sh

# Add your OpenAI API key to the .env file in the container
docker exec -it email-ai-app-backend-1 bash -c "echo 'OPENAI_API_KEY=your-api-key-here' > /app/.env"

# Run the test script
docker exec email-ai-app-backend-1 python /app/backend/scripts/test_email_ai.py
```

Replace `your-api-key-here` with your actual OpenAI API key. This will test the AI analysis capabilities using sample emails.

#### Troubleshooting

If you encounter OpenAI API issues:

1. Verify your API key is correct
2. Check that the associated OpenAI account has billing set up
3. Make sure the API key has access to the required models (gpt-3.5-turbo)

### AI Routes

Access ASTI's AI capabilities through these endpoints:

- `POST /asti/analyze-email`: Process an email with AI analysis
- `GET /asti/daily-brief`: Get a personalized daily brief
- `POST /asti/analyze-calendar-event`: Process a calendar event
- `POST /asti/memories`: Store a memory in the vector database
- `GET /asti/memories`: Retrieve relevant memories

## Getting Started

1. Clone the repository:
```