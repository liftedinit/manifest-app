/* eslint-disable @next/next/no-img-element */
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChainWalletBase } from 'cosmos-kit';
import { getRealLogo } from '@/utils';
import { useDeviceDetect } from '@/hooks';

export const WalletList = ({
  onClose,
  onWalletClicked,
  wallets,
}: {
  onClose: () => void;
  onWalletClicked: (name: string, isMobileConnect?: boolean) => void;
  wallets: ChainWalletBase[];
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const social = wallets.filter(wallet =>
    ['Google', 'Twitter', 'Apple', 'Discord', 'GitHub', 'Reddit', 'Email', 'SMS'].includes(
      wallet.walletInfo.prettyName
    )
  );
  const browser = wallets.filter(wallet =>
    ['Keplr', 'Cosmostation', 'Leap', 'Cosmos MetaMask Extension', 'Ledger'].includes(
      wallet.walletInfo.prettyName
    )
  );

  const mobile = wallets.filter(wallet =>
    ['Wallet Connect', 'Keplr Mobile', 'Leap Mobile'].includes(wallet.walletInfo.prettyName)
  );

  const { isMobile } = useDeviceDetect();
  const hasMobileVersion = (prettyName: string) => {
    return mobile.some(w => w.walletInfo.prettyName.startsWith(prettyName));
  };

  const getMobileWalletName = (browserName: string) => {
    return mobile.find(w => w.walletInfo.prettyName.startsWith(browserName))?.walletInfo.name;
  };
  return (
    <div className="p-1 relative max-w-sm mx-auto">
      <h1 className="text-sm font-semibold text-center mb-6">Connect Wallet</h1>
      <button
        type="button"
        className="p-2 text-primary absolute -top-1 right-0 bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-[#00000033]"
        onClick={onClose}
      >
        <XMarkIcon className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Browser and Social sections - browser hidden on mobile/tablet */}
      <div className={`${isMobile ? 'hidden' : 'block'}`}>
        <div className="space-y-2 mb-4">
          {browser.map(({ walletInfo: { name, prettyName, logo } }) => (
            <div key={name} className="w-full">
              <button
                onClick={() => onWalletClicked(name)}
                className="flex items-center w-full p-3 rounded-lg dark:bg-[#ffffff0c] bg-[#f0f0ff5c] dark:hover:bg-[#0000004c] hover:bg-[#a8a8a84c] transition"
              >
                <img
                  src={
                    prettyName === 'Cosmos MetaMask Extension'
                      ? '/metamask.svg'
                      : getRealLogo(logo?.toString() ?? '', isDarkMode)
                  }
                  alt={prettyName}
                  className="w-10 h-10 rounded-xl mr-3"
                />
                <span className="text-md flex-1 text-left">
                  {prettyName === 'Cosmos MetaMask Extension' ? 'MetaMask' : prettyName}
                </span>
                {hasMobileVersion(prettyName) && prettyName !== 'Cosmostation' && (
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      onWalletClicked(getMobileWalletName(prettyName) || '', true);
                    }}
                    className="p-1.5 rounded-lg dark:hover:bg-[#ffffff1a] hover:bg-[#0000000d] dark:bg-[#ffffff37] bg-[#d5d5e4]  transition cursor-pointer"
                    title={`Connect with ${prettyName} Mobile`}
                  >
                    <img src={getRealLogo('/sms')} alt="mobile" className="w-5 h-5" />
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mb-4 mt-3">
          <span className="">or connect with</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {social.map(({ walletInfo: { name, prettyName, logo } }) => (
            <button
              key={name}
              onClick={() => onWalletClicked(name)}
              className="flex items-center justify-center p-4 dark:bg-[#ffffff0c] bg-[#f0f0ff5c] dark:hover:bg-[#0000004c] hover:bg-[#a8a8a84c] rounded-lg transition"
            >
              <img
                src={getRealLogo(logo?.toString() ?? '', isDarkMode)}
                alt={prettyName}
                className={`${prettyName === 'Reddit' || prettyName === 'Google' ? 'w-8 h-8' : 'w-7 h-7'} rounded-md mr-2`}
              />
              <span className="text-md ml-2">{prettyName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Wallets Section - shown on mobile/tablet, hidden on desktop */}
      <div className={`${isMobile ? 'block' : 'hidden'}`}>
        <div className="space-y-2">
          {mobile.map(({ walletInfo: { name, prettyName, logo } }) => (
            <button
              key={name}
              onClick={() => onWalletClicked(name)}
              className="flex items-center w-full p-3 rounded-lg dark:bg-[#ffffff0c] bg-[#f0f0ff5c] dark:hover:bg-[#0000004c] hover:bg-[#a8a8a84c] transition"
            >
              <img
                src={getRealLogo(logo?.toString() ?? '', isDarkMode)}
                alt={prettyName}
                className="w-10 h-10 rounded-xl mr-3"
              />
              <span className="text-md">{prettyName === 'Twitter' ? 'X' : prettyName}</span>
            </button>
          ))}
        </div>
        <div className="text-center mb-4 mt-3">
          <span className="">or connect with</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {social.map(({ walletInfo: { name, prettyName, logo } }) => (
            <button
              key={name}
              onClick={() => onWalletClicked(name)}
              className="flex items-center justify-center p-4 dark:bg-[#ffffff0c] bg-[#f0f0ff5c] dark:hover:bg-[#0000004c] hover:bg-[#a8a8a84c] rounded-lg transition"
            >
              <img
                src={getRealLogo(logo?.toString() ?? '', isDarkMode)}
                alt={prettyName}
                className={`${prettyName === 'Reddit' || prettyName === 'Google' ? 'w-8 h-8' : 'w-7 h-7'} rounded-md mr-2`}
              />
              <span className="text-md ml-2">{prettyName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
