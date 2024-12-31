import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command, mode }) => ({
  plugins: [react({
    babel: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['import', { libraryName: 'antd', style: true }]
      ]
    }
  })] as PluginOption[],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#1890ff',
        },
      },
    },
  },
  build: command === 'build' ? {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'JsonEditor',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@ant-design/icons', 'antd'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@ant-design/icons': 'AntdIcons',
          'antd': 'antd'
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
  } : undefined,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  root: command === 'serve' ? path.resolve(__dirname, 'demo') : undefined,
  base: './',
})); 