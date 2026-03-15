import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // server: {
    // proxy: {
    //   '/api': {
    //     target: 'https://briana-stereotomical-unslimly.ngrok-free.dev/',
    //     changeOrigin: true,
    //     rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
    //   },
    // },
  // },
});
