# Deploy MDCATEMY to Vercel

## 1. Create the `dist` folder (local build)

From the project root:

```bash
# Install dependencies (if not already done)
npm install

# Build: copies index.html, styles.css, script.js, and assets/ into dist/
npm run build
```

After this, the **`dist/`** folder will contain everything needed to run the site:

- `dist/index.html`
- `dist/styles.css`
- `dist/script.js`
- `dist/assets/` (logo, etc.)

You can test locally by opening `dist/index.html` in a browser or serving the folder (e.g. `npx serve dist`).

---

## 2. Deploy on Vercel

### Option A: Deploy with Vercel CLI

1. **Install Vercel CLI** (one time):

   ```bash
   npm i -g vercel
   ```

2. **Log in** (one time):

   ```bash
   vercel login
   ```

3. **Deploy from the project root**:

   ```bash
   cd path/to/MDcatemy
   vercel
   ```

   When prompted:

   - **Set up and deploy?** → **Y**
   - **Which scope?** → your account
   - **Link to existing project?** → **N**
   - **Project name?** → e.g. `mdcatemy` (or press Enter)
   - **In which directory is your code?** → **./** (press Enter)
   - **Want to override the settings?** → **Y**
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install` (or leave default)

   Or skip prompts and run:

   ```bash
   vercel --prod
   ```

   Then set Build & Output in the Vercel dashboard (see Option B).

### Option B: Deploy with GitHub + Vercel Dashboard

1. **Push the project to GitHub**

   - Create a new repo and push your code (include `dist` in `.gitignore`; Vercel will build it).

2. **Add a `vercel.json`** in the project root (so Vercel knows how to build):

   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist"
   }
   ```

3. **Connect to Vercel**

   - Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
   - Import your GitHub repo.
   - **Build settings:**
     - **Framework Preset:** Other
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`
   - Click **Deploy**.

4. **Later deployments**

   - Push to the connected branch (e.g. `main`); Vercel will run `npm run build` and deploy the `dist` folder.

---

## 3. Optional: `vercel.json` in the repo

You can commit this so the dashboard and CLI both use the same settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

---

## Summary

| Step | Command / action |
|------|-------------------|
| 1. Install deps | `npm install` |
| 2. Build (create `dist`) | `npm run build` |
| 3. Deploy (CLI) | `vercel` or `vercel --prod` |
| 3. Deploy (GitHub) | Connect repo in Vercel → Build Command: `npm run build`, Output: `dist` |

The live site will be at a URL like `https://mdcatemy.vercel.app` (or your custom domain if you add one).
