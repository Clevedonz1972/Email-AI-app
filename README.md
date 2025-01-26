# Neurodiverse Email AI

An accessible email client designed with neurodiversity in mind.

## Project Structure

```
neurodiverse-email-ai/
├── backend/
│   ├── email_api/
│   │   ├── client.py
│   │   └── providers/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Setup

### Backend Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask server:
```bash
flask run
```

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## Features

- Accessible email interface
- Authentication system
- Email management
- Dark/Light mode support
- Responsive design

## Development

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 