import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Element, Link as ScrollLink, animateScroll as scroll } from 'react-scroll';

import { AdminsIcon, BankIcon, FactoryIcon, GroupsIcon } from '@/components/icons';
import { useIsMobile } from '@/hooks';

const PenroseTriangleScene = dynamic(() => import('@/components/3js/pennRoseTriangleScene'), {
  ssr: false,
  loading: () => null,
});

const AnimatedAsterisk = dynamic(() => import('@/components/3js/animatedAsterisk'), {
  ssr: false,
  loading: () => null,
});

const AnimatedShape = dynamic(() => import('@/components/3js/animatedMesh'), {
  ssr: false,
  loading: () => null,
});

const FadeInSection = ({
  children,
  threshold = 0.1,
}: {
  children: React.ReactNode;
  threshold?: number;
}) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-1000 ${inView ? 'opacity-100' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const [is3DReady, setIs3DReady] = useState(false);
  const isMobile = useIsMobile();

  const handle3DLoad = () => {
    if (!isMobile) {
      setIs3DReady(true);
    }
  };

  useEffect(() => {
    if (isMobile) {
      setIs3DReady(true);
    }
  }, [isMobile]);

  return (
    <>
      <Head>
        <title>Alberto - Blockchain App</title>
        <meta name="description" content="Cosmos web app" />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
          html, body {
            scroll-behavior: smooth;
            scroll-snap-type: y mandatory;
          }
          section {
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }
        `}</style>
      </Head>

      {!is3DReady && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="loading w-[8rem] loading-ring text-primary"></div>
        </div>
      )}

      <div className={`min-h-screen ${is3DReady ? '' : 'opacity-0'}`}>
        {/* Main Hero */}
        <Element name="hero" id="hero">
          <section className="relative h-screen overflow-hidden py-20 sm:py-24 md:py-28 lg:py-44">
            <div className="max-w-7xl mx-auto">
              <div className="relative z-10 pb-8  sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                  <div className="sm:text-center lg:text-left">
                    <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                      <span className="block xl:inline">Connect to the AI infrastructure</span>{' '}
                      <span className="block xl:inline">for</span>{' '}
                      <span className="block text-primary xl:inline"> DePIN</span>
                    </h1>
                    <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                      Alberto is a secure wallet that gives you access to your assets on the
                      Manifest blockchain in the Cosmos ecosystem.
                    </p>
                    <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                      <div className="rounded-md shadow">
                        <ScrollLink
                          to="how-it-works"
                          smooth={true}
                          duration={500}
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark md:py-4 md:text-lg md:px-10 cursor-pointer"
                        >
                          Get Started
                        </ScrollLink>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
            {/* <div className="lg:absolute lg:inset-y-0 lg:right-0 w-full">
              <div className="w-full h-full">
                <PenroseTriangleScene onLoad={handle3DLoad} />
              </div>
            </div> */}
            <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
              <div className="h-56 w-full sm:h-72 md:h-80 lg:h-full lg:w-full ">
                {!isMobile && <AnimatedShape shape="icosahedron" onLoad={handle3DLoad} />}
              </div>
            </div>
          </section>
        </Element>

        <FadeInSection>
          <Element name="how-it-works" id="how-it-works">
            <section className="min-h-screen py-20 sm:py-24 md:py-28 lg:py-32 relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div>
                  <h2 className="text-3xl font-extrabold text-center mb-8">
                    Alberto leverages cutting-edge modules
                  </h2>
                  <h3 className="text-5xl font-bold text-center text-primary mb-16">
                    Innovative governance & enhanced accessibility
                  </h3>

                  {/* box row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* First Box */}
                    <div className="group relative text-center p-4 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-gradient-to-br hover:from-white/80 hover:to-transparent dark:hover:from-base-300/80 dark:hover:to-transparent backdrop-blur-sm bg-white/60 dark:bg-base-300/60 hover:scale-105">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0">
                        {!isMobile && <AnimatedAsterisk onLoad={handle3DLoad} />}
                      </div>
                      <div className="w-full h-full p-4 rounded-2xl backdrop-blur-sm pointer-events-none ">
                        <div className="relative z-10 pointer-events-none">
                          <Image
                            src={'/3dPOA.svg'}
                            alt="Proof of Authority"
                            width={0}
                            height={0}
                            className="w-32 h-32 mx-auto mb-2 rounded-full"
                          />
                          <h4 className="text-xl md:text-lg font-semibold mb-2">
                            Proof-of-Authority
                          </h4>
                          <h5 className="text-2xl font-bold mb-4">Pioneering Implementation</h5>
                          <p className="text-gray-400 group-hover:text-black dark:group-hover:text-white">
                            Alberto uses a Proof-of-Authority model, replacing Proof-of-Stake with
                            administrator controlled validator selection.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Second Box */}
                    <div className="group relative text-center p-4 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-gradient-to-br hover:from-white/80 hover:to-transparent dark:hover:from-base-300/80 dark:hover:to-transparent backdrop-blur-sm bg-white/60 dark:bg-base-300/60 hover:scale-105">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0">
                        {!isMobile && <AnimatedAsterisk onLoad={handle3DLoad} />}
                      </div>
                      <div className="w-full h-full p-4 rounded-2xl backdrop-blur-sm pointer-events-none ">
                        <div className="relative z-10 pointer-events-none">
                          <Image
                            src={'/3dGroup.svg'}
                            alt="Groups Module"
                            width={0}
                            height={0}
                            className="w-32 h-32 mx-auto mb-2 rounded-full"
                          />
                          <h4 className="text-xl font-semibold mb-2">Groups Module</h4>
                          <h5 className="text-2xl font-bold mb-4">Flexible DAO-like Structures</h5>
                          <p className="text-gray-400 group-hover:text-black dark:group-hover:text-white">
                            Alberto facilitates the creation and management of multi-member groups
                            capable of submitting any type of transaction, enabling DAO-like
                            governance.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Third Box */}
                    <div className="group relative text-center p-4 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-gradient-to-br hover:from-white/80 hover:to-transparent dark:hover:from-base-300/80 dark:hover:to-transparent backdrop-blur-sm bg-white/60 dark:bg-base-300/60 hover:scale-105">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0">
                        {!isMobile && <AnimatedAsterisk onLoad={handle3DLoad} />}
                      </div>
                      <div className="w-full h-full p-4 rounded-2xl backdrop-blur-sm pointer-events-none ">
                        <div className="relative z-10 pointer-events-none">
                          <Image
                            src={'/3dWallet.svg'}
                            alt="Wallet Support"
                            width={0}
                            height={0}
                            className="w-32 h-32 mx-auto mb-2 rounded-full"
                          />
                          <h4 className="text-xl font-semibold mb-2">Diverse Wallet Support</h4>
                          <h5 className="text-2xl font-bold mb-4">Accessible to All</h5>
                          <p className="text-gray-400 group-hover:text-black dark:group-hover:text-white">
                            Alberto gives you access to your tokens in multiple ways. Connect with
                            your Cosmos wallets, your Ledger, your social media or by email/SMS.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </Element>
        </FadeInSection>

        {/* Resources */}
        <FadeInSection>
          <Element name="resources" id="resources" className="pt-20 sm:pt-24 md:pt-28 lg:pt-32">
            <section className="relative min-h-screen py-20 sm:py-24 md:py-28 lg:py-32">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/60 dark:bg-base-300/60 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-lg">
                    <div className="h-32 sm:h-40 relative mb-4 sm:mb-6">
                      <div className="absolute top-0 left-0 w-16 sm:w-20 h-16 sm:h-20 bg-primary rounded-full"></div>
                      <div className="absolute top-8 sm:top-10 right-8 sm:right-10 w-12 sm:w-16 h-12 sm:h-16 bg-gray-200 rounded-full"></div>
                      <div className="absolute bottom-0 left-16 sm:left-20 w-10 sm:w-12 h-10 sm:h-12 bg-gray-300 rounded-full"></div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                      The first chain to use the audited
                      <br />
                      Proof-of-Authority module
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                      Learn how our implementation of POA module secures the network while enabling
                      fast, efficient consensus. A first of its kind in the Cosmos ecosystem.
                    </p>
                    <a
                      href="#"
                      className="text-primary font-semibold hover:underline text-sm sm:text-base"
                    >
                      Explore the POA Technical Overview &gt;
                    </a>
                  </div>
                  <div className="bg-white/60 dark:bg-base-300/60 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-lg">
                    <div className="h-32 sm:h-40 relative mb-4 sm:mb-6">
                      <div className="absolute right-0 bottom-0 w-24 sm:w-32 h-24 sm:h-32 bg-gray-200 rounded-tl-full"></div>
                      <div className="absolute right-6 sm:right-8 bottom-6 sm:bottom-8 w-18 sm:w-24 h-18 sm:h-24 bg-white rounded-tl-full"></div>
                      <div className="absolute right-12 sm:right-16 bottom-0 w-12 sm:w-16 h-12 sm:h-16 bg-primary rounded-full"></div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                      Lifted Initiative: Pioneering
                      <br />
                      decentralized AI infrastructure
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                      Explore how our parent company, Lifted Initiative, is pushing the boundaries
                      of open, decentralized compute and AI agents, with Alberto at the forefront.
                    </p>
                    <a
                      href="#"
                      className="text-primary font-semibold hover:underline text-sm sm:text-base"
                    >
                      Learn about Lifted Initiative &gt;
                    </a>
                  </div>
                </div>

                {/* Navigation Explanation */}
                <div className="mt-8 bg-white/60 dark:bg-base-300/60 backdrop-blur-sm p-8 rounded-lg shadow-lg">
                  <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
                    {[
                      {
                        name: 'Bank',
                        Icon: BankIcon,
                        href: '/bank',
                        description: 'Interact with all your tokens on the Manifest network',
                      },
                      {
                        name: 'Groups',
                        Icon: GroupsIcon,
                        href: '/groups',
                        description: 'Create a group and invite members to start a DAO',
                      },
                      {
                        name: 'Admins',
                        Icon: AdminsIcon,
                        href: '/admins',
                        description: 'For the administrators of the network to ensure security',
                      },
                      {
                        name: 'Factory',
                        Icon: FactoryIcon,
                        href: '/factory',
                        description:
                          'The token factory allows you to create new tokens on the network',
                      },
                    ].map(({ name, Icon, href, description }) => (
                      <Link key={name} href={href} legacyBehavior>
                        <div className="group cursor-pointer transition-all duration-300 ease-in-out hover:bg-white/20 dark:hover:bg-base-200/20 rounded-lg p-4">
                          <Icon className="h-16 w-auto text-[#00000066] dark:text-white transition-colors duration-300 ease-in-out group-hover:text-primary dark:group-hover:text-primary" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors duration-300 ease-in-out">
                            {name}
                          </h3>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 ease-in-out">
                            {description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </Element>
        </FadeInSection>
      </div>
    </>
  );
}
