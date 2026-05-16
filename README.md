# TenderIntel Landing Page

Static HTML landing page with a Supabase-backed waitlist form. Deploy to Cloudflare Pages.

## Files

| File | Purpose |
|---|---|
| `index.html` | Landing page markup |
| `styles.css` | Responsive styling |
| `app.js` | Waitlist form → Supabase REST |
| `waitlist_schema.sql` | Supabase table + RLS policies |
| `_headers` | Cloudflare Pages security headers |
| `_redirects` | Cloudflare Pages SPA fallback |

## Before deploying — one-time setup

### 1. Run the Supabase migration
In Supabase SQL Editor, run `waitlist_schema.sql` to create the `waitlist` table and RLS policies.

### 2. Fill in the anon key in `app.js`
Open `app.js` and replace `REPLACE_WITH_SUPABASE_ANON_KEY` with the anon public key:
- Supabase Dashboard → Project Settings → API → **anon public**

The URL is already set to `https://mqdeppcivrysnovmacqp.supabase.co`.

## Deploy to Cloudflare Pages

1. Push the `website/` folder contents to a GitHub repo (or use Cloudflare's direct upload).
2. In Cloudflare Pages → Create project → Connect to Git.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Output directory:** `.` (or the folder root)
4. Deploy. Cloudflare picks up `_headers` and `_redirects` automatically.

## Local preview

```powershell
cd "TenderNed Analyzer\TenderIntel\website"
python -m http.server 8000
# Open http://localhost:8000
```

## Next steps

- Add logo / brand mark
- Add customer logos or a product screenshot
- Wire n8n to send a welcome email on new waitlist signup
