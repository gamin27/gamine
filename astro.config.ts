import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import linkCards, { type HastNode } from './src/lib/link-cards';

import vercel from '@astrojs/vercel';

const isElementNode = (
	node: HastNode,
): node is HastNode & {
	type: 'element';
	tagName: string;
	properties?: Record<string, unknown>;
} => node.type === 'element' && 'tagName' in node;

function externalLinksBlank() {
	return (tree: HastNode) => {
		const visit = (node: HastNode) => {
			if (isElementNode(node) && node.tagName === 'a') {
				const href = node.properties?.href;
				if (typeof href === 'string' && /^https?:\/\//.test(href)) {
					node.properties ??= {};
					node.properties.target = '_blank';
					node.properties.rel = 'noopener noreferrer';
				}
			}

			if ('children' in node && Array.isArray(node.children)) {
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
		rehypePlugins: [linkCards, externalLinksBlank],
	},

	adapter: vercel(),
});
