import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
  },
  server: {
    host: true, // For testing on mobile devices on same network
  },
});
