/* eslint-disable @next/next/no-img-element */
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ChainWalletBase } from 'cosmos-kit';

export const WalletList = ({
  onClose,
  onWalletClicked,
  wallets,
}: {
  onClose: () => void;
  onWalletClicked: (name: string) => void;
  wallets: ChainWalletBase[];
}) => {
  const social = wallets.filter(wallet =>
    ['Google', 'Twitter', 'Apple', 'Discord'].includes(wallet.walletInfo.prettyName)
  );

  const browser = wallets.filter(wallet =>
    ['Keplr', 'Cosmostation', 'Leap', 'Station'].includes(wallet.walletInfo.prettyName)
  );

  const mobile = wallets.filter(wallet =>
    ['Wallet Connect', 'Keplr Mobile', 'Cosmostation Mobile', 'Leap Mobile'].includes(
      wallet.walletInfo.prettyName
    )
  );

  return (
    <div className="mt-2 text-center sm:mt-0.5 sm:text-left">
      <div className="flex flex-row items-center mb-6 justify-between border-b-2 border-b-base-100 pl-3 pr-3">
        <Dialog.Title as="h1" className="text-2xl leading-6">
          Connect with...
        </Dialog.Title>
        <button type="button" className="p-2 rounded-full" onClick={onClose}>
          <span className="sr-only">Close</span>
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col w-full mt-4 space-y-6 mb-2 px-3 overflow-y-auto md:h-[475px] sm:h-[275px]">
        {/* Browser Wallets Section */}
        <div className="md:block hidden">
          <h4 className="font-medium text-left">Browser Wallets</h4>
          <div className="grid grid-cols-2 justify-center items-center mx-auto  rounded-xl mt-2 w-64 gap-4">
            {browser.map(({ walletInfo: { name, prettyName, logo } }) => (
              <button
                key={name}
                onClick={() => onWalletClicked(name)}
                className="inline-flex flex-col items-center active:shadow-clicked  justify-center w-full p-3 transition duration-150 ease-in-out rounded-lg hover:bg-base-100 shadow-inner"
              >
                <div className="transition w-full h-full transform items-center justify-center space-y-2  active:scale-90">
                  <img
                    src={logo?.toString()}
                    alt={prettyName}
                    className="w-8 h-8 mb-2 rounded-md mx-auto"
                  />
                  <p className="text-sm font-medium text-center mx-auto">{prettyName}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Wallets Section */}
        <div className="md:hidden block">
          <div className="grid grid-cols-2 justify-center items-center mx-auto  rounded-xl -mt-6 w-64 gap-4">
            {mobile.map(({ walletInfo: { name, prettyName, logo } }) => (
              <button
                key={name}
                onClick={() => onWalletClicked(name)}
                className="inline-flex flex-col active:scale-95 items-center bg-base-200 justify-center w-full p-3 transition duration-150 ease-in-out  rounded-lg hover:bg-base-100"
              >
                <img src={logo?.toString()} alt={prettyName} className="w-8 h-8 mb-2 rounded-md" />
                <p className="text-sm font-medium text-center">
                  {prettyName === 'Twitter' ? 'X' : prettyName}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Social Wallets Section */}
        <div className="md:block hidden">
          <h4 className="font-medium text-left">Web 3 Auth</h4>
          <div className="grid grid-cols-2 justify-center items-center mx-auto  rounded-xl mt-2 w-64 gap-4">
            {social.map(({ walletInfo: { name, prettyName, logo } }) => (
              <button
                key={name}
                onClick={() => onWalletClicked(name)}
                className="inline-flex flex-col active:scale-95 items-center bg-base-200 justify-center w-full p-3 transition duration-150 ease-in-out  rounded-lg hover:bg-base-100"
              >
                <img src={logo?.toString()} alt={prettyName} className="w-8 h-8 mb-2 rounded-md" />
                <p className="text-sm font-medium text-center">
                  {prettyName === 'Twitter' ? 'X' : prettyName}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
