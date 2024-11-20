import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    target: 'es2020',
  },
  plugins: [react()],
  define: {
    'process.env': {}, // This ensures compatibility with some packages expecting `process.env`
  },
});
