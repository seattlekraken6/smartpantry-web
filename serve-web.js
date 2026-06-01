const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.WEB_PORT || 4000;
const DIST = path.join(__dirname, 'dist');

// Serve static assets
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
  console.log(`Pantry Pal web app running on port ${PORT}`);
});
