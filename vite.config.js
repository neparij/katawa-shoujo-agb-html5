import { DiscordProxy } from '@robojs/patch'
import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '../',
  publicDir: 'assets',
  plugins: [DiscordProxy.Vite()],
  base: './', // Use relative paths for assets
  build: {
    rollupOptions: {
      output: {
        // Ensure assets use relative paths
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
});
