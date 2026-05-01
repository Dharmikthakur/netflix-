# Netflix Clone — Full Stack

A Netflix-like streaming platform built with Next.js, MongoDB, NextAuth and TMDB API.

## Required Credentials (fill in `.env.local`)

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [mongodb.com/atlas](https://www.mongodb.com/atlas) — free tier |
| `TMDB_API_KEY` | [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) — free |
| `GOOGLE_CLIENT_ID / SECRET` | [console.cloud.google.com](https://console.cloud.google.com) |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure



adding new apis 


```
├── lib/              # MongoDB connection
├── models/           # Mongoose User model
├── pages/
│   ├── api/          # Backend API routes
│   ├── index.js      # Landing page
│   ├── login.js      # Sign-in page
│   ├── register.js   # Sign-up page
│   ├── profiles.js   # Profile selection
│   ├── browse.js     # Main browse (protected)
│   └── movie/[id].js # Movie detail
├── components/       # Reusable UI components
├── styles/           # Global + module CSS
└── public/           # Static assets
```
