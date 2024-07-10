import { useState } from "react";
import SendForm from "../forms/sendForm";
import IbcSendForm from "../forms/ibcSendForm";
import { PiCaretDownBold } from "react-icons/pi";
import Image from "next/image";
import { CoinSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/base/v1beta1/coin";

export default function SendBox({
  address,
  balances,
  isBalancesLoading,
  refetchBalances,
}: {
  address: string;
  balances: CoinSDKType[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
}) {
  const [isIbcTransfer, setIsIbcTransfer] = useState(false);
  const [selectedChain, setSelectedChain] = useState("");
  const ibcChains = [
    {
      id: "osmosis",
      name: "Osmosis",
      icon: "https://osmosis.zone/assets/icons/osmo-logo-icon.svg",
    },
  ];

  return (
    <div className="flex flex-col rounded-md max-h-[28.7rem] w-1/3 min-h-[28.7rem] bg-base-100 shadow px-6 py-4">
      <div className="flex flex-col items-center mb-6">
        <div className="flex flex-row justify-between items-center w-full mb-4 ">
          <h2 className="text-xl font-semibold">
            {isIbcTransfer ? "IBC Transfer" : "Send Tokens"}
          </h2>

          <div
            className={`dropdown dropdown-end  ${
              isIbcTransfer ? "" : "opacity-50 pointer-events-none"
            }`}
            style={{ visibility: isIbcTransfer ? "visible" : "hidden" }}
          >
            <label tabIndex={0} className="btn m-1 btn-sm btn-neutral">
              {ibcChains.find((chain) => chain.id === selectedChain)?.name ??
                "Chain"}
              <PiCaretDownBold className="ml-2" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[100] menu p-2 shadow bg-base-300 rounded-lg w-[17rem] mt-[0.15rem]"
            >
              {ibcChains.map((chain) => (
                <li key={chain.id}>
                  <a
                    onClick={() => setSelectedChain(chain.id)}
                    className="flex items-center"
                  >
                    <Image
                      src={chain.icon}
                      alt={chain.name}
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    {chain.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="divider divider-horizon -mt-4 mb-1"></div>
        <div className="relative  w-[17rem] h-10 bg-base-300 rounded-full p-1 -mb-3">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-6px)] bg-primary rounded-full transition-all duration-300 ease-in-out ${
              isIbcTransfer ? "left-[calc(50%+0px)]" : "left-[6px]"
            }`}
          ></div>
          <div className="relative flex h-full">
            <button
              className={`flex-1 text-sm font-light z-10 transition-colors duration-300 ${
                !isIbcTransfer ? "text-base-content" : "text-gray-600"
              }`}
              onClick={() => setIsIbcTransfer(false)}
            >
              Send
            </button>
            <button
              className={`flex-1 text-sm font-light z-10 transition-colors duration-300 ${
                isIbcTransfer ? "text-base-content" : "text-gray-600"
              }`}
              onClick={() => setIsIbcTransfer(true)}
            >
              IBC Transfer
            </button>
          </div>
        </div>
      </div>
      {isIbcTransfer ? (
        <IbcSendForm
          address={address}
          destinationChain={selectedChain}
          balances={balances}
          isBalancesLoading={isBalancesLoading}
          refetchBalances={refetchBalances}
        />
      ) : (
        <SendForm
          address={address}
          balances={balances}
          isBalancesLoading={isBalancesLoading}
          refetchBalances={refetchBalances}
        />
      )}
    </div>
  );
}
