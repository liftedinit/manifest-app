import { MouseEventHandler, useMemo } from "react";

import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { PiWalletThin } from "react-icons/pi";
import { useChain } from "@cosmos-kit/react";
import { WalletStatus } from "cosmos-kit";

const buttons = {
  Disconnected: {
    icon: PiWalletThin,
    title: "Connect Wallet",
  },
  Connected: {
    icon: PiWalletThin,
    title: "My Wallet",
  },
  Rejected: {
    icon: ArrowPathIcon,
    title: "Reconnect",
  },
  Error: {
    icon: ArrowPathIcon,
    title: "Change Wallet",
  },
  NotExist: {
    icon: ArrowDownTrayIcon,
    title: "Install Wallet",
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

  const onClickConnect: MouseEventHandler = async (e) => {
    e.preventDefault();
    await connect();
  };

  const onClickOpenView: MouseEventHandler = (e) => {
    e.preventDefault();
    openView();
  };

  const _renderConnectButton = useMemo(() => {
    if (status === WalletStatus.Connecting) {
      return (
        <button className="rounded-lg w-full bg-purple-damp hover:bg-purple-damp/75 inline-flex justify-center items-center py-1.5 font-medium cursor-wait text-dark-bg-800 dark:text-light-bg-100 text-sm">
          <svg
            className="w-4 h-4 text-dark-bg-800 dark:text-light-bg-100 animate-spin mr-2"
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
          Loading...
        </button>
      );
    }

    let onClick;
    if (
      status === WalletStatus.Disconnected ||
      status === WalletStatus.Rejected
    )
      onClick = onClickConnect;
    else onClick = onClickOpenView;

    const buttonData = buttons[status];

    return (
      <button
        className="rounded-lg bg-purple-damp w-full bg-mint inline-flex justify-center items-center py-2 font-medium text-dark-bg-800 dark:text-light-bg-100 text-sm"
        onClick={onClick}
      >
        <buttonData.icon className="flex-shrink-0 w-4 h-4 mr-2 text-dark-bg-800 dark:text-light-bg-100" />
        {buttonData.title}
      </button>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, connect, openView]);

  return (
    <div className="w-full max-w-48">
      <div className="w-full px-4">{_renderConnectButton}</div>
    </div>
  );
};

export const IconWallet: React.FC<WalletSectionProps> = ({ chainName }) => {
  const { connect, openView, status } = useChain(chainName);

  const onClickConnect: MouseEventHandler = async (e) => {
    e.preventDefault();
    await connect();
  };

  const onClickOpenView: MouseEventHandler = (e) => {
    e.preventDefault();
    openView();
  };

  const _renderConnectButton = useMemo(() => {
    if (status === WalletStatus.Connecting) {
      return (
        <button className="rounded-lg w-6 h-6 justify-center items-center mx-auto ml-[6px] font-medium cursor-wait text-dark-bg-800 dark:text-light-bg-100 text-sm">
          <svg
            className="w-6 h-6 text-dark-bg-800 dark:text-mint justify-center items-center animate-spin mx-auto"
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
    if (
      status === WalletStatus.Disconnected ||
      status === WalletStatus.Rejected
    )
      onClick = onClickConnect;
    else onClick = onClickOpenView;

    const buttonData = buttons[status];

    return (
      <button
        className="rounded-lg mx-auto hover:bg-dark-bg-100/10 dark:hover:bg-light-bg-100/10 p-1 transition-all duration-200 ease-in-out focus:ring-4 focus:ring-mint-300 dark:focus:ring-mint-900  justify-center items-center  font-medium text-dark-bg-800 dark:text-light-bg-100 text-sm"
        onClick={onClick}
      >
        <buttonData.icon className=" w-6 h-6 text-dark-bg-800 dark:text-light-bg-100 transition-all duration-200 ease-in-out  hover:text-mint dark:hover:text-mint" />
      </button>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, connect, openView]);

  return (
    <div className="w-full mx-auto ">
      <div className="w-full mx-auto">{_renderConnectButton}</div>
    </div>
  );
};
