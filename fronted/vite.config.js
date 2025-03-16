// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // Force output to "build" instead of "dist"
  },
});

build: {
  chunkSizeWarningLimit: 1000, // Increase limit (default is 500 KB)
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          const packages = id.toString().split('node_modules/')[1].split('/')[0];
          return `vendor-${packages}`;
        }
      },
    },
  },
}


