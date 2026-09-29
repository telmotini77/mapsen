import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Vite's dep pre-bundler mangles maplibre-gl's worker file reference, so
    // maplibre-gl-worker.mjs 404s and every GeoJSON source (any line/circle/fill layer,
    // including all cable drawing) silently never finishes loading — only raster tiles,
    // which need no worker, render. Excluding it here lets maplibre-gl serve its own
    // worker correctly.
    exclude: ['maplibre-gl'],
  },
})
