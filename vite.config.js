import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves this repo at /lifestyle-app/, not at the domain root,
// so every asset reference needs that prefix.
const base = '/lifestyle-app/'

export default defineConfig({
  base,
  test: {
    environment: 'jsdom',
    // The Edge Functions' pure logic is tested too, so the parts that decide
    // when a reminder fires are not shipped untried.
    include: ['src/**/*.test.js', 'supabase/**/*.test.ts'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,jpg,jpeg}'],
        // Push handling lives in its own file so Workbox can keep generating
        // the caching half of the worker (see public/push-sw.js).
        importScripts: ['push-sw.js'],
      },
      manifest: {
        name: 'Habit Tracker',
        short_name: 'Habits',
        description: 'A simple daily habit tracker',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#14110d',
        theme_color: '#14110d',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
