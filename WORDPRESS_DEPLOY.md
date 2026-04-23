# WordPress Deployment — water.energy/pricing

## Initial setup (one-time)

1. Log into Pantheon dashboard at dashboard.pantheon.io
2. Open the water.energy site
3. Click into the Dev environment
4. At the top, switch "Development Mode" to SFTP
5. Copy the SFTP connection info (host, username, password/key)
6. Install an SFTP client (Cyberduck or FileZilla) if you don't have one
7. Connect to Pantheon via SFTP using the provided credentials

## Create the target directory in WordPress

Via SFTP, navigate to:
    /wp-content/uploads/

Create a new folder:
    /wp-content/uploads/pricing-dashboard/

## Create the WordPress page template

1. In your WordPress admin (water.energy/wp-admin), navigate to
   Appearance → Theme File Editor
2. In the active theme folder, create a new file named:
   page-pricing.php
3. Paste this content into the file:

```php
<?php
/**
 * Template Name: Pricing Dashboard
 * Template Post Type: page
 */

// Load the static pricing dashboard build without WordPress chrome
$dashboard_html = file_get_contents(
    WP_CONTENT_DIR . '/uploads/pricing-dashboard/index.html'
);

// Rewrite asset paths to point to uploaded build files
$dashboard_html = str_replace(
    '/pricing/assets/',
    '/wp-content/uploads/pricing-dashboard/assets/',
    $dashboard_html
);

echo $dashboard_html;
exit;
```

4. Save the template file

## Create the WordPress page at /pricing

1. In WordPress admin, go to Pages → Add New
2. Title: "Pricing" (this generates the slug /pricing)
3. In the Page Attributes sidebar, set Template to "Pricing Dashboard"
4. Leave the page body blank — the template handles rendering
5. Publish

## Upload the static build

Every time you update the dashboard:

1. Run `npm run build` locally to produce the dist/ folder
2. SFTP into Pantheon Dev environment
3. Delete the contents of /wp-content/uploads/pricing-dashboard/
4. Upload the full contents of your local dist/ folder into
   /wp-content/uploads/pricing-dashboard/
5. Verify at https://dev-water-energy.pantheonsite.io/pricing
6. When verified, in Pantheon dashboard promote Dev → Test → Live

## Updating pricing going forward

1. Edit the FACILITY_PRICING constant in src/App.jsx
   (see "Pricing config location" below)
2. Run `npm run build`
3. SFTP re-upload dist/ contents to Pantheon
4. Clear Pantheon cache (Pantheon dashboard → environment → Clear Caches)
5. Changes are live at water.energy/pricing

## Pricing config location

The authoritative pricing values live at the top of `src/App.jsx`:

- **FACILITY_PRICING** — facility names, locations, and per-barrel prices
  - `mills_ranch.price` — Mills Ranch 1 Facility rate
  - `fed128.price` — Fed128 Facility rate
- **PRICING_CYCLE** — start and end dates shown in the sticky status bar

Update these values, commit, run `npm run build`, and re-upload `dist/`.

## Architecture — coupled paths

Future maintainers should understand how three things stay in sync:

| Component | Value |
|---|---|
| **Vite `base`** (vite.config.js) | `/wp-content/uploads/pricing-dashboard/` for local builds; `/` when `NETLIFY=true` is set in the build env |
| **WordPress uploads folder** (SFTP target) | `/wp-content/uploads/pricing-dashboard/` |
| **PHP template `str_replace` call** | `'/pricing/assets/'` → `'/wp-content/uploads/pricing-dashboard/assets/'` (no-op safety net) |

### How it works

1. **Vite build.** Because `base` is set to `/wp-content/uploads/pricing-dashboard/`,
   every asset reference baked into `index.html` AND into the compiled JS bundle
   uses the full final URL (`/wp-content/uploads/pricing-dashboard/assets/...`).
   No server-side rewriting is needed.

2. **WordPress routing.** The page at `water.energy/pricing` is rendered by the
   `page-pricing.php` template. The template reads `index.html` from disk and
   echoes it. All asset URLs inside resolve directly because they match where
   the files actually live.

3. **The `str_replace` inside the PHP template.** It looks for the old
   `/pricing/assets/` prefix. Since Vite no longer emits that prefix, the
   replacement finds nothing to replace. It's harmless — left in place as a
   safety net in case the Vite `base` is ever reverted, or someone uploads
   an older build that still uses `/pricing/` paths.

### If you change the upload folder name

If the WordPress uploads folder is ever renamed (e.g., to `pricing-v2/`),
update BOTH the Vite `base` and the PHP template's `str_replace` destination
to match. Otherwise paths will 404.

### If you revert to the old architecture

If a future change sets Vite `base` back to `/pricing/`, the PHP template's
`str_replace` becomes active again and rewrites the HTML paths — but it
cannot rewrite paths baked into the JS bundle. In that case, images loaded
from JS (like the IWS logo) will 404 until a server rewrite rule is added.
The current architecture avoids this by matching `base` to the actual
asset directory directly.
