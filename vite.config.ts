import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// Forward API calls to the local backend so other devices on the LAN only need to reach Vite.
// API_PROXY_TARGET points it elsewhere, e.g. the API instance the end-to-end tests start.
const apiProxy = {
  '/api': { target: process.env.API_PROXY_TARGET ?? 'http://localhost:5103', changeOrigin: true },
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // `--mode lan` serves over HTTPS: phone browsers only allow camera access on secure origins.
  plugins: [react(), tailwindcss(), mode === 'lan' && basicSsl()],
  server: {
    allowedHosts: ["app.peoplecore.tech"],
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
}))
