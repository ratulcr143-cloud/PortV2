# PortV2 portfolio

A responsive portfolio for **job search**, **freelance clients**, and **showcase** — Three.js hero scene, GSAP motion, services, testimonials, project filters, SEO, and config-driven content.

## Customize

Edit **`site.config.js`** for:

| Area | Keys |
|------|------|
| Identity | `name`, `roleTitle`, `heroLine*`, `tagline`, `availability`, `now` |
| Hire & contact | `email`, `bookCallUrl`, `contactLead`, `messageFormAction` |
| SEO | `seo.siteUrl`, `seo.description`, `seo.ogImage`, `seo.twitterHandle` |
| Freelance | `services[]`, `testimonials[]` |
| Work | `experience[]` (+ `highlights[]`), `projects[]` (+ `outcome`, `liveUrl`, `repoUrl`, `image`, `featured`) |
| Showcase | `githubHighlight`, `posts[]`, `blogIntro` |
| Resume | `resume.*` |

Replace **`assets/og-cover.svg`** (or set `seo.ogImage` to a PNG) for link previews. Update **`sitemap.xml`** URLs when `seo.siteUrl` is set.

### Resume

- **`resume.html`** — preview and download your PDF
- Add **`assets/resume.pdf`** (see `assets/README.txt`)

### Blog

- **`blog.html`** — lists all posts
- **`post.html?slug=your-slug`** — single article

Colors and fonts: **`styles.css`** (`:root`).

## Run locally

The site needs a **local web server** (opening `index.html` directly as `file://` often breaks scripts and textures). You need **Node.js** installed ([nodejs.org](https://nodejs.org/)).

**Option A — npm (recommended)**

```powershell
cd d:\PortfolioV1
npm start
```

Then open **http://localhost:3000**

**Option B — double-click**

- Windows: run **`start.bat`** or **`start.ps1`** in this folder.

**Option C — one-off without package.json**

```powershell
npx --yes serve d:\PortfolioV1 -l 3000
```

Three.js, GSAP, and hero tech icons load from the internet on first visit.

## Deploy to GitHub Pages

Push the repository to GitHub and enable **Settings → Pages → GitHub Actions**.
The workflow in `.github/workflows/pages.yml` deploys the repository root as a
static site on pushes to `main`. The configured custom domain is
`https://ratulcr.dev`.

Run `npm run validate:frontend` locally to syntax-check the static JavaScript.

## Features

- Scroll-spy navigation on the home page
- Project tag filters
- Open Graph, Twitter cards, JSON-LD `Person`, canonical URL
- Form honeypot; hosted-email-service-ready contact form
- Faster loader on repeat visits (`sessionStorage`)
- **prefers-reduced-motion** — static layout without heavy WebGL/motion

## Files

| File | Role |
|------|------|
| `index.html` | Home — hero, services, work, projects, testimonials, writing, contact |
| `site.config.js` | Your content |
| `common.js` | Nav, cursor, loader, SEO, scroll-spy |
| `script.js` | Home rendering and motion |
| `scene3d.js` | WebGL background |
| `robots.txt` / `sitemap.xml` | Crawlers (update URLs on deploy) |
