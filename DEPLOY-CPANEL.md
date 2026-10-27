# Deploying LEAP to cPanel shared hosting

LEAP runs as a single Node.js app (website + API). Your host must offer **"Setup Node.js App"** in cPanel (CloudLinux / Passenger). Most Sri Lankan and international cPanel hosts do; if you can't find it, ask your host to enable Node.js.

You'll upload `leap-cpanel-upload.zip`, which already contains the built website.

## 1. Create the database

1. cPanel → **MySQL® Databases**.
2. Create a database, e.g. `leap` (cPanel will name it `cpuser_leap`).
3. Create a user with a strong password (e.g. `cpuser_leapuser`).
4. **Add user to database** and tick **ALL PRIVILEGES**.

Keep the full database name, user name and password for step 4. You don't need to import anything: the app creates its tables on first start. (If you prefer, `src/db/schema.sql` can be imported in phpMyAdmin.)

## 2. Create the Node.js app

cPanel → **Setup Node.js App** → **Create Application**:

| Setting | Value |
| --- | --- |
| Node.js version | 20.x (18 or newer works) |
| Application mode | Production |
| Application root | `leap` (a folder in your home directory, not inside `public_html`) |
| Application URL | your domain or a subdomain, e.g. `leap.yourclub.lk` |
| Application startup file | `app.js` |

Click **Create**. Leave the page open.

> Tip: host LEAP at the root of a domain or subdomain. A sub-path like `yourclub.lk/leap` would need extra routing changes.

## 3. Upload the files

1. cPanel → **File Manager** → open the `leap` folder (your application root).
2. Delete the placeholder `app.js` cPanel created, if any.
3. **Upload** `leap-cpanel-upload.zip`, then right-click it → **Extract**. You should see `app.js`, `package.json`, `src/`, `public/` and `uploads/` directly inside `leap/`.
4. Delete the zip.

## 4. Set the configuration

Back in **Setup Node.js App**, edit the app and add these **Environment variables** (or copy `.env.example` to `.env` in File Manager and fill it in):

| Name | Value |
| --- | --- |
| `DB_HOST` | `localhost` |
| `DB_USER` | your full DB user, e.g. `cpuser_leapuser` |
| `DB_PASSWORD` | the DB user's password |
| `DB_NAME` | your full DB name, e.g. `cpuser_leap` |
| `JWT_SECRET` | a long random string (40+ characters) |
| `ADMIN_EMAIL` | the email you'll use as the first admin |
| `ADMIN_PASSWORD` | a strong temporary password |
| `NODE_ENV` | `production` |

Don't set `PORT`; cPanel handles it.

## 5. Install and start

1. On the app's page click **Run NPM Install** and wait for it to finish.
2. Click **Restart**.
3. Open your Application URL. You should see the LEAP home page.
4. Go to `/login` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. You'll land in the Admin control room.
5. Change that password from **My listings → Change password**, then remove `ADMIN_PASSWORD` from the environment variables and restart. (It only ever creates an admin when none exists, so leaving it is harmless, but tidier to remove.)

Optional, if your host gives you **Terminal**: copy the "Enter to the virtual environment" command shown at the top of the Node.js app page, run it, then:

```bash
npm run seed           # adds 6 demo businesses for testing (demo@leap.local / demo12345)
npm run create-admin -- another-admin@yourclub.lk "StrongPassword" "Name"
```

Remove the demo account later from Admin → Members (suspend) or by deleting it in phpMyAdmin.

## 6. Turn on HTTPS

cPanel → **SSL/TLS Status** → run **AutoSSL** for the domain/subdomain. Logins send passwords, so don't skip this.

## Updating the site later

1. On your computer, in `client/`, run `npm install` once and then `npm run build`. This refreshes `server/public/`.
2. Upload the new `server/public/` folder (and any changed `server/src/` files) over the old ones in `leap/`.
3. If `server/package.json` changed, click **Run NPM Install**.
4. Click **Restart**.

## Backups

- **Database:** cPanel → Backup → download a MySQL database backup, or export from phpMyAdmin.
- **Uploaded images:** the `leap/uploads/` folder. Back it up together with the database.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Database setup failed" in the app log (`leap/stderr.log` or the log path on the app page) | Check `DB_USER` / `DB_NAME` include the cPanel prefix and the user has ALL PRIVILEGES on the DB. |
| Page loads but sign-in says "Something went wrong" | `JWT_SECRET` is missing. Add it and restart. |
| 503 / "Incomplete response" | Run NPM Install again, then Restart. Make sure Node is 18+. |
| Image upload fails | Make sure `leap/uploads/` exists and is writable (permissions 755). Images must be under 3 MB. |
| Refreshing a page like `/explore` gives 404 | The Application URL must point at the Node app, not at a static `public_html` folder. |
