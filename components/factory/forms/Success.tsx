import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { TokenFormData } from '@/helpers';
import Link from 'next/link';

export default function Success({
  formData,
  address,
}: Readonly<{
  formData: TokenFormData;
  address: string;
}>) {
  const fullDenom = `factory/${address}/${formData.subdenom}`;

  return (
    <section className="lg:max-h-[90vh] max-h-screen lg:mt-1 mt-12 flex items-center justify-center">
      <div className="max-w-2xl mx-auto bg-base-300 shadow-lg rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Success!</h1>
        <p className="text-lg mb-2 text-pretty">
          Your token was successfully created and the metadata was set.
        </p>
        <p className="text-md text-gray-300 mb-6 text-pretty">
          You can now mint, burn, or change the admin of your tokens and send them to other wallets.
        </p>

        <div className="text-md text-gray-300 mb-6 text-pretty">
          The full denom of your token is:{' '}
          <span className="font-semibold">
            <TruncatedAddressWithCopy address={fullDenom} slice={24} />
          </span>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <h2 className="text-2xl font-semibold mb-4">Token Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-light text-gray-400">NAME</h3>
              <p className="text-lg font-medium">{formData.name}</p>
            </div>
            <div>
              <h3 className="text-md font-light text-gray-400">SYMBOL</h3>
              <p className="text-lg font-medium">{formData.symbol}</p>
            </div>
            <div>
              <h3 className="text-md font-light text-gray-400">DISPLAY</h3>
              <p className="text-lg font-medium">{formData.display}</p>
            </div>
            <div>
              <h3 className="text-md font-light text-gray-400">SUBDENOM</h3>
              <p className="text-lg font-medium">{formData.subdenom}</p>
            </div>
            <div className="col-span-1 md:col-span-2 max-h-28 overflow-y-auto">
              <h3 className="text-md font-light text-gray-400">DESCRIPTION</h3>
              <p className="text-lg font-medium">{formData.description}</p>
            </div>
            <div>
              <h3 className="text-md font-light text-gray-400">BASE EXPONENT</h3>
              <p className="text-lg font-medium">0</p>
            </div>
            <div>
              <h3 className="text-md font-light text-gray-400">DISPLAY EXPONENT</h3>
              <p className="text-lg font-medium">{formData.denomUnits[1].exponent}</p>
            </div>
            {formData.uri && (
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-md font-light text-gray-400">URI</h3>
                <p className="text-lg font-medium">{formData.uri}</p>
              </div>
            )}
          </div>
          <div className="mt-6">
            <div className="w-full justify-between items-center">
              <Link href={'/factory'} legacyBehavior>
                <button className="btn btn-md btn-secondary w-full">Back to Factory</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
