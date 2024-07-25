import {
  DeliverTxResponse,
  isDeliverTxSuccess,
  StdFee,
} from "@cosmjs/stargate";
import { useChain } from "@cosmos-kit/react";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { useToast } from "@/contexts/toastContext";
import { useState } from "react";

interface Msg {
  typeUrl: string;
  value: any;
}

export interface TxOptions {
  fee?: StdFee | null;
  memo?: string;
  onSuccess?: () => void;
}

export const useTx = (chainName: string) => {
  const { address, getSigningStargateClient, estimateFee } =
    useChain(chainName);
  const { setToastMessage } = useToast();
  const [isSigning, setIsSigning] = useState(false);

  const tx = async (msgs: Msg[], options: TxOptions) => {
    if (!address) {
      setToastMessage({
        type: "alert-error",
        title: "Wallet not connected",
        description: "Please connect your wallet.",
        bgColor: "#e74c3c",
      });
      return;
    }
    setIsSigning(true);
    let client;
    try {
      client = await getSigningStargateClient();
      const signed = await client.sign(
        address,
        msgs,
        options.fee || (await estimateFee(msgs)),
        options.memo || ""
      );
      setToastMessage({
        type: "alert-info",
        title: "Broadcasting",
        description: "Transaction is signed and is being broadcasted...",
        bgColor: "#3498db",
      });
      setIsSigning(true);
      await client
        .broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()))
        .then((res: DeliverTxResponse) => {
          if (isDeliverTxSuccess(res)) {
            if (options.onSuccess) options.onSuccess();
            setIsSigning(false);
            setToastMessage({
              type: "alert-success",
              title: "Transaction Successful",
              description: `Transaction completed successfully`,
              link: `https://manifest-explorer.vercel.app/manifest/tx/${res?.transactionHash}`,
              bgColor: "#2ecc71",
            });
          } else {
            setIsSigning(false);
            setToastMessage({
              type: "alert-error",
              title: "Transaction Failed",
              description: res?.rawLog || "Unknown error",
              bgColor: "#e74c3c",
            });
          }
        })
        .catch((err: Error) => {
          console.error("Failed to broadcast: ", err);
          setIsSigning(false);
          setToastMessage({
            type: "alert-error",
            title: "Transaction Failed",
            description: err.message,
            bgColor: "#e74c3c",
          });
        });
    } catch (e: any) {
      console.error("Failed to broadcast: ", e);
      setIsSigning(false);
      setToastMessage({
        type: "alert-error",
        title: "Transaction Failed",
        description: e.message,
        bgColor: "#e74c3c",
      });
    } finally {
      setIsSigning(false);
    }
  };

  return { tx, isSigning, setIsSigning };
};
