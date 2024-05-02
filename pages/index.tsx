import Head from "next/head";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>Alberto</title>
        <meta name="description" content="Cosmos web app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-row gap-0 justify-center items-center mx-auto min-h-screen my-auto">
        <Image
          src="/darkLogo.png"
          height={128}
          width={128}
          alt="manifest"
          className="-mt-8"
        />
        <h1 className="text-6xl">anifest Network</h1>
      </div>
    </>
  );
}
