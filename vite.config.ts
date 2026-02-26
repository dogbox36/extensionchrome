import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'src/ui/popup.html'),
                options: resolve(__dirname, 'src/ui/options.html'),
                dashboard: resolve(__dirname, 'src/ui/pages/dashboard.html'),
                background: resolve(__dirname, 'src/background/index.ts'),
                watchMode: resolve(__dirname, 'src/content/watchMode.ts'),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === 'background') {
                        return 'background.js';
                    }
                    if (chunkInfo.name === 'watchMode') {
                        return 'watchMode.js';
                    }
                    return 'assets/[name]-[hash].js';
                },
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
