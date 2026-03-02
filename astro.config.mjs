import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  // Static export — deploys anywhere (Cloudflare Pages, Netlify, etc.)
  // output: 'static' is the default; listed here for clarity.
});
