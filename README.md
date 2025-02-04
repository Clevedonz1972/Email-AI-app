# Email AI Assistant

A neurodiversity-friendly email management system with AI assistance.

## Features

- 🧠 AI-powered email analysis and suggestions
- 📊 Stress level monitoring and management
- 🎯 Smart email categorization
- ♿ Accessibility-first design
- 🔒 Enterprise-grade security

## Security Features

### Authentication
- JWT-based authentication with access and refresh tokens
- Secure password hashing using bcrypt
- Rate limiting to prevent brute force attacks
- CORS protection
- XSS prevention
- CSRF protection

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/email_ai_db
JWT_SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-api-key

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_TOKEN_KEY=email_ai_token
```

### Token Management

The system uses two types of tokens:
1. Access Token (30-minute expiry)
2. Refresh Token (7-day expiry)

Frontend storage:
- Access token: Memory (Redux store)
- Refresh token: HTTP-only secure cookie

## Setup

### Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test
```

## API Documentation

API documentation is available at `/docs` when running the server.

## Security Best Practices

1. All passwords are hashed using bcrypt
2. JWT tokens are signed with HS256 algorithm
3. Rate limiting is enabled for all endpoints
4. All database queries are parameterized
5. Input validation using Pydantic models 