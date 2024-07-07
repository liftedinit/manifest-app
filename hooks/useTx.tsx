import {
  DeliverTxResponse,
  isDeliverTxSuccess,
  SigningStargateClient,
  StdFee,
} from "@cosmjs/stargate";
import { useChain } from "@cosmos-kit/react";

import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { useState } from "react";
import Link from "next/link";

interface ToastMessage {
  type: string;
  title: string;
  description?: string;
  link?: string;
}

interface Msg {
  typeUrl: string;
  value: any;
}

export interface TxOptions {
  fee?: StdFee | null;
  memo?: string;
  onSuccess?: () => void;
}

const convertBigIntToString = (obj: any): any => {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        convertBigIntToString(value),
      ])
    );
  }
  return obj;
};

export const useTx = (chainName: string) => {
  const { address, getSigningStargateClient, estimateFee } =
    useChain(chainName);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const tx = async (msgs: Msg[], options: TxOptions) => {
    if (!address) {
      setToastMessage({
        type: "alert-error",
        title: "Wallet not connected",
        description: "Please connect your wallet.",
      });
      return;
    }

    let client: SigningStargateClient;
    try {
      client = await getSigningStargateClient();

      // Convert BigInt values in msgs and options
      const convertedMsgs = convertBigIntToString(msgs);
      const convertedOptions = convertBigIntToString(options);

      // Estimate fee if not provided
      let fee = convertedOptions.fee;
      if (!fee) {
        const estimatedFee = await estimateFee(convertedMsgs);
        fee = convertBigIntToString(estimatedFee) as StdFee;
      }

      setToastMessage({
        type: "alert-info",
        title: "Signing",
        description: "Please sign the transaction in your wallet...",
      });

      // Use the signAndBroadcast method which handles signing internally
      const result = await client.signAndBroadcast(
        address,
        convertedMsgs,
        fee as StdFee,
        convertedOptions.memo || ""
      );

      if (isDeliverTxSuccess(result)) {
        if (convertedOptions.onSuccess) convertedOptions.onSuccess();
        setToastMessage({
          type: "alert-success",
          title: "Transaction Successful",
          description: `Transaction completed with hash: ${result.transactionHash}`,
          link: `https://mintscan.io/${chainName}/tx/${result.transactionHash}`,
        });
      } else {
        setToastMessage({
          type: "alert-error",
          title: "Transaction Failed",
          description: result.rawLog || "Unknown error",
        });
      }
    } catch (e: any) {
      console.error("Failed to broadcast: ", e);
      setToastMessage({
        type: "alert-error",
        title: "Transaction Failed",
        description: e.message,
      });
    }
  };

  interface ToastProps {
    toastMessage: ToastMessage | null;
    setToastMessage: (msg: ToastMessage | null) => void;
  }

  const Toast: React.FC<ToastProps> = ({ toastMessage, setToastMessage }) => {
    const handleClose = () => {
      setToastMessage(null);
    };

    if (!toastMessage) {
      return null;
    }

    return (
      <div className="toast toast-end toast-bottom flex flex-col justify-start items-center text-left">
        <button
          className="absolute top-4 right-2 px-4 text-black hover:text-red-600 z-50"
          onClick={handleClose}
        >
          ✖
        </button>

        {toastMessage.type === "alert-success" && (
          <div className="alert alert-success flex justify-start items-start flex-col  relative">
            <span className="text-xl">{toastMessage.title}</span>
            <div className="max-w-sm  min-w-sm whitespace-normal">
              {toastMessage.description}
            </div>
            {toastMessage.link && (
              <Link href={toastMessage.link} legacyBehavior>
                <a className="text-blue-500 min-w-sm underline">
                  View on Mintscan
                </a>
              </Link>
            )}
          </div>
        )}

        {toastMessage.type === "alert-info" && (
          <div className="alert bg-info justify-start items-start flex flex-col relative">
            <span className="text-xl flex flex-row gap-4">
              <span className="loading loading-bars loading-md" />
              {toastMessage.title}
            </span>
            <div className="text-sm max-w-sm whitespace-normal">
              {toastMessage.description}
            </div>
          </div>
        )}

        {toastMessage.type === "alert-error" && (
          <div className="alert flex justify-start items-start flex-col alert-error relative">
            <span className="text-xl">{toastMessage.title}</span>
            <div className="text-xs  whitespace-normal max-w-sm">
              {toastMessage.description}
            </div>
          </div>
        )}
      </div>
    );
  };

  return { tx, Toast, toastMessage, setToastMessage };
};
