# Sidharth Dhiman - Portfolio

Personal portfolio site for **Sidharth Dhiman** (Forward Deployment Engineer / Full-Stack & Automation).

## Tech Stack

- Static HTML / CSS / JavaScript (no build step)
- Bootstrap 3 (CSS framework + grid)
- jQuery + custom reveal-on-scroll animations
- Content rendered from a single data file: `js/data.js`
- Contact form handled by a Netlify serverless function that forwards messages to Telegram

## Structure

- `index.html` — page structure (hero, about, experience, projects, skills, recognition, education, contact)
- `css/style.css` — site styles
- `js/data.js` — **centralized content**: projects (name, status, description, tags, GitHub links), skills
- `js/custom.js` — rendering + scroll behavior + contact form submit
- `netlify/functions/contact.js` — serverless contact handler (sends to Telegram)
- `server.js` — zero-dependency local dev server (static files + runs the contact function)
- `netlify.toml` — Netlify build/redirect config
- `.env.example` — template for local Telegram credentials

## Editing Content

Everything data-driven lives in `js/data.js`:

- **Projects** — edit the `projects` array. GitHub URLs live here.
- **Skills** — edit the `skills` array. Logo files live in `img/skills/` (SVG, one per skill, tinted brand blue); add an entry to `skillLogos` when adding a new skill that has a logo.
- **Resume link** — the hero "Resume" button points to the resume PDF in the repo root; update the `href` in `index.html` when a new resume is ready.

## Run locally

To preview the site you can serve the folder with any static server, e.g.:

```bash
python3 -m http.server 8080
```

But the contact form's `/api/contact` endpoint only runs via `node server.js` or the Netlify CLI - see below.

Then open http://localhost:8080.

To test the contact form locally, the form's `/api/contact` endpoint must actually run - a plain static server (e.g. `python3 -m http.server`) will return 404 and the form will show "Something went wrong." Two options:

**Option 1 (recommended, zero dependencies)** - run the included dev server, which serves the site and runs the Netlify function (it reads `.env`):

```bash
node server.js
```

Then open http://localhost:3000.

**Option 2** - Netlify CLI:

```bash
npm i -g netlify-cli
netlify dev
```

Then open the URL it prints (usually http://localhost:8888).

**VS Code Live Server (port 5500)** — Live Server is a static server and rejects POST, so `/api/contact` returns `405 Method Not Allowed`. Keep using it for auto-reload by adding a proxy to your VS Code `settings.json` (run `node server.js` in a terminal at the same time):

```json
"liveServer.settings.proxy": {
  "enable": true,
  "baseUri": "/api/contact",
  "proxyUri": "http://127.0.0.1:3000/api/contact"
}
```

Then restart Live Server; static files still reload on 5500, but contact-form POSTs are forwarded to the function on 3000.

## Contact form -> Telegram

The contact form is a plain Name / Email / Message form. On submit it POSTs JSON to `/api/contact`, which is proxied to the Netlify function `netlify/functions/contact.js`. That function validates the input, checks a hidden honeypot field (spam trap), and sends the visitor's details to your private Telegram chat via the Telegram Bot API.

The visitor never needs Telegram - they just send you a message from the site.

### 1. Create a Telegram bot (BotFather)

1. Open Telegram and search for **@BotFather**.
2. Send `/newbot`.
3. Follow the prompts and choose a name + username for the bot.
4. BotFather replies with an **HTTP API token** that looks like `123456789:AA...`. Keep it private.

### 2. Start a conversation with your bot

Open your bot's chat (search for the username you chose) and press **Start** (send `/start`). This is required so the bot is allowed to message you.

### 3. Find your chat ID

Option 1 (easiest): forward a message from your bot to **@userinfobot**, or open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` after sending your bot a message. The response contains `"chat":{"id":...}` — that number is your chat ID.

Option 2: `@RawDataBot` also shows your personal chat id.

### 4. Add the credentials as environment variables

**Local development** — create a `.env` file at the project root (from `.env.example`):

```bash
TELEGRAM_BOT_TOKEN=123456789:AA...your-bot-token...
TELEGRAM_CHAT_ID=123456789
```

`.env` is gitignored. Never commit real credentials.

**Production (Netlify)** — the build system does not read `.env` files. Set the same two variables in the Netlify dashboard:

1. Open your site in Netlify → **Site configuration** → **Environment variables**.
2. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` with the same values.
3. Re-deploy (or the next deploy) so the function picks them up.

### 5. Test the contact form

- Open the site (locally via `node server.js` or `netlify dev`, or the deployed URL).
- Submit the form with Name, Email, Message → you should get a Telegram notification within a couple of seconds.
- Test the error path by temporarily removing the env vars, and the validation errors by leaving fields empty.

### Security notes

- The bot token and chat ID are **only** read server-side (`process.env`) inside the Netlify function. They never reach the browser.
- `.env` is ignored by Git (see `.gitignore`).
- A lightweight rate limit (20 POSTs/min per IP) is configured on the `/api/contact` redirect in `netlify.toml`, plus a hidden honeypot field in the form.

## Deployment

Deployable as a static site on Netlify, Vercel, GitHub Pages, or any static host.

The contact function is **Netlify-specific**. To deploy elsewhere, move the logic from `netlify/functions/contact.js` into the platform's serverless format (e.g. Vercel `api/contact.js`).