import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@nodes': path.resolve(__dirname, './src/nodes'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@db': path.resolve(__dirname, './src/db'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },

  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'flow-vendor': ['reactflow'],
          'store-vendor': ['zustand', 'mobx', 'mobx-react-lite'],
        },
      },
    },
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'reactflow', 'zustand'],
  },

  define: {
    'process.env': {},
  },
});
