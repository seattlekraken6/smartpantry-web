const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.WEB_PORT || 4000;
const DIST = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : __dirname;

app.use(express.json({ limit: '12mb' }));

app.post('/api/gemini', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(501).json({
      error: 'GEMINI_API_KEY is not configured on this server. Set it in the environment or save a key in the browser AI Setup modal.'
    });
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(text);
  } catch (error) {
    res.status(502).json({ error: 'Gemini request failed', detail: error.message });
  }
});

app.use(express.static(DIST));

// SPA fallback: for any route not found as a file, serve the matching HTML or index.html
app.get('*', (req, res) => {
  // Try to find a matching .html file
  const urlPath = req.path.replace(/\/$/, '');
  const candidates = [
    path.join(DIST, urlPath + '.html'),
    path.join(DIST, urlPath, 'index.html'),
    path.join(DIST, 'index.html'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SmartPantry web app running on port ${PORT}`);
});
