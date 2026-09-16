import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const nodeRequire = createRequire(import.meta.url);
const APP_ROOT = path.dirname(fileURLToPath(import.meta.url));
const MANAGED_PHRIM_DIR = path.resolve(APP_ROOT, '../contract/managed/phrim');
const ZK_CONFIG_URL_PREFIX = '/zk-config/';

function copyDirRecursive(sourceDir: string, targetDir: string): void {
  mkdirSync(targetDir, { recursive: true });
  for (const entry of readdirSync(sourceDir)) {
    const sourcePath = path.join(sourceDir, entry);
    const targetPath = path.join(targetDir, entry);
    if (statSync(sourcePath).isDirectory()) {
      copyDirRecursive(sourcePath, targetPath);
    } else {
      copyFileSync(sourcePath, targetPath);
    }
  }
}

function phrimZkConfigPlugin(): Plugin {
  return {
    name: 'phrim-zk-config-static-serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url === undefined || !request.url.startsWith(ZK_CONFIG_URL_PREFIX)) {
          next();
          return;
        }
        const relativePath = request.url.slice(ZK_CONFIG_URL_PREFIX.length);
        const filePath = path.join(MANAGED_PHRIM_DIR, relativePath);
        if (!filePath.startsWith(MANAGED_PHRIM_DIR) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
          next();
          return;
        }
        response.end(readFileSync(filePath));
      });
    },
    closeBundle() {
      if (!existsSync(MANAGED_PHRIM_DIR)) {
        return;
      }
      const outDir = path.resolve(APP_ROOT, 'dist/zk-config');
      for (const subdir of ['keys', 'zkir']) {
        const sourceDir = path.join(MANAGED_PHRIM_DIR, subdir);
        if (existsSync(sourceDir)) {
          copyDirRecursive(sourceDir, path.join(outDir, subdir));
        }
      }
    },
  };
}

function resolveOnchainRuntimeBrowserEntry(): string {
  const compactRuntimePackageJsonPath = nodeRequire.resolve('@midnight-ntwrk/compact-runtime/package.json');
  const compactRuntimeRequire = createRequire(compactRuntimePackageJsonPath);
  const onchainRuntimeNodeEntry = compactRuntimeRequire.resolve('@midnight-ntwrk/onchain-runtime-v3');
  const onchainRuntimeDir = path.dirname(onchainRuntimeNodeEntry);
  const onchainRuntimePackageJson = JSON.parse(readFileSync(path.join(onchainRuntimeDir, 'package.json'), 'utf-8')) as {
    exports: { browser: string };
  };
  return path.join(onchainRuntimeDir, onchainRuntimePackageJson.exports.browser);
}

export default defineConfig({
  base: '/app/',
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    phrimZkConfigPlugin(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    dedupe: ['@midnight-ntwrk/compact-runtime', '@midnight-ntwrk/onchain-runtime-v3'],
    alias: {
      '@midnight-ntwrk/onchain-runtime-v3': resolveOnchainRuntimeBrowserEntry(),
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('@midnight-ntwrk/compact-runtime') || id.includes('@midnight-ntwrk/onchain-runtime-v3')) {
            return 'midnight-wasm';
          }
          return undefined;
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
    exclude: ['@midnight-ntwrk/onchain-runtime-v3'],
  },
  worker: {
    format: 'es',
    plugins: () => [wasm(), topLevelAwait()],
  },
});
