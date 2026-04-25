// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],

	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Noto Serif JP',
			cssVariable: '--font-noto-serif-jp',
			weights: [400, 700],
			styles: ['normal'],
			subsets: ['japanese', 'latin'],
			fallbacks: ['Hiragino Mincho ProN', 'Yu Mincho', 'serif'],
		},
	],

	adapter: vercel(),
});
