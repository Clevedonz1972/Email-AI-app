// server.js
// Make sure to install express by running: npm install express

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Use the PORT from Render/Vercel or default to 3000
const PORT = process.env.PORT || 3000;

// If a build folder exists (for static assets), serve it. Adjust if you later add a build step.
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  // For client-side routing using React Router (if applicable)
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // No build folder exists, so send a simple response
  app.get('/', (req, res) => {
    res.send('Server is running, but no build folder found.');
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 