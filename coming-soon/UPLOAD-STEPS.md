# LEAP coming soon page: cPanel upload steps

This is a plain HTML/CSS/JS page. No Node.js or database is needed.

## Upload
1. Log in to cPanel and open **File Manager**.
2. Go to the folder for the domain you want to use:
   - main domain: `public_html/`
   - a subdomain (e.g. `leap.yourdomain.lk`): create it first in **cPanel > Domains**, then open its document root folder.
3. Click **Upload** and choose `leap-coming-soon.zip`.
4. Back in File Manager, right-click the zip and pick **Extract**. You should now see `index.html` and an `assets/` folder directly in that folder (not inside a sub-folder).
5. Delete the zip. If an old `index.php` or `default.html` is there, rename or remove it so `index.html` loads.
6. Open the domain in a browser to check it.

## Make link previews show the image (Facebook / WhatsApp)
Social apps need the full URL of the preview image. Edit `index.html` (right-click > Edit) and replace both `assets/og-image.png` with the full address, for example:
`https://leap.yourdomain.lk/assets/og-image.png`
Then paste your link into https://developers.facebook.com/tools/debug/ and click **Scrape Again** to refresh the Facebook preview.

## Later, when the full LEAP site launches
The full app (see `DEPLOY-CPANEL.md`) replaces this page. Remove `index.html` and `assets/` from the folder before deploying it.
