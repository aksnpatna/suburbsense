import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
         target: 'http://localhost:8888',
        changeOrigin: true
      },
      '/sitemap.xml': {
         target: 'http://localhost:8888/api/sitemap.xml',
         changeOrigin: true
      },
      '/robots.txt': {
         target: 'http://localhost:8888/api/robots.txt',
         changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
