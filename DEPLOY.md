# GitHub Pages deployment

The site is deployed as a static GitHub Pages site by
[`.github/workflows/pages.yml`](.github/workflows/pages.yml).

```powershell
npm install
npm run validate:frontend
```

In the repository settings, set **Pages → Build and deployment → Source** to
**GitHub Actions**. The custom domain is configured by the `CNAME` file as
`ratulcr.dev`; point the domain's DNS at GitHub Pages as described in GitHub's
custom-domain documentation.

The contact form remains in the UI and currently opens the visitor's email
client. Set `messageFormAction` in `site.config.js` later to connect a hosted
email-form service; no server or database is required by this site.
