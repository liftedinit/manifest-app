import React, { MouseEventHandler, useEffect, useMemo, useState } from 'react';

import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon, CopyIcon } from './icons';
import { useChain } from '@cosmos-kit/react';
import { WalletStatus } from 'cosmos-kit';
import { MdWallet } from 'react-icons/md';

const buttons = {
  Disconnected: {
    icon: MdWallet,
    title: 'Connect Wallet',
  },
  Connected: {
    icon: MdWallet,
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
  const { connect, openView, status, username, address } = useChain(chainName);
  const [localStatus, setLocalStatus] = useState(status);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (status === WalletStatus.Connecting) {
      timeoutId = setTimeout(() => {
        setLocalStatus(WalletStatus.Error);
      }, 10000); // 10 seconds timeout
    } else {
      setLocalStatus(status);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [status]);

  const _renderWalletContent = useMemo(() => {
    if (localStatus === WalletStatus.Connecting) {
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

    const buttonData = buttons[localStatus];
    const onClick =
      localStatus === WalletStatus.Disconnected || localStatus === WalletStatus.Rejected
        ? connect
        : openView;

    return (
      <button
        className="btn w-full  border-0 duration-300 ease-in-out  text-white btn-gradient"
        onClick={onClick}
      >
        <buttonData.icon className="w-5 h-5 mr-2 hidden md:block" />
        {buttonData.title}
      </button>
    );
  }, [localStatus, connect, openView, username, address]);

  return (
    <div className="w-full  duration-300 ease-in-out relative">
      {status === WalletStatus.Connected ? (
        <div
          className="bg-[#0000000A] dark:bg-[#FFFFFF0F] rounded-lg p-4  duration-300 ease-in-out relative h-48"
          style={{
            backgroundImage: 'url("/flower.svg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="relative z-10 h-full flex flex-col  justify-between">
            <p
              className="font-medium text-xl text-center mb-2 truncate"
              title={username || 'Connected user'}
            >
              {username || 'Connected User'}
            </p>
            <div className="bg-base-100 dark:bg-base-200 rounded-full py-2 px-4 text-center mb-4 flex items-center flex-row justify-between w-full ">
              <p className="text-xs  truncate flex-grow">
                {address
                  ? `${address.slice(0, 12)}...${address.slice(-6)}`
                  : 'Address not available'}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address || '');
                  const button = document.getElementById('copyButton2');
                  if (button) {
                    const originalContent = button.innerHTML;
                    button.innerHTML =
                      '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
                    setTimeout(() => {
                      button.innerHTML = originalContent;
                    }, 2000);
                  }
                }}
                style={{
                  height: ' 1rem',
                  minHeight: '1rem',
                  paddingLeft: '0.25rem',
                  paddingRight: '0.25rem',
                  fontSize: '0.37rem',
                  backgroundColor: 'transparent',
                }}
                className=" btn btn-ghost -mt-1 focus:outline-none s duration-200"
                id="copyButton2"
              >
                <CopyIcon className="w-4 h-4  hover:text-primary" />
              </button>
            </div>
            {_renderWalletContent}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center">{_renderWalletContent}</div>
      )}
    </div>
  );
};

export const IconWallet: React.FC<WalletSectionProps> = ({ chainName }) => {
  const { connect, openView, status, address } = useChain(chainName);

  const onClickConnect: MouseEventHandler = async e => {
    e.preventDefault();
    await connect();
  };

  const _renderConnectButton = useMemo(() => {
    if (status === WalletStatus.Connecting) {
      return (
        <button className="flex justify-center items-center w-8 h-8">
          <svg
            className="w-8 h-8 text-primary animate-spin"
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
    else onClick = openView;

    const buttonData = buttons[status];

    return (
      <div className="relative group">
        <button
          onClick={
            status === WalletStatus.Disconnected || status === WalletStatus.Rejected
              ? onClick
              : () => {}
          }
          className={`flex justify-center items-center w-8 h-8 hover:text-primary  duration-200 ease-in-out  ${status === WalletStatus.Disconnected || status === WalletStatus.Rejected ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <buttonData.icon className="w-8 h-8" />
        </button>
        {status === WalletStatus.Connected && (
          <div className="absolute -top-4 -right-8 mt-[-0.5rem] mr-[-0.5rem] bg-[#F4F4FF] dark:bg-[#191526] rounded-md shadow-lg opacity-0 group-hover:opacity-100  duration-200 ease-in-out">
            <button
              className="p-2 hover:text-primary rounded-t-md w-full flex justify-center items-center"
              id="copyButton"
              onClick={() => {
                navigator.clipboard.writeText(address || '');
                const button = document.getElementById('copyButton');
                if (button) {
                  const originalContent = button.innerHTML;
                  button.innerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
                  setTimeout(() => {
                    button.innerHTML = originalContent;
                  }, 2000);
                }
              }}
            >
              <CopyIcon className="w-5 h-5" />
            </button>
            <button
              className="p-2 hover:text-primary rounded-b-md w-full flex justify-center items-center"
              onClick={e => {
                e.stopPropagation();
                openView();
              }}
            >
              <ArrowUpIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  }, [status, connect, openView, address]);

  return _renderConnectButton;
};

export function WalletNotConnected({
  description,
  icon,
}: {
  description: string;
  icon: JSX.Element;
}) {
  return (
    <section className="transition-opacity duration-300 h-[80vh] ease-in-out animate-fadeIn w-full flex items-center justify-center">
      <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
            Connect your wallet!
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
            {description}
          </p>
          <div className="w-[50%]">
            <WalletSection chainName="manifest" />
          </div>
        </div>
        <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">{icon}</div>
      </div>
    </section>
  );
}
