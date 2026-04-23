import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// App is served from water.energy/pricing via a WordPress page template,
// but its static assets live at /wp-content/uploads/pricing-dashboard/.
// Setting `base` to the actual asset directory makes every path embedded
// in the HTML and in the compiled JS bundle resolve directly without any
// server-side rewriting. The PHP template's str_replace becomes a no-op
// (harmless — kept as a safety net).
// https://vite.dev/config/
export default defineConfig({
  base: '/wp-content/uploads/pricing-dashboard/',
  plugins: [react()],
})
