import Head from "next/head";

export default function Home() {
  return (
    <>
      <div className="max-w-5xl py-10 mx-6 lg:mx-auto">
        <Head>
          <title>Cosmos Web App Template</title>
          <meta name="description" content="cosmos web app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="flex flex-row justify-end mb-4"></div>
        <div className="text-center">
          <h1 className="mb-3 mt-32 text-3xl font-bold sm:text-4xl md:text-5xl">
            Cosmos Web App Template
          </h1>
        </div>
      </div>
    </>
  );
}
