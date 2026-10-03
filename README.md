# Aniq Ihtisyam Syahiran — Portfolio

React + Vite portfolio with a built-in **content dashboard**, so you can change text, photos, achievements, stories and certificates without opening the code.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Where things live

| You want to…                          | Go to                                                         |
| ------------------------------------- | ------------------------------------------------------------- |
| Change any text / list on the site    | **Dashboard** → `http://localhost:5173/#/admin` (or the 🔒 icon in the footer) |
| Attach / replace / remove your CV     | **Dashboard → Resume / CV** (or drop a PDF in `public/uploads/` and type `uploads/<name>.pdf` there) |
| See the raw content                   | `src/content/content.json` (the single source of truth)       |
| Change colours, radius, fonts         | `src/styles/tokens.css`                                       |
| Reorder / hide / add a site section   | `src/pages/Home.jsx` (and the "Site settings" page in the dashboard) |
| Change how a section looks            | `src/sections/<Name>.jsx` + `<Name>.css`                      |

```
src/
  content/   content.json + store.js (published content, plus your unpublished draft)
  sections/  Hero, Work, Achievements, About, Stories, Journey, Certifications, Skills, Leadership, Gallery, Connect
  components/ Cover, Modal, DetailModal, Reveal, Icons
  layout/    Nav, Footer, ConnectModal
  admin/     the dashboard (schema.js describes every editable field)
  lib/       github.js + publish.js (publish from the dashboard), image.js, hooks.js
```

## The dashboard

Open `/#/admin`. Every page of the site is a form: edit, add, delete, duplicate and reorder entries, upload photos (they are resized in the browser automatically).

* Edits are saved as a **draft in your browser only**. Open the site in the same browser to preview them; a banner says *Previewing unpublished changes*. Visitors never see drafts.
* **Publish** commits `content.json` (and any new images) to your GitHub repo in a single commit. GitHub then rebuilds and deploys the site (about a minute).
* **Export / Import** a JSON backup at any time.

### One-time publish setup

1. Create a **fine-grained personal access token**: <https://github.com/settings/personal-access-tokens/new>
   * Repository access → *Only select repositories* → this portfolio repo
   * Permissions → Repository → **Contents: Read and write**
2. Dashboard → **Publish** → enter your GitHub username, repo name, branch and paste the token.
3. Click *Test connection*, then *Publish*.

The token is stored only in that browser's `localStorage` and only sent to `api.github.com`. Anyone can open `/#/admin`, but without the token they can only change their own local draft, not your live site. Use *Forget token on this device* on shared computers.

### Adding a new field or section

1. Add the data to `src/content/content.json`.
2. Describe it in `src/admin/schema.js` (one line per field).
3. Render it with `useContent()` in a section component.

No dashboard code needs to change.

## Deploying (free)

**GitHub Pages (recommended — free, and the dashboard publishes to the same repo)**

1. Push this repo to GitHub (public repo; Pages on free accounts needs public).
2. Repo → *Settings → Pages → Build and deployment → Source: **GitHub Actions***.
3. Every push to `main` (including dashboard publishes) runs `.github/workflows/deploy.yml` and redeploys.

**Vercel (alternative)** — import the repo, framework preset *Vite*, no settings to change. It also redeploys on every push.

Routing uses `HashRouter` and the build uses relative asset paths, so the same build works on both, on a sub-path (`user.github.io/repo/`), or on a custom domain.
