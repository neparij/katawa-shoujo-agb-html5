import {DiscordProxy} from '@robojs/patch'
import {defineConfig} from 'vite';
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
    envDir: '../',
    publicDir: 'assets',
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
    },
    plugins: [
        DiscordProxy.Vite(),
        wasm(),
        {
            name: "configure-response-headers",
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    next();
                });
            },
        },
    ],
    optimizeDeps: {
        exclude: [
            '@thenick775/mgba-wasm'
        ]
    }
});
