import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'JSONEditor',
      fileName: 'jsoneditor'
    },
    rollupOptions: {
      external: [
        '@codemirror/state',
        '@codemirror/view',
        '@codemirror/commands',
        '@codemirror/language',
        '@codemirror/lang-json',
        '@codemirror/lint',
        '@codemirror/theme-one-dark'
      ],
      output: {
        globals: {
          '@codemirror/state': 'CodeMirror.state',
          '@codemirror/view': 'CodeMirror.view',
          '@codemirror/commands': 'CodeMirror.commands',
          '@codemirror/language': 'CodeMirror.language',
          '@codemirror/lang-json': 'CodeMirror.langJSON',
          '@codemirror/lint': 'CodeMirror.lint',
          '@codemirror/theme-one-dark': 'CodeMirror.oneDark'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}); 