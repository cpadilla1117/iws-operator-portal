import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path depends on where the app is being served from:
//
//   Netlify preview (auto-set NETLIFY=true on Netlify's build servers):
//     base '/' — served from the site root like any normal SPA
//
//   Pantheon / WordPress production (local `npm run build`):
//     base '/wp-content/uploads/pricing-dashboard/' — matches where the
//     build is uploaded via SFTP so every asset resolves directly.
//
// This lets the same main branch auto-deploy to Netlify for team previews
// while also producing a Pantheon-ready dist/ when built locally.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.NETLIFY ? '/' : '/wp-content/uploads/pricing-dashboard/',
  plugins: [react()],
})
