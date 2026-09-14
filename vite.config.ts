import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'],
      manifest: {
        name: "Taccuino dell'Investigatore",
        short_name: 'Taccuino',
        description: "Scheda investigatore interattiva per giocare al tavolo, anni '20 — funziona offline, tutti i dati restano sul dispositivo.",
        lang: 'it',
        start_url: '/',
        display: 'standalone',
        background_color: '#15181b',
        theme_color: '#15181b',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App interamente locale (IndexedDB): precachea tutto il bundle così
        // funziona offline dopo il primo caricamento, senza chiamate di rete
        // a runtime.
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
});
