import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react-router-dom'))
                            return 'vendor-router';
                        if (id.includes('@supabase'))
                            return 'vendor-supabase';
                        if (id.includes('recharts'))
                            return 'vendor-charts';
                        if (id.includes('framer-motion'))
                            return 'vendor-motion';
                        if (id.includes('lucide-react'))
                            return 'vendor-icons';
                        if (id.includes('react-dom') || id.includes('react'))
                            return 'vendor-react';
                        return 'vendor';
                    }
                }
            }
        }
    },
    server: {
        port: 5173,
        host: true
    }
});
