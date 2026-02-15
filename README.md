# Leyli Tahmasebi · Portfolio

Personal portfolio built with React, TypeScript, and Vite.

---

## Deploying (so anyone can open your portfolio)

Your site is a static app: run `npm run build` and deploy the `dist` folder. Here are three free options.

### Option 1: Vercel (recommended)

1. Push this project to GitHub (create a repo and push your code).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New** → **Project**, import your `portfolio` repo.
4. Leave the defaults (Framework: Vite, Build: `npm run build`, Output: `dist`). Click **Deploy**.
5. You’ll get a URL like `https://portfolio-xxx.vercel.app`. You can add a custom domain later in Project Settings.

### Option 2: Netlify

1. Push this project to GitHub.
2. Go to [netlify.com](https://netlify.com) and sign in with GitHub.
3. **Add new site** → **Import an existing project** → choose your repo.
4. Build command: `npm run build`. Publish directory: `dist`. Click **Deploy**.
5. Your site will be at `https://something.netlify.app`.

### Option 3: GitHub Pages

1. Push this project to a GitHub repo (e.g. `Lili-ta/portfolio`).
2. Install the CLI: `npm install -g gh-pages`
3. In `package.json` add a `"homepage"` and deploy script (see below), then run:
   - `npm run build`
   - `npx gh-pages -d dist`
4. In the repo go to **Settings** → **Pages** → Source: **Deploy from a branch** → branch: `gh-pages`, folder: `/ (root)` → Save.
5. Your site will be at `https://lili-ta.github.io/portfolio` (use your username and repo name).

For GitHub Pages you need a correct **base** in Vite so assets load. If your repo is `https://github.com/Lili-ta/portfolio`, the site URL is `https://lili-ta.github.io/portfolio`, so set base to `"/portfolio/"` in `vite.config.ts` (see [Vite base](https://vitejs.dev/config/shared-options.html#base)).

---

## Local development

**Frontend (React)**  
- `npm install`  
- `npm run dev` — dev server at http://localhost:5173  
- `npm run build` — production build in `dist`  

**Backend (.NET 8 API)**  
- `cd backend/Portfolio.Api`  
- `dotnet run` — API at http://localhost:5050 (Swagger at /swagger)  
- To show **Live from .NET** data on the site: set `VITE_API_URL=http://localhost:5050` in a `.env` file, then restart `npm run dev`.  

**Deploying the .NET API** (optional, for production “Live from .NET”):  
- **Azure App Service**: Create a Web App (e.g. Linux, .NET 8), deploy from the `backend/Portfolio.Api` folder, then set `VITE_API_URL` in Vercel to your API URL.  
- **Railway / Fly.io**: Deploy the `backend/Portfolio.Api` project, then set `VITE_API_URL` in Vercel to the deployed API URL.  

### Deploy .NET API to Railway (free tier)

1. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your **portfolio** repo and connect it.
4. Railway will create a service. Open it, then go to **Settings**.
5. Set **Root Directory** to `backend/Portfolio.Api` (so only the API is built).
6. Under **Deploy**, leave **Build Command** empty (Railway will detect .NET) or set to `dotnet publish -c Release -o out`. Set **Start Command** to `dotnet out/Portfolio.Api.dll` (or leave blank to use Railway’s default).
7. In **Variables**, you don’t need to add `PORT` — Railway sets it automatically (the API already uses it).
8. Go to **Settings** → **Networking** → **Generate Domain** to get a public URL (e.g. `https://portfolio-api-production-xxxx.up.railway.app`).
9. Copy that URL. In **Vercel** → your portfolio project → **Settings** → **Environment Variables**, add `VITE_API_URL` = your Railway URL (no trailing slash), then redeploy the frontend.

### AI chat (OpenAI)

The floating chat uses **OpenAI** (GPT) via a Vercel serverless function at `/api/chat`. To enable it:

1. Get an API key from [platform.openai.com](https://platform.openai.com/api-keys).
2. In **Vercel** → your portfolio project → **Settings** → **Environment Variables**, add **`OPENAI_API_KEY`** (value = your key). Mark it **Sensitive** if you like.
3. Redeploy. The chat will call the API and return real AI replies.

The chat only works when the site is deployed on Vercel (the `/api` route is serverless). For local testing, run `vercel dev` so the API route is available.

---

## React + TypeScript + Vite (template notes)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
