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

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/email-ai-app.git
cd email-ai-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file with the following:
REACT_APP_AI_API_ENDPOINT=http://localhost:3001/api
REACT_APP_USE_MOCK_AI=true  # For development without a backend
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
email-ai-app/
├── public/
│   └── assets/              # Static assets
├── src/
│   ├── components/          # React components
│   │   ├── Conversation/    # Voice and chat components
│   │   ├── Dashboard/       # Dashboard components
│   │   ├── Email/           # Email management
│   │   ├── Navigation/      # Navigation components
│   │   ├── Onboarding/      # User onboarding
│   │   └── Weather/         # Weather widget
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Page components
│   └── services/            # API services
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.