import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, import.meta.dirname, '');
    const apiTarget = env.VITE_PROXY_TARGET || 'http://employee_rewards.test';

    return {
        plugins: [react(), tailwindcss()],
        server: {
            proxy: {
                '/api': { target: apiTarget, changeOrigin: true },
                '/sanctum': { target: apiTarget, changeOrigin: true },
            },
        },
    };
});
