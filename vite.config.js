import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// App is served from water.energy/pricing via a WordPress page template
// that proxies the dist/ build. All asset paths must resolve under /pricing/.
// https://vite.dev/config/
export default defineConfig({
  base: '/pricing/',
  plugins: [react()],
})
