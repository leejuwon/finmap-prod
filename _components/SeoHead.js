import Head from 'next/head';

const SITE = 'https://www.finmaphub.com';

export default function SeoHead({ title, desc, url, image }) {
  const pageTitle = title ? `${title} | FinMap` : 'FinMap';
  const canonical = `${SITE}${url || ''}`;
  const ogImage = image || `${SITE}/og/default.jpg`;

  return (
    <Head>
      <title>{pageTitle}</title>
      {desc && <meta name="description" content={desc} />}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title || 'FinMap'} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
    </Head>
  );
}
