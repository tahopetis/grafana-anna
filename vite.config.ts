import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// Copy plugin.json and assets after build
function copyAssets() {
  return {
    name: 'copy-assets',
    writeBundle() {
      // Ensure dist directory exists
      if (!existsSync('dist')) {
        mkdirSync('dist', { recursive: true });
      }

      // Copy plugin.json
      copyFileSync('src/plugin.json', 'dist/plugin.json');

      // Create img directory and copy logo
      if (!existsSync('dist/img')) {
        mkdirSync('dist/img', { recursive: true });
      }
      copyFileSync('src/assets/logo.svg', 'dist/img/logo.svg');
    },
  };
}

export default defineConfig({
  plugins: [react(), copyAssets()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/module.tsx'),
      name: 'anna-ai-assistant',
      formats: ['amd'],
      fileName: () => 'module.js',
    },
    rollupOptions: {
      external: [
        'amd-module',
        '@grafana/data',
        '@grafana/experimental',
        '@grafana/llm',
        '@grafana/runtime',
        '@grafana/ui',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'rxjs',
      ],
      output: {
        exports: 'default',
        // Add AMD-specific options
        amd: {
          id: 'plugins/anna-ai-assistant/module',
        },
      },
    },
    minify: 'esbuild',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
