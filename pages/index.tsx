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
      <div className="flex flex-col gap-4 justify-center min-h-screen  my-auto items-center ">
        <h1 className="text-6xl">Alberto</h1>
        <p className="text-xl">by</p>

        <div className="flex flex-row gap-0 justify-center items-center mx-auto ">
          <Image
            src="/darkLogo.png"
            height={32}
            width={32}
            alt="manifest"
            className="-mt-2"
          />
          <h1 className="text-xl">anifest Network</h1>
        </div>
      </div>
    </>
  );
}
