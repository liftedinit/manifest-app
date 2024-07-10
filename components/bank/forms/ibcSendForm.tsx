import { useState, useEffect } from "react";
import { chainName } from "@/config";
import { useFeeEstimation, useTx, useBalance, useTokenBalances } from "@/hooks";
import { cosmos, ibc } from "@chalabi/manifestjs";

import { getIbcInfo, shiftDigits } from "@/utils";
import { PiAddressBook, PiCaretDownBold } from "react-icons/pi";
import { CoinSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/base/v1beta1/coin";
import { CombinedBalanceInfo } from "@/pages/bank";
import { DenomImage } from "@/components/factory";

export default function IbcSendForm({
  address,
  destinationChain,
  balances,
  isBalancesLoading,
  refetchBalances,
}: {
  address: string;
  destinationChain: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] =
    useState<CombinedBalanceInfo | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { transfer } = ibc.applications.transfer.v1.MessageComposer.withTypeUrl;

  useEffect(() => {
    if (balances && balances.length > 0 && !selectedToken) {
      setSelectedToken(balances[0]);
    }
  }, [balances, selectedToken]);

  const handleSend = async () => {
    if (!amount || isNaN(Number(amount)) || !recipient || !selectedToken) {
      return;
    }

    setIsSending(true);
    try {
      const exponent =
        selectedToken.metadata?.denom_units.find(
          (unit) => unit.denom === selectedToken.denom
        )?.exponent ?? 6;
      const amountInBaseUnits = shiftDigits(amount, exponent);

      const { source_port, source_channel } = getIbcInfo(
        chainName ?? "",
        destinationChain ?? ""
      );

      const token = {
        denom: selectedToken.coreDenom,
        amount: amountInBaseUnits,
      };

      const stamp = Date.now();
      const timeoutInNanos = (stamp + 1.2e6) * 1e6;

      const msg = transfer({
        sourcePort: source_port,
        sourceChannel: source_channel,
        sender: address ?? "",
        receiver: recipient ?? "",
        token,
        //@ts-ignore
        timeoutHeight: undefined,
        //@ts-ignore
        timeoutTimestamp: timeoutInNanos,
      });

      const fee = await estimateFee(address, [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          setAmount("");
          setRecipient("");
          refetchBalances();
        },
      });
    } catch (error) {
      console.error("Error during sending:", error);
    } finally {
      setIsSending(false);
    }
  };
  return (
    <div className="text-sm">
      <div className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text text-sm font-medium">Token</span>
          </label>
          <div className="dropdown dropdown-end w-full ">
            <label
              tabIndex={0}
              className="btn btn-sm bg-base-300 w-full justify-between"
            >
              {selectedToken?.metadata?.display.toUpperCase() ?? "Select Token"}
              <PiCaretDownBold className="ml-2" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[100] menu p-2 shadow bg-base-300 rounded-lg w-full mt-1 max-h-52 min-h-52 overflow-y-auto"
            >
              {isBalancesLoading ? (
                <li>
                  <a>Loading tokens...</a>
                </li>
              ) : (
                balances?.map((token) => (
                  <li
                    key={token.coreDenom}
                    onClick={() => setSelectedToken(token)}
                    className="flex  justify-start "
                  >
                    <a className=" flex-row justify-start gap-3 items-center w-full">
                      {" "}
                      <DenomImage denom={token.metadata} />{" "}
                      {token.metadata?.display.toUpperCase()}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div>
          <label className="label">
            <span className="label-text text-sm font-medium">Recipient</span>
          </label>
          <div className="flex flex-row items-center">
            <input
              type="text"
              placeholder="Recipient address"
              className="input input-bordered input-sm rounded-r-none flex-grow"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <button
              onClick={() => {}}
              className="btn btn-primary btn-sm rounded-l-none"
            >
              <PiAddressBook className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="label">
            <span className="label-text text-sm font-medium">Amount</span>
          </label>
          <input
            type="text"
            placeholder="Enter amount"
            className="input input-bordered input-sm w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <button
            onClick={handleSend}
            className="btn btn-primary w-full"
            disabled={isSending}
          >
            {isSending ? (
              <span className="loading loading-dots loading-xs"></span>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
