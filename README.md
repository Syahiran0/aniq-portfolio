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
  admin/     the dashboard (schema.js describes every editable field) + AdminGate (login screen)
  lib/       github.js + publish.js (publish from the dashboard), image.js, hooks.js
```

## The dashboard

Open `/#/admin` and sign in with the password from your `.env` file (see *Login* below). Every page of the site is a form: edit, add, delete, duplicate and reorder entries, upload photos (they are resized in the browser automatically).

* Edits are saved as a **draft in your browser only**. Open the site in the same browser to preview them; a banner says *Previewing unpublished changes*. Visitors never see drafts.
* **Publish** commits `content.json` (and any new images) to your GitHub repo in a single commit. GitHub then rebuilds and deploys the site (about a minute).
* **Export / Import** a JSON backup at any time.

### One-time publish setup

1. Create a **fine-grained personal access token**: <https://github.com/settings/personal-access-tokens/new>
   * Repository access → *Only select repositories* → this portfolio repo
   * Permissions → Repository → **Contents: Read and write**
2. Dashboard → **Publish** → enter your GitHub username, repo name, branch and paste the token.
3. Click *Test connection*, then *Publish*.

The token is stored only in that browser's `localStorage` and only sent to `api.github.com`. Use *Forget token on this device* on shared computers.

### Login

The dashboard sits behind a password that is checked **on the server** (Vercel functions in `api/`), never in the browser:

* `ADMIN_PASSWORD` is the password you type. `SESSION_SECRET` (32+ random characters) signs the login cookie. Both live in `.env` (gitignored) locally and in Vercel's *Environment Variables* in production. See `.env.example`.
* A correct password sets a 12-hour `HttpOnly`, `SameSite=Strict` cookie. The dashboard code is only downloaded after the server confirms it. Five wrong guesses from one address lock that address out for 15 minutes, and every wrong guess is delayed.
* If the login service can't be reached (for example on GitHub Pages, which has no server) the dashboard stays closed.
* The login stops strangers opening the editor. What actually protects your live site from being changed is the GitHub token above, which only you have.

**Change the password:** edit `ADMIN_PASSWORD` in `.env`, then run `npm run env:push` and redeploy (`npx vercel deploy --prod`, or push a commit). Changing it also signs out every existing session.

**Local development:** `npm run dev` serves the same `/api` functions and reads `.env`, so login works without the Vercel CLI.

### Adding a new field or section

1. Add the data to `src/content/content.json`.
2. Describe it in `src/admin/schema.js` (one line per field).
3. Render it with `useContent()` in a section component.

No dashboard code needs to change.

## Deploying (free)

**Vercel (recommended — needed for the dashboard login)**

1. Import the repo on Vercel (framework preset *Vite*, no settings to change), connected to GitHub so every push to `main`, including dashboard publishes, redeploys.
2. Project → *Settings → Environment Variables*: add `ADMIN_PASSWORD` and `SESSION_SECRET` for *Production* (or run `npm run env:push` to copy them from `.env`).
3. Redeploy once so the variables take effect.

**GitHub Pages (static site only)** — the public site works, but Pages has no server, so the dashboard login can't run there and `/#/admin` stays closed.

1. Repo → *Settings → Pages → Build and deployment → Source: **GitHub Actions***.
2. Every push to `main` runs `.github/workflows/deploy.yml` and redeploys.

Routing uses `HashRouter` and the build uses relative asset paths, so the same build works on Vercel, on a sub-path (`user.github.io/repo/`), or on a custom domain.
