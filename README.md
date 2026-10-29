# LEAP · Leo Entrepreneurs Advancement Platform

A public directory where anyone can discover and filter businesses run by Leos, and Leos can sign in to list their businesses, products and services.
An initiative of the **Leo Club of Biyagama Alliance**.

## What's inside

| Folder | What it is |
| --- | --- |
| `client/` | React 18 + Vite frontend (React Router, Framer Motion, Lucide icons) |
| `server/` | Node.js + Express API with MySQL (`mysql2`), JWT auth, image uploads |
| `brand/` | LEAP logo files (SVG + PNG, dark and light); `brand/partners/` holds the full-size club, Leo MD 306, Leo and Lions logos (trimmed web copies are in `client/public/brand/`) |

The Node server also serves the built React app, so on cPanel you run **one Node app** that hosts both the website and the API.

## Features

- **Public:** home page with live stats, category browsing and trending listings; directory with search (names, taglines, towns, product/service titles), category, district, product/service and sort filters; business profile pages with contact buttons (call, WhatsApp, email, website, Facebook, Instagram) and a products/services showcase.
- **Leos:** sign up with Leo club and membership ID, add one or more businesses, upload a logo and cover, add products and services with photos and prices, see review status and reviewer notes, edit profile and password.
- **Admins:** review queue to approve or send back listings with a note, feature listings on top, suspend members or promote admins, manage categories and their icons.
- **Leo & Lions identity:** the Leo Club of Biyagama Alliance crest in the navbar, and the club, Leo Multiple District 306, Leo and Lions International logos on the home page, the About page and in the footer. Theme colours are taken from those logos.
- **Look and feel:** dark futuristic theme with an interactive particle network, animated grid, orbiting logo, text-decode headline, 3D tilt cards with cursor glow, animated page transitions, count-up stats and skeleton loaders. Animations switch off for people who set "reduce motion".

## Run it locally

You need Node 18+ and MySQL or MariaDB.

```bash
# 1. Database
mysql -u root -e "CREATE DATABASE leap; CREATE USER 'leap'@'localhost' IDENTIFIED BY 'leap_pass'; GRANT ALL ON leap.* TO 'leap'@'localhost';"

# 2. API
cd server
cp .env.example .env        # then edit DB_* and JWT_SECRET
npm install
npm run seed                # optional: six demo businesses (login demo@leap.local / demo12345)
npm run create-admin -- you@example.com "a-strong-password" "Your Name"
npm run dev                 # http://localhost:4000

# 3. Frontend (second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :4000)
```

`npm run build` in `client/` builds the site and copies it to `server/public/`, after which `http://localhost:4000` serves everything.

## Deploying to cPanel

See [DEPLOY-CPANEL.md](DEPLOY-CPANEL.md).

## API overview

| Method | Path | Who |
| --- | --- | --- |
| GET | `/api/meta`, `/api/stats` | public |
| GET | `/api/businesses?q=&category=&district=&type=&sort=&page=` | public |
| GET | `/api/businesses/:slug` | public (owner/admin can preview unapproved) |
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET/PUT | `/api/auth/me` | signed in |
| GET/POST/PUT/DELETE | `/api/my/businesses[/:id]` | owner |
| POST | `/api/my/businesses/:id/offerings` | owner |
| PUT/DELETE | `/api/my/offerings/:id` | owner |
| POST | `/api/uploads` (field `image`, max 3 MB) | signed in |
| GET/PATCH | `/api/admin/businesses`, `/api/admin/users` | admin |
| POST/DELETE | `/api/admin/categories` | admin |

New listings start as **pending** and only appear publicly once an admin approves them. If an admin rejects a listing, editing it puts it back in the queue.
