# Deploy to GitHub Pages

## One-time setup

1. Create a new repository on GitHub (e.g. `PortfolioV1`). Do **not** add a README if you already have this project locally.

2. In the repo folder, add the remote and push:

```bash
cd D:\PortfolioV1
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

3. On GitHub: **Settings → Pages → Build and deployment**
   - **Source:** GitHub Actions

4. After the first push, open **Actions** and wait for **Deploy GitHub Pages** to finish.

5. Your site will be at:

   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

6. Optional: set `seo.siteUrl` in `site.config.js` to that URL (no trailing slash) and update `sitemap.xml` loc URLs.

## Updates

```bash
git add -A
git commit -m "Describe your change"
git push
```

Pages redeploys automatically on each push to `main`.
