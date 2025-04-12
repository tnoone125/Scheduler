import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: '../wwwroot',
        emptyOutDir: true
    },
    server: {
        proxy: {
            '/api': {
                target: 'https://localhost:5001',
                changeOrigin: true,
                secure: false
            }
        }
    }
})