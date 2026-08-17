import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Local dev serves from the root; the deploy workflow builds this as a
// subpath of the habit tracker's GitHub Pages site (see deploy.yml), so it
// passes GYM_TRACKER_BASE in to override this.
const base = process.env.GYM_TRACKER_BASE || '/'

export default defineConfig({
  base,
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      manifest: {
        name: 'Gym Coach',
        short_name: 'Gym Coach',
        description: 'Plan training sessions, log your lifts, and get progression suggestions.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#14161a',
        theme_color: '#14161a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
