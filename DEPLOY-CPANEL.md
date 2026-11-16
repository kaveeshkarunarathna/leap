# Deploying LEAP to cPanel

This guide fits a cPanel account that already hosts other sites, each with its own folder in the home directory and a separate `api.*` folder for its Node backend. LEAP follows the same pattern and doesn't touch any other site.

## The plan

| What | Address | Folder in your home directory |
| --- | --- | --- |
| Website (static files) | `leap.leosofbiyagamaalliance.site` | `leap.leosofbiyagamaalliance.site/` |
| API (Node.js app) | `api.leap.leosofbiyagamaalliance.site` | `api.leap.leosofbiyagamaalliance.site/` (cPanel's routing file only) |
| API code | (not public) | `leap-api/` |
| Preview before launch | `beta.leap.leosofbiyagamaalliance.site` | same folder as the website |

Two zips:

- **`leap-web-cpanel.zip`**: the built website. Already set to call `https://api.leap.leosofbiyagamaalliance.site`.
- **`leap-api-cpanel.zip`**: the Node.js API (no website inside).

Right now `leap.leosofbiyagamaalliance.site` shows the coming-soon page from GitHub Pages. You can set up everything below while it stays up. Test on the `beta` address, then switch `leap` over on launch day (step 8).

Why the API code goes in `leap-api/` and not in the `api.leap…` folder: files inside a domain's folder can be downloaded by anyone who guesses the name, and the API code sits next to secrets such as the database password. Keeping it in its own folder, outside any domain folder, means it can only be reached through the app.

---

## 1. Point the new addresses at your cPanel server (Namecheap)

1. Find your server's IP: cPanel home page, right-hand column, **Shared IP Address**. (It's the same IP your other sites use.)
2. Namecheap → **Domain List** → `leosofbiyagamaalliance.site` → **Manage** → **Advanced DNS**.
3. **Add New Record** twice:

   | Type | Host | Value | TTL |
   | --- | --- | --- | --- |
   | A Record | `api.leap` | your server IP | Automatic |
   | A Record | `beta.leap` | your server IP | Automatic |

4. Leave the existing `leap` CNAME record (to `kaveeshkarunarathna.github.io`) alone for now. That keeps the coming-soon page live.

DNS usually takes 5 to 30 minutes.

## 2. Add the addresses in cPanel

cPanel → **Domains** → **Create A New Domain**. Do this three times, with **Share document root** unticked each time:

| Domain | Document root |
| --- | --- |
| `api.leap.leosofbiyagamaalliance.site` | `api.leap.leosofbiyagamaalliance.site` (cPanel suggests it) |
| `leap.leosofbiyagamaalliance.site` | `leap.leosofbiyagamaalliance.site` (cPanel suggests it) |
| `beta.leap.leosofbiyagamaalliance.site` | change it to `leap.leosofbiyagamaalliance.site`, so it shows the same files |

Adding `leap.…` in cPanel doesn't affect the coming-soon page. Visitors still go to GitHub, because DNS still points there.

## 3. Create the database

1. cPanel → **Manage My Databases** (or **MySQL® Databases**).
2. Create a database, e.g. `leap`. cPanel adds your account prefix, so it becomes `cpuser_leap`.
3. Create a user with a strong password, e.g. `cpuser_leapuser`.
4. **Add User To Database** → tick **ALL PRIVILEGES**.

Write down the full database name, user name and password. You don't need to import anything. The API creates its tables the first time it starts.

## 4. Create the API (Node.js app)

1. cPanel → **Setup Node.js App** → **Create Application**:

   | Setting | Value |
   | --- | --- |
   | Node.js version | 20.x (18 or newer works) |
   | Application mode | Production |
   | Application root | `leap-api` |
   | Application URL | `api.leap.leosofbiyagamaalliance.site` (pick it from the list, leave the path empty) |
   | Application startup file | `app.js` |

2. Click **Create**.
3. **File Manager** → open `leap-api/` → delete the placeholder `app.js` cPanel made → **Upload** `leap-api-cpanel.zip` → right-click → **Extract** → delete the zip. You should see `app.js`, `package.json`, `src/` and `uploads/` directly inside `leap-api/`.
4. Back in **Setup Node.js App**, edit the app and add these **Environment variables**:

   | Name | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `DB_HOST` | `localhost` |
   | `DB_USER` | full DB user, e.g. `cpuser_leapuser` |
   | `DB_PASSWORD` | the DB user's password |
   | `DB_NAME` | full DB name, e.g. `cpuser_leap` |
   | `JWT_SECRET` | a long random string, 40+ characters |
   | `CORS_ORIGIN` | `https://leap.leosofbiyagamaalliance.site,https://beta.leap.leosofbiyagamaalliance.site` |
   | `ADMIN_EMAIL` | the email you'll use as the first admin |
   | `ADMIN_PASSWORD` | a strong temporary password |

   Don't set `PORT`. cPanel handles it. `CORS_ORIGIN` is what allows the website to talk to the API, so copy it exactly, with no spaces and no slash at the end.

5. Click **Save**, then **Run NPM Install**, then **Restart**.
6. Check it: open `https://api.leap.leosofbiyagamaalliance.site/` (use `http://` until step 6). You should see `{"ok":true,"name":"LEAP API"}`.

## 5. Upload the website

1. **File Manager** → open `leap.leosofbiyagamaalliance.site/` → delete anything cPanel put there (e.g. a default `index.html` or `cgi-bin`).
2. Turn on **Settings → Show Hidden Files (dotfiles)** (top-right). The website includes a `.htaccess` file that you need to see.
3. **Upload** `leap-web-cpanel.zip` → **Extract** → delete the zip. You should see `index.html`, `.htaccess`, `assets/`, `brand/`, `favicon.svg` and `leap-logo.svg`.

## 6. Turn on HTTPS

cPanel → **SSL/TLS Status** → tick `api.leap…` and `beta.leap…` → **Run AutoSSL**. It needs DNS from step 1 to be working. If it fails, wait 30 minutes and run it again.

Logins send passwords, so don't skip this. The website only calls the API over `https`.

## 7. Test on the beta address

1. Open `https://beta.leap.leosofbiyagamaalliance.site`. You should see the LEAP home page.
2. Go to **Sign in** with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. You'll land in the Admin page.
3. Change the password (**My listings → Change password**). Then remove `ADMIN_PASSWORD` from the Node.js app's variables and **Restart**.
4. Register a test Leo account, add a listing with a logo, approve it as admin, and check it shows on **Explore**.
5. Refresh on a page like `/explore` to make sure it doesn't give a 404 (that's the `.htaccess` file's job).

## 8. Launch day: switch `leap` from the coming-soon page to the real site

1. Namecheap → **Advanced DNS** → delete the `leap` **CNAME** record (to `kaveeshkarunarathna.github.io`) → add **A Record**, host `leap`, value your server IP.
2. Wait 5 to 30 minutes, then cPanel → **SSL/TLS Status** → run **AutoSSL** for `leap.leosofbiyagamaalliance.site`.
3. Open `https://leap.leosofbiyagamaalliance.site` and sign in once to check.
4. GitHub → `leap` repository → **Settings → Pages**: remove the custom domain (or switch Pages off), so GitHub stops expecting that address.
5. Optional: once the real site is live, you can remove `beta.leap…` (in cPanel **Domains**, and its A record in Namecheap), and drop it from `CORS_ORIGIN`.

---

## Updating later

**API change** (anything in `server/`): upload the changed files into `leap-api/` (never `uploads/`), click **Run NPM Install** if `package.json` changed, then **Restart**.

**Website change** (anything in `client/`):

1. On your computer, in `client/`, copy `.env.example` to `.env.production` once. It already holds the right `VITE_API_URL`.
2. Run `npm install` once, then `npm run build`.
3. Zip the contents of `client/dist/`, including `.htaccess`. Upload the zip into `leap.leosofbiyagamaalliance.site/`, extract it over the old files, then delete the old `assets/index-*.js` and `.css` files that are no longer used.

## Backups

- **Database:** cPanel → Backup → download the MySQL database, or export from phpMyAdmin.
- **Uploaded images:** `leap-api/uploads/`. Back it up together with the database.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Website loads but listings never appear, and the browser console mentions CORS | `CORS_ORIGIN` on the API doesn't exactly match the website address (`https://`, no trailing slash). Fix it and **Restart**. |
| API address shows "Database setup failed" in `leap-api/stderr.log` | Check `DB_USER` / `DB_NAME` include the cPanel prefix and the user has ALL PRIVILEGES. |
| Sign-in says "Something went wrong" | `JWT_SECRET` is missing. Add it and **Restart**. |
| API address shows 503 / "Incomplete response" | **Run NPM Install** again, then **Restart**. Node must be 18+. |
| Refreshing `/explore` gives 404 | `.htaccess` is missing from the website folder. Turn on hidden files and upload it again. |
| Images upload but don't show | Make sure `leap-api/uploads/` exists with permissions 755, and that you're on the latest website zip. |
| AutoSSL fails for a new address | DNS hasn't reached the server yet. Check the A record, wait, and run it again. |

## All-in-one alternative

The API can also serve the website itself (one Node app, no CORS). Build with no `VITE_API_URL`, and the build copies the site into `server/public/`. Then use `server/` as the app root and point a single address at it. The split setup above matches how your other sites are organised, so use that unless you have a reason not to.
