type TextNode = {
	type: 'text';
	value: string;
};

type ElementNode = {
	type: 'element';
	tagName: string;
	properties?: Record<string, unknown>;
	children: HastNode[];
};

type ParentNode = {
	type: string;
	children?: HastNode[];
};

export type HastNode = TextNode | ElementNode | ParentNode;

type LinkCardMetadata = {
	url: string;
	title: string;
	description: string;
	image?: string;
	siteName: string;
};

const linkCardCache = new Map<string, Promise<LinkCardMetadata>>();

const standaloneUrlPattern = /^https?:\/\/\S+$/;

const decodeHtml = (value = '') =>
	value
		.replaceAll('&amp;', '&')
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'");

const getMetaContent = (html: string, names: string[]) => {
	for (const name of names) {
		const pattern = new RegExp(
			`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
			'i',
		);
		const reversedPattern = new RegExp(
			`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["'][^>]*>`,
			'i',
		);
		const match = html.match(pattern) ?? html.match(reversedPattern);

		if (match?.[1]) {
			return decodeHtml(match[1].trim());
		}
	}
};

const getTitle = (html: string) => {
	const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
	return match?.[1] ? decodeHtml(match[1].replace(/\s+/g, ' ').trim()) : undefined;
};

const toAbsoluteUrl = (value: string | undefined, baseUrl: string) => {
	if (!value) return undefined;

	try {
		return new URL(value, baseUrl).href;
	} catch {
		return undefined;
	}
};

const getFallbackTitle = (url: string) => {
	const parsedUrl = new URL(url);
	return parsedUrl.hostname.replace(/^www\./, '') + parsedUrl.pathname.replace(/\/$/, '');
};

const fetchLinkCard = async (url: string) => {
	const cachedMetadata = linkCardCache.get(url);
	if (cachedMetadata) {
		return cachedMetadata;
	}

	const fallback: LinkCardMetadata = {
		url,
		title: getFallbackTitle(url),
		description: '',
		image: undefined,
		siteName: new URL(url).hostname.replace(/^www\./, ''),
	};

	const metadataPromise = fetch(url, {
		headers: {
			'user-agent': 'gamine.blog link card bot',
		},
		signal: AbortSignal.timeout(5000),
	})
		.then(async (response): Promise<LinkCardMetadata> => {
			if (!response.ok) return fallback;

			const html = await response.text();
			const title =
				getMetaContent(html, ['og:title', 'twitter:title']) ?? getTitle(html) ?? fallback.title;
			const description =
				getMetaContent(html, ['og:description', 'twitter:description', 'description']) ??
				fallback.description;
			const siteName =
				getMetaContent(html, ['og:site_name']) ??
				getMetaContent(html, ['twitter:site']) ??
				fallback.siteName;
			const image = toAbsoluteUrl(
				getMetaContent(html, ['og:image', 'twitter:image']),
				response.url || url,
			);

			return {
				url,
				title,
				description,
				image,
				siteName,
			};
		})
		.catch(() => fallback);

	linkCardCache.set(url, metadataPromise);
	return metadataPromise;
};

const isElementNode = (node: HastNode): node is ElementNode => node.type === 'element';

const isTextNode = (node: HastNode): node is TextNode => node.type === 'text';

const getStandaloneUrl = (node: HastNode) => {
	if (!isElementNode(node) || node.tagName !== 'p') return undefined;

	const meaningfulChildren = node.children.filter(
		(child) => !isTextNode(child) || child.value.trim() !== '',
	);

	if (meaningfulChildren.length !== 1) return undefined;

	const child = meaningfulChildren[0];

	if (isTextNode(child)) {
		const value = child.value.trim();
		return standaloneUrlPattern.test(value) ? value : undefined;
	}

	if (isElementNode(child) && child.tagName === 'a') {
		const href = child.properties?.href;
		const text = child.children
			.filter(isTextNode)
			.map((grandChild) => grandChild.value)
			.join('')
			.trim();

		return typeof href === 'string' && standaloneUrlPattern.test(href) && text === href
			? href
			: undefined;
	}
};

const createLinkCardNode = (metadata: LinkCardMetadata): ElementNode => ({
	type: 'element',
	tagName: 'a',
	properties: {
		className: ['link-card'],
		href: metadata.url,
	},
	children: [
		{
			type: 'element',
			tagName: 'span',
			properties: {
				className: ['link-card-body'],
			},
			children: [
				{
					type: 'element',
					tagName: 'span',
					properties: {
						className: ['link-card-title'],
					},
					children: [{ type: 'text', value: metadata.title }],
				},
				...(metadata.description
					? [
							{
								type: 'element' as const,
								tagName: 'span',
								properties: {
									className: ['link-card-description'],
								},
								children: [{ type: 'text' as const, value: metadata.description }],
							},
						]
					: []),
				{
					type: 'element',
					tagName: 'span',
					properties: {
						className: ['link-card-site'],
					},
					children: [{ type: 'text', value: metadata.siteName }],
				},
			],
		},
		...(metadata.image
			? [
					{
						type: 'element' as const,
						tagName: 'span',
						properties: {
							className: ['link-card-thumbnail'],
						},
						children: [
							{
								type: 'element' as const,
								tagName: 'img',
								properties: {
									src: metadata.image,
									alt: '',
									loading: 'lazy',
									decoding: 'async',
								},
								children: [],
							},
						],
					},
				]
			: []),
	],
});

export default function linkCards() {
	return async (tree: HastNode) => {
		const visit = async (node: HastNode, parent?: ParentNode, index?: number) => {
			if ('children' in node && Array.isArray(node.children)) {
				await Promise.all(node.children.map((child, childIndex) => visit(child, node, childIndex)));
			}

			const url = getStandaloneUrl(node);
			if (url && parent?.children && typeof index === 'number') {
				const metadata = await fetchLinkCard(url);
				parent.children[index] = createLinkCardNode(metadata);
			}
		};

		await visit(tree);
	};
}
