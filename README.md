# SmartPantry — AI Kitchen Manager

> *"Design. Stock. Eat. Automatically."*

A fully-featured AI-powered smart pantry and fridge web app.

## Features

- **3D Pantry & Fridge Designer** — SVG-based interactive fridge/pantry with 6 material finishes, 6 pre-set templates, custom layout builder, and AR preview
- **AI Inventory Management** — Barcode/voice/photo input, color-coded expiry alerts, "Use First" list, interactive fridge zone visualization
- **AI Meal Planner** — Weekly calendar, AI-generated meal plans, nutrition tracking, ingredient availability indicators
- **Grocery & Auto-Ordering** — Auto-generated lists by aisle, Instacart/Amazon Fresh/Walmart/Whole Foods integration, smart replenishment rules, order history
- **Subscription Tiers** — Free, Premium ($9.99/mo), Lifetime ($149)
- **Dark Mode** — Full light/dark theme support

---

## Hosting Options

### Option 1 — Netlify (Easiest, Free)

1. Go to [netlify.com](https://netlify.com) and sign up / log in
2. Click **"Add new site" → "Deploy manually"**
3. Drag and drop the **`dist/`** folder onto the upload area
4. Your site is live instantly at a `*.netlify.app` URL
5. (Optional) Add a custom domain in Site Settings

### Option 2 — Vercel (Free)

1. Install Vercel CLI: `npm i -g vercel`
2. From this folder, run: `vercel --prod`
3. Follow the prompts — select "Other" as framework
4. Set the output directory to `dist`
5. Your site is live at a `*.vercel.app` URL

### Option 3 — GitHub Pages (Free)

1. Create a new GitHub repository
2. Push the contents of the `dist/` folder to the `gh-pages` branch
3. Enable GitHub Pages in repository Settings → Pages
4. Your site is live at `https://yourusername.github.io/repo-name`

### Option 4 — Self-Hosted Node.js Server

Requirements: Node.js 18+

```bash
# Install dependencies
npm install

# Start the server (default port 4000)
node serve-web.js

# Or set a custom port
WEB_PORT=3000 node serve-web.js
```

The app will be available at `http://localhost:4000` (or your chosen port).

For production, use a process manager like PM2:
```bash
npm install -g pm2
pm2 start serve-web.js --name smartpantry
pm2 save
pm2 startup
```

### Option 5 — Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 4000
CMD ["node", "serve-web.js"]
```

```bash
docker build -t smartpantry .
docker run -p 4000:4000 smartpantry
```

---

## File Structure

```
smartpantry-deploy/
├── dist/               ← Built web app (all HTML, JS, CSS, assets)
│   ├── index.html      ← Main entry point
│   ├── _expo/          ← Expo web bundles
│   ├── assets/         ← Images, fonts, icons
│   ├── (tabs)/         ← Tab route pages
│   ├── item/           ← Item detail pages
│   ├── meal/           ← Meal detail pages
│   ├── grocery/        ← Grocery pages
│   ├── designer/       ← Designer pages
│   └── subscription.html
├── serve-web.js        ← Node.js static server (Option 4)
├── package.json        ← Node.js dependencies
└── README.md           ← This file
```

---

## Notes

- All data is stored in the browser's **localStorage** — no backend or database required for the static version
- The app works fully offline after the first load
- For multi-user sync and cloud storage, a backend integration would be needed

---

Built with Expo (React Native Web) · React 19 · NativeWind (Tailwind CSS)
