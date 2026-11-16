import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      outDir: 'dist',
      rollupTypes: true,
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AtlassianQuillEditor',
      formats: ['es', 'cjs'],
      fileName: (format) =>
        format === 'es' ? 'atlassian-quill-editor.js' : 'atlassian-quill-editor.cjs',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'quill', '@ai-testing-tool/atlassian-adf-lite'],
      output: {
        exports: 'named',
        assetFileNames: 'atlassian-quill-editor.[ext]',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          quill: 'Quill',
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});
