// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

function externalLinksBlank() {
	return (tree) => {
		const visit = (node) => {
			if (node.type === 'element' && node.tagName === 'a') {
				const href = node.properties?.href;
				if (typeof href === 'string' && /^https?:\/\//.test(href)) {
					node.properties.target = '_blank';
					node.properties.rel = 'noopener noreferrer';
				}
			}

			if (Array.isArray(node.children)) {
				node.children.forEach(visit);
			}
		};

		visit(tree);
	};
}

// https://astro.build/config
export default defineConfig({
	site: 'https://gamine.blog',
	integrations: [mdx(), sitemap()],
	markdown: {
		rehypePlugins: [externalLinksBlank],
	},

	adapter: vercel(),
});
