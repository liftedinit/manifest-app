import Head from 'next/head';
import React from 'react';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogUrl?: string;
  ogImage?: string;
  twitterHandle?: string;
}

const defaultSEO = {
  description: 'Alberto is the gateway to the Manifest Network',
  keywords: 'crypto, blockchain, application, Cosmos-SDK, Alberto, Manifest Network',
  author: 'Chandra Station',
  ogUrl: 'https://',
  ogImage: 'https://',
  twitterHandle: '@',
};

export function SEO({
  title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  author = defaultSEO.author,
  ogUrl = defaultSEO.ogUrl,
  ogImage = defaultSEO.ogImage,
  twitterHandle = defaultSEO.twitterHandle,
}: SEOProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: ogUrl,
    image: ogImage,
    publisher: {
      '@type': 'Organization',
      name: author,
      logo: {
        '@type': 'ImageObject',
        url: `${ogUrl}/img/logo.png`,
      },
    },
  };

  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="icon" href="/favicon.ico" />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Alberto" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content={twitterHandle} />

      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Head>
  );
}
