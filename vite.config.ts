import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'JSONEditor',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@codemirror/state',
        '@codemirror/view',
        '@codemirror/commands',
        '@codemirror/language',
        '@codemirror/lang-json',
        '@codemirror/lint',
        '@codemirror/theme-one-dark',
        '@codemirror/autocomplete',
        'ajv',
        'ajv-formats'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@codemirror/state': 'CodeMirror.state',
          '@codemirror/view': 'CodeMirror.view',
          '@codemirror/commands': 'CodeMirror.commands',
          '@codemirror/language': 'CodeMirror.language',
          '@codemirror/lang-json': 'CodeMirror.langJSON',
          '@codemirror/lint': 'CodeMirror.lint',
          '@codemirror/theme-one-dark': 'CodeMirror.oneDark',
          '@codemirror/autocomplete': 'CodeMirror.autocomplete',
          'ajv': 'Ajv',
          'ajv-formats': 'AjvFormats'
        },
        preserveModules: true,
        preserveModulesRoot: 'src',
        exports: 'named'
      }
    },
    sourcemap: true,
    emptyOutDir: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}); 