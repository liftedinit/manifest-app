import { MouseEventHandler, useMemo } from 'react';

import { ArrowPathIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { PiGearSixThin, PiWalletThin } from 'react-icons/pi';
import { useChain } from '@cosmos-kit/react';
import { WalletStatus } from 'cosmos-kit';
import Image from 'next/image';

const buttons = {
  Disconnected: {
    icon: PiWalletThin,
    title: 'Connect Wallet',
  },
  Connected: {
    icon: PiWalletThin,
    title: 'My Wallet',
  },
  Rejected: {
    icon: ArrowPathIcon,
    title: 'Reconnect',
  },
  Error: {
    icon: ArrowPathIcon,
    title: 'Change Wallet',
  },
  NotExist: {
    icon: ArrowDownTrayIcon,
    title: 'Install Wallet',
  },
};

interface WalletSectionProps {
  chainName: string;
}

export const WalletSection: React.FC<WalletSectionProps> = ({ chainName }) => {
  const {
    connect,
    openView,
    status,
    username,
    address,
    chain: chainInfo,
    logoUrl,
  } = useChain(chainName);

  const chain = {
    chainName,
    label: chainInfo.pretty_name,
    value: chainName,
    icon: logoUrl,
  };

  const onClickConnect: MouseEventHandler = async e => {
    e.preventDefault();
    await connect();
  };

  const onClickOpenView: MouseEventHandler = e => {
    e.preventDefault();
    openView();
  };

  const _renderWalletContent = useMemo(() => {
    if (status === WalletStatus.Connecting) {
      return (
        <button className="btn w-full border-0 btn-gradient animate-pulse text-white">
          <svg
            className="w-5 h-5 mr-3 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Connecting...
        </button>
      );
    }

    const buttonData = buttons[status];
    const onClick =
      status === WalletStatus.Disconnected || status === WalletStatus.Rejected ? connect : openView;

    return (
      <button
        className="btn w-full transition-all border-0 duration-300 ease-in-out  text-white btn-gradient"
        onClick={onClick}
      >
        <buttonData.icon className="w-5 h-5 mr-2" />
        {buttonData.title}
      </button>
    );
  }, [status, connect, openView, username, address]);

  return (
    <div className="w-full transition-all duration-300 ease-in-out relative">
      {status === WalletStatus.Connected ? (
        <div className="bg-[rgba(0,0,0,0.4)] rounded-lg p-4 transition-all duration-300 ease-in-out relative">
          <div className="absolute bottom-0 right-0 rounded-lg pointer-events-none">
            <Image
              src="/flower.svg"
              alt="Decorative flower"
              width={400}
              height={400}
              className="opacity-50 w-full h-full object-contain rounded-lg overflow-hidden"
            />
          </div>
          <div className="relative z-10">
            <p className="font-medium text-center mb-2">{username || 'Connected User'}</p>
            <div className="bg-base-300 rounded-full py-2 px-4 text-center mb-4 flex items-center justify-between w-full">
              <p className="text-xs text-gray-500 truncate flex-grow">
                {address
                  ? `${address.slice(0, 20)}...${address.slice(-4)}`
                  : 'Address not available'}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address || '');
                  const button = document.getElementById('copyButton');
                  if (button) {
                    button.innerHTML = '✓';
                    button.classList.add('text-green-500');
                    setTimeout(() => {
                      button.innerHTML = '📋';
                      button.classList.remove('text-green-500');
                    }, 2000);
                  }
                }}
                className="ml-2 focus:outline-none"
                id="copyButton"
              >
                📋
              </button>
            </div>
            {_renderWalletContent}
          </div>
        </div>
      ) : (
        <div className="flex p-4 justify-center items-center">{_renderWalletContent}</div>
      )}
    </div>
  );
};

export const IconWallet: React.FC<WalletSectionProps> = ({ chainName }) => {
  const { connect, openView, status } = useChain(chainName);

  const onClickConnect: MouseEventHandler = async e => {
    e.preventDefault();
    await connect();
  };

  const onClickOpenView: MouseEventHandler = e => {
    e.preventDefault();
    openView();
  };

  const _renderConnectButton = useMemo(() => {
    if (status === WalletStatus.Connecting) {
      return (
        <button className="rounded-lg w-8 h-8 justify-center items-center mx-auto  font-medium cursor-wait  text-sm">
          <svg
            className="w-8 h-8 text-primary justify-center items-center animate-spin mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </button>
      );
    }

    let onClick;
    if (status === WalletStatus.Disconnected || status === WalletStatus.Rejected)
      onClick = onClickConnect;
    else onClick = onClickOpenView;

    const buttonData = buttons[status];

    return (
      <button
        className="rounded-lg mx-auto  hover:ring-2 hover:ring-primary hover:text-primary   justify-center items-center  font-medium  text-sm"
        onClick={onClick}
      >
        <buttonData.icon className=" w-8 h-8 transition-all duration-200 ease-in-out  " />
      </button>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, connect, openView]);

  return (
    <div className="w-full mx-auto flex items-center justify-center">
      <div className="w-full mx-auto">{_renderConnectButton}</div>
    </div>
  );
};
