import {
  DeliverTxResponse,
  isDeliverTxSuccess,
  StdFee,
} from "@cosmjs/stargate";
import { useChain } from "@cosmos-kit/react";
import { cosmos } from "@chalabi/manifestjs";
import { TxRaw } from "@chalabi/manifestjs/dist/codegen/cosmos/tx/v1beta1/tx";
import { Event } from "@chalabi/manifestjs/dist/codegen/tendermint/abci/types";
import { useState } from "react";
import Link from "next/link";

interface Msg {
  typeUrl: string;
  value: any;
}

export interface TxOptions {
  fee?: StdFee | null;
  memo?: string;
  onSuccess?: () => void;
}

export enum TxStatus {
  Failed = "Transaction Failed",
  Successful = "Transaction Successful",
  Broadcasting = "Transaction Broadcasting",
}

const txRaw = cosmos.tx.v1beta1.TxRaw;

export const useTx = (chainName: string) => {
  const { address, getSigningStargateClient, estimateFee } =
    useChain(chainName);
  const [responseEvents, setResponseEvents] = useState<readonly Event[] | null>(
    null
  );

  const tx = async (msgs: Msg[], options: TxOptions) => {
    if (!address) {
      return;
    }

    let signed: TxRaw;
    let client: Awaited<ReturnType<typeof getSigningStargateClient>>;

    try {
      let fee: StdFee;
      if (options?.fee) {
        fee = options.fee;
        client = await getSigningStargateClient();
      } else {
        const [_fee, _client] = await Promise.all([
          estimateFee(msgs),
          getSigningStargateClient(),
        ]);
        fee = _fee;
        client = _client;
      }
      signed = await client.sign(address, msgs, fee, options.memo || "");
    } catch (e: any) {
      console.error(e);

      return;
    }

    <div className="toast">
      <div className="alert alert-info">
        <span className="loading loading-ring loading-md"></span>
        <span>Transaction Broadcasting</span>
      </div>
    </div>;
    if (client && signed) {
      await client
        .broadcastTx(Uint8Array.from(txRaw.encode(signed).finish()))
        .then((res: DeliverTxResponse) => {
          //@ts-ignore
          if (isDeliverTxSuccess(res)) {
            if (options.onSuccess) options.onSuccess();
            //@ts-ignore
            setResponseEvents(res?.events);
            return (
              <div className="toast">
                <div className="alert alert-success">
                  <div className="flex flex-col text-left">
                    <span>Transaction Success</span>
                    <Link
                      href={`https://mintscan.io/${chainName}/tx/${res?.transactionHash}`}
                    >
                      <a className="text-blue-500 underline">
                        View on Mintscan
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            );
          } else {
          }
        })
        .catch((err: any) => {
          console.error(err);
          return (
            <div className="toast">
              <div className="alert alert-error">
                <span>Tx Error</span>
                <span>{err.message}</span>
              </div>
            </div>
          );
        });
    } else {
    }
  };

  return { tx, responseEvents };
};
