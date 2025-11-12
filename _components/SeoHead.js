// _components/SeoHead.js
import Head from 'next/head';

export default function SeoHead({ title, desc, url = '/', image }) {
  const site = 'https://www.finmaphub.com';
  const canonical = url.startsWith('http') ? url : `${site}${url}`;
  const ogImg = image || '/og-default.png'; // public/og-default.png 준비 권장

  return (
    <Head>
      <title>{title ? `${title} | FinMap` : 'FinMap'}</title>
      {desc && <meta name="description" content={desc} />}
      <link rel="canonical" href={canonical} />

      {/* OG / Twitter */}
      <meta property="og:title" content={title || 'FinMap'} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="FinMap" />
      <meta property="og:type" content="article" />
      <meta property="og:image" content={ogImg} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || 'FinMap'} />
      {desc && <meta name="twitter:description" content={desc} />}
      <meta name="twitter:image" content={ogImg} />
    </Head>
  );
}
