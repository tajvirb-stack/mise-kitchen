import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    // Force new chunk hash every build so CDN/browser cache never serves stale JS
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-v58.js`,
        chunkFileNames: `assets/[name]-[hash]-v58.js`,
        assetFileNames: `assets/[name]-[hash]-v58.[ext]`
      }
    }
  }
});
