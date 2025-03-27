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

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/email-ai-app.git
cd email-ai-app
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Backend (.env)
PORT=3001
MONGODB_URI=mongodb://localhost:27017/email-ai
JWT_SECRET=your_jwt_secret
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
email-ai-app/
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   │   ├── components/       # React components
│   │   │   ├── contexts/        # React contexts
│   │   │   ├── services/        # API services
│   │   │   └── theme/           # Material-UI theme
│   │   ├── public/              # Static assets
│   │   └── package.json
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/          # Configuration files
│   │   │   ├── controllers/     # Route controllers
│   │   │   ├── middleware/      # Custom middleware
│   │   │   ├── models/          # Database models
│   │   │   ├── routes/          # API routes
│   │   │   └── services/        # Business logic
│   │   └── package.json
│   └── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 