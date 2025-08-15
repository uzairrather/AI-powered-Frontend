import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://ai-powered-backend-r3ru.onrender.com', // ✅ your backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
