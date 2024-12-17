import env from '@/config/env';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import {
  BookmarkSquareIcon,
  BookOpenIcon,
  RssIcon,
  MagnifyingGlassCircleIcon,
} from '@heroicons/react/24/solid';
import Head from 'next/head';
import Link from 'next/link';

export default function FourOhFour() {
  const links = [
    {
      name: 'Chain Docs',
      href: 'https://github.com/liftedinit/manifest-ledger',
      description: 'Learn how to sync nodes, query data, and use the Manifest Network.',
      icon: BookOpenIcon,
    },
    {
      name: 'Block Explorer',
      href: env.explorerUrl,
      description: 'Search for transactions, wallets, and other chain data.',
      icon: MagnifyingGlassCircleIcon,
    },
    {
      name: 'FAQ',
      href: '#',
      description: 'The most common questions and answers about the Manifest Network.',
      icon: BookmarkSquareIcon,
    },
    {
      name: 'Blog',
      href: '#',
      description: 'Read our latest news and articles.',
      icon: RssIcon,
    },
  ];

  return (
    <div className="">
      <Head>
        <title>404 - Alberto</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Alberto is the gateway to the Manifest Network" />
        <meta
          name="keywords"
          content="crypto, blockchain, application, Cosmos-SDK, Alberto, Manifest Network"
        />
        <meta name="author" content="Chandra Station" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="404 - Alberto" />
        <meta property="og:description" content="Alberto is the gateway to the Manifest Network" />
        <meta property="og:url" content="https://" />
        <meta property="og:image" content="https://" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Alberto" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="404 - Alberto" />
        <meta name="twitter:description" content="Alberto is the gateway to the Manifest Network" />
        <meta name="twitter:image" content="https://" />
        <meta name="twitter:site" content="@" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: '404 - Alberto',
            description: 'Alberto is the gateway to the Manifest Network',
            url: 'https://',
            image: 'https://',
            publisher: {
              '@type': 'Organization',
              name: 'The Lifted Initiative',
              logo: {
                '@type': 'ImageObject',
                url: 'https:///img/logo.png',
              },
            },
          })}
        </script>
      </Head>
      <main className="mx-auto w-full max-w-7xl px-6 pb-16 sm:pb-24 lg:px-8">
        <div className="mx-auto mt-20 max-w-2xl text-center sm:mt-24">
          <p className="text-base font-semibold leading-8 ">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight  sm:text-5xl">
            This page does not exist
          </h1>
          <p className="mt-4 text-base leading-7  sm:mt-6 sm:text-lg sm:leading-8">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-lg sm:mt-20">
          <h2 className="sr-only">Popular pages</h2>
          <ul
            role="list"
            className="-mt-6 divide-y divide-base-content/15 border-b border-base-content/15"
          >
            {links.map((link, linkIdx) => (
              <li key={linkIdx} className="relative flex gap-x-6 py-6">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg shadow-sm ring-1 ring-primary bg-base-200">
                  <link.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-auto">
                  <h3 className="text-sm font-semibold leading-6 ">
                    <a href={link.href}>
                      <span className="absolute inset-0" aria-hidden="true" />
                      {link.name}
                    </a>
                  </h3>
                  <p className="mt-2 text-sm leading-6 font-light dark:text-gray-400 text-gray-600 ">
                    {link.description}
                  </p>
                </div>
                <div className="flex-none self-center">
                  <ChevronRightIcon className="h-5 w-5 " aria-hidden="true" />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Link href="/" className="text-sm font-semibold leading-6" legacyBehavior>
              <span aria-hidden="true">&larr;Back to home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
