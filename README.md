# Sidharth Dhiman — Portfolio

Personal portfolio site for **Sidharth Dhiman** (FDE / Full-Stack & Automation).

## Tech Stack

- Static HTML / CSS / JavaScript (no build step)
- Bootstrap 3 (CSS framework + grid)
- jQuery + AOS (scroll animations) + Stellar (parallax)
- Content rendered from a single data file: `js/data.js`

## Structure

- `index.html` — page structure (hero, about, experience, projects, skills, recognition, education, contact)
- `css/style.css` — site styles
- `js/data.js` — **centralized content**: projects (name, status, description, tags, GitHub links), skills
- `js/custom.js` — rendering + scroll behavior

## Editing Content

Everything data-driven lives in `js/data.js`:

- **Projects** — edit the `projects` array. GitHub URLs live here.
- **Skills** — edit the `skills` array.
- **Resume link** — the hero "Resume" button points to the resume PDF in the repo root; update the `href` in `index.html` when a new resume is ready.

## Run locally

Serve the folder with any static server, e.g.:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deployment

Deployable as a static site on Netlify, Vercel, GitHub Pages, or any static host.