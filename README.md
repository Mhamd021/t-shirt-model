# T-Shirt Model Frontend

Modern Next.js frontend for the T-Shirt model project. The app lets users register, log in, design custom shirts, upload artwork, save designs, manage saved designs, and create checkout orders through the hosted backend.

## Tech Stack

- Next.js 15
- React 19
- Three.js
- Axios
- Lottie React
- React Color
- React Icons

## Backend

Production backend:

```bash
https://t-shirt-backend-server-production.up.railway.app
```

The frontend reads the backend URL from:

```bash
NEXT_PUBLIC_API_URL
```

## Local Setup

Create a local `.env` file:

```bash
NEXT_PUBLIC_API_URL=https://t-shirt-backend-server-production.up.railway.app
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Production Build

Before deploying, run:

```bash
npm run build
```

Then test the main flows:

- Register
- Login
- Upload image
- Save design
- Load saved design after relogin
- Delete saved design
- Place order

## Vercel Deployment

Deploy the `t-shirt-model` folder as the Vercel project root.

Use these Vercel settings:

```bash
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

Add this environment variable in Vercel:

```bash
NEXT_PUBLIC_API_URL=https://t-shirt-backend-server-production.up.railway.app
```

After Vercel gives you the production frontend URL, add that URL to the Railway backend CORS environment variable.

Example:

```bash
FRONTEND_URLS=https://your-vercel-app.vercel.app,http://localhost:3000
```

Redeploy the backend after changing CORS.

## Environment Files

`.env` is ignored by Git through `.gitignore`. Use `.env.example` as the public template.
