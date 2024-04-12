import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title> Cosmos Kit Tailwind</title>
        <meta name="description" content="Cosmos web app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="max-w-6xl font-sans mx-auto md:ml-32 lg:ml-44 xl:ml-96">
        <section className="flex flex-col items-center justify-center min-h-screen">
          <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
            <div className="mr-auto place-self-center lg:col-span-7">
              <h1 className="max-w-4xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-black to-mint dark:from-white dark:to-mint">
                Cosmos-Kit Template
              </h1>
              <p className="max-w-2xl mb-6 font-light text-gray-600 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
                Bootstrap your next web app with this cosmos-kit template. Easy
                to customize and ready to use, simply fork, change, and deploy.
              </p>
              <div className="flex items-center">
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-mint-700 hover:bg-mint-800 focus:ring-4 focus:ring-mint-300 dark:focus:ring-mint-900"
                >
                  <svg
                    className="w-5 h-5 mr-2 -ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  Github
                  <svg
                    className="w-5 h-5 ml-2 -mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-mint-300 rounded-lg hover:bg-mint-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-mint-700 dark:hover:bg-mint-700/20 dark:focus:ring-mint-800"
                >
                  Documentation
                </a>
              </div>
            </div>
            <div className="hidden lg:mt-0 lg:col-span-5 w-64 h-64 lg:flex">
              <img src="/logo.svg" alt="mockup" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
