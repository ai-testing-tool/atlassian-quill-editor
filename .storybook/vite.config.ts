import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Dedicated Vite config for Storybook (avoids merging library-mode root config). */
export default defineConfig({
  plugins: [react()],
});
