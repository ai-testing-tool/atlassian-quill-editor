import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  root: 'demo',
  resolve: {
    alias: {
      'atlassian-quill-editor': resolve(__dirname, 'src/index.ts'),
    },
  },
  server: {
    port: 5174,
  },
});
