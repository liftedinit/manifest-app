import Head from 'next/head';
import { Link as ScrollLink, Element } from 'react-scroll';

import PenroseTriangleScene from '@/components/3js/pennRoseTriangleScene';
import AnimatedAsterisk from '@/components/3js/animatedAsterisk';
export default function Home() {
  return (
    <>
      <Head>
        <title>Alberto - Blockchain App</title>
        <meta name="description" content="Cosmos web app" />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
          html {
            scroll-behavior: smooth;
          }
          body {
            overflow-x: hidden;
            margin: 0;
            padding: 0;
          }
          #__next {
            position: relative;
            overflow-x: hidden;
          }
        `}</style>
      </Head>

      <div className="min-h-screen">
        <Element name="hero">
          <section className="relative overflow-hidden py-20 sm:py-24 md:py-28 lg:py-32">
            <div className="max-w-7xl mx-auto">
              <div className="relative z-10 pb-8  sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                  <div className="sm:text-center lg:text-left">
                    <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                      <span className="block xl:inline">The infrastrucre</span>{' '}
                      <span className="block xl:inline">layer for</span>{' '}
                      <span className="block text-primary xl:inline"> DePIN</span>
                    </h1>
                    <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                      lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eget
                      sapien.
                    </p>
                    <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                      <div className="rounded-md shadow">
                        <ScrollLink
                          to="how-it-works"
                          smooth={true}
                          duration={500}
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark md:py-4 md:text-lg md:px-10 cursor-pointer"
                        >
                          Learn How It Works
                        </ScrollLink>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
            <div className="lg:absolute lg:inset-y-0 lg:right-0 w-full">
              <div className="w-full h-full  ">
                <PenroseTriangleScene />
              </div>
            </div>
            {/* <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
              <div className="h-56 w-full sm:h-72 md:h-80 lg:h-full lg:w-full ">
                <AnimatedShape shape={'icosahedron'} />
              </div>
            </div> */}
          </section>
        </Element>

        <Element name="how-it-works">
          <section className="py-20 sm:py-24 md:py-28 lg:py-32 relative overflow-hidden">
            <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 ">
              <div className="h-56 w-full sm:h-72 md:h-80 lg:h-full lg:w-full">
                <AnimatedAsterisk />
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pointer-events-none">
              <div>
                <h2 className="text-3xl font-extrabold text-center mb-12">How it works</h2>
                <h3 className="text-5xl font-bold text-center text-primary mb-16">
                  Agency over your infrastructure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-primary rounded-full"></div>
                    <h4 className="text-xl font-semibold mb-2">Decentralized Computing</h4>
                    <h5 className="text-2xl font-bold mb-4">Servers all over the world</h5>
                    <p className="text-gray-600">
                      The Manifest network enables developers to deploy their AI workloads on a
                      decentralized computing network.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-primary"></div>
                    <h4 className="text-xl font-semibold mb-2">Train Your Models</h4>
                    <h5 className="text-2xl font-bold mb-4">Compute for AI</h5>
                    <p className="text-gray-600">
                      Deploy on Machines that serve the specific needs of your models. Powerful,
                      efficient, and the proper choice.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-primary rounded-full"></div>
                    <h4 className="text-xl font-semibold mb-2">AI Agents & Inferencing</h4>
                    <h5 className="text-2xl font-bold mb-4">Deploy agents or inference</h5>
                    <p className="text-gray-600">
                      Alberto gives developers half of all gas fees their contracts generate. These
                      fees will be divided evenly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Element>

        <Element name="resources" className="pt-20 sm:pt-24 md:pt-28 lg:pt-32">
          <section className="py-20 sm:py-24 md:py-28 lg:py-32 0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
                  <div className="h-32 sm:h-40 relative mb-4 sm:mb-6">
                    {/* Replace with your actual SVG or component for the floating icons */}
                    <div className="absolute top-0 left-0 w-16 sm:w-20 h-16 sm:h-20 bg-primary rounded-full"></div>
                    <div className="absolute top-8 sm:top-10 right-8 sm:right-10 w-12 sm:w-16 h-12 sm:h-16 bg-gray-200 rounded-full"></div>
                    <div className="absolute bottom-0 left-16 sm:left-20 w-10 sm:w-12 h-10 sm:h-12 bg-gray-300 rounded-full"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                    Peek under Alberto's hood—
                    <br />
                    Tech, economics, and more.
                  </h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    Understand how Alberto sets its ecosystem up for sustainable growth. Dive into
                    its tech stack, innovative modules, intuitive tooling, and more.
                  </p>
                  <a
                    href="#"
                    className="text-primary font-semibold hover:underline text-sm sm:text-base"
                  >
                    Explore the Technical Overview &gt;
                  </a>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
                  <div className="h-32 sm:h-40 relative mb-4 sm:mb-6">
                    {/* Replace with your actual SVG or component for the arch */}
                    <div className="absolute right-0 bottom-0 w-24 sm:w-32 h-24 sm:h-32 bg-gray-200 rounded-tl-full"></div>
                    <div className="absolute right-6 sm:right-8 bottom-6 sm:bottom-8 w-18 sm:w-24 h-18 sm:h-24 bg-white rounded-tl-full"></div>
                    <div className="absolute right-12 sm:right-16 bottom-0 w-12 sm:w-16 h-12 sm:h-16 bg-primary rounded-full"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                    All of Alberto's papers,
                    <br />
                    all in one place.
                  </h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    Dive into the Protocol's economic, technical, and lightpapers, as well as other
                    detailed documents to fully understand the power of Alberto.
                  </p>
                  <a
                    href="#"
                    className="text-primary font-semibold hover:underline text-sm sm:text-base"
                  >
                    Access All Papers &gt;
                  </a>
                </div>
              </div>
            </div>
          </section>
        </Element>
      </div>
    </>
  );
}
