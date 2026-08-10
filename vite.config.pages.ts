// Used ONLY for the GitHub Pages / PWA build (see package.json "build:pwa" script
// and .github/workflows/deploy-pwa.yml). The Windows/Tauri build keeps using the
// plain `vite.config.ts` untouched, so nothing here can ever affect it.
import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config';

export default defineConfig((env) => {
  const resolved =
    typeof baseConfig === 'function' ? baseConfig(env) : baseConfig;
  return mergeConfig(resolved, {
    // Relative asset paths so the build works when served from a GitHub Pages
    // subpath like https://<user>.github.io/<repo>/ instead of the domain root.
    base: './',
    // PWA-only static assets (manifest, icons, service worker) live here instead
    // of the shared `public/` dir, so the Tauri/Windows build never includes them.
    publicDir: 'pwa-assets',
  });
});
