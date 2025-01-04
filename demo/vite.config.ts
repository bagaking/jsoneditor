import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // 支持通过 IP 访问
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 确保在 codesandbox 中也能正常工作
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@bagaking/jsoneditor': resolve(__dirname, '../src/index.ts')
    }
  },
  // 支持在 codesandbox 中的 base URL
  base: './'
}); 