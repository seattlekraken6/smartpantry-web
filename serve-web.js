const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.WEB_PORT || 4000;
const DIST = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : __dirname;
const envLocal = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocal)) {
  fs.readFileSync(envLocal, 'utf8').split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) return;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  });
}

const ROUTE_MAP = {
  '': 'index.html',
  '/': 'index.html',
  '/(tabs)': 'index.html',
  '/(tabs)/index': 'index.html',
  '/(tabs)/inventory': 'inventory.html',
  '/(tabs)/grocery': 'grocery.html',
  '/(tabs)/meals': 'meals.html',
  '/(tabs)/settings': 'settings.html',
  '/(tabs)/designer': 'designer.html',
  '/inventory': 'inventory.html',
  '/grocery': 'grocery.html',
  '/meals': 'meals.html',
  '/settings': 'settings.html',
  '/designer': 'designer.html',
  '/smart-capture': 'smart-capture.html',
  '/smart-cart': 'smart-cart.html',
  '/forecasting': 'forecasting.html',
  '/inventory-history': 'inventory-history.html',
  '/community': 'community.html',
  '/profile': 'profile.html',
  '/privacy': 'privacy.html',
  '/subscription': 'subscription.html',
  '/auth/login': 'auth/login.html',
  '/item/add': 'item/add.html',
  '/recipe/add': 'recipe/add.html',
  '/grocery/orders': 'grocery/orders.html',
  '/grocery/checkout': 'grocery/checkout.html'
};

const HTML_REDIRECTS = Object.fromEntries(
  Object.entries(ROUTE_MAP)
    .filter(([route, file]) => route && route !== '/' && file.endsWith('.html'))
    .map(([route, file]) => [`/${file}`, route])
);
HTML_REDIRECTS['/index.html'] = '/';

app.use(express.json({ limit: '12mb' }));

app.post('/api/openai', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(501).json({
      error: 'OPENAI_API_KEY is not configured on this server.'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(text);
  } catch (error) {
    res.status(502).json({ error: 'OpenAI request failed', detail: error.message });
  }
});

app.use((req, res, next) => {
  const target = HTML_REDIRECTS[decodeURIComponent(req.path)];
  if (target) {
    res.redirect(302, target);
    return;
  }
  next();
});

app.use(express.static(DIST));

// SPA fallback: for any route not found as a file, serve the matching HTML or index.html
app.get('*', (req, res) => {
  // Try to find a matching .html file
  const urlPath = req.path.replace(/\/$/, '');
  const mapped = ROUTE_MAP[urlPath] || ROUTE_MAP[decodeURIComponent(urlPath)];
  const candidates = [
    mapped ? path.join(DIST, mapped) : null,
    path.join(DIST, urlPath),
    path.join(DIST, urlPath + '.html'),
    path.join(DIST, urlPath, 'index.html'),
    path.join(DIST, 'index.html'),
  ].filter(Boolean);
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
