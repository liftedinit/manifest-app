import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Alberto</title>
        <meta name="description" content="Cosmos web app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col gap-4 justify-center min-h-screen  my-auto items-center ">
        <h1 className="text-6xl">Alberto</h1>
        <p className="text-xl">by The Lifted Initiative</p>
      </div>
    </>
  );
}
