import { useState, useEffect } from "react";
import { chainName } from "@/config";
import { useFeeEstimation, useTx } from "@/hooks";
import { cosmos } from "@chalabi/manifestjs";
import { PiAddressBook, PiCaretDownBold } from "react-icons/pi";
import { shiftDigits } from "@/utils";
import { CombinedBalanceInfo } from "@/pages/bank";
import { DenomImage } from "@/components/factory";

export default function SendForm({
  address,
  balances,
  isBalancesLoading,
  refetchBalances,
}: Readonly<{
  address: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
}>) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] =
    useState<CombinedBalanceInfo | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { send } = cosmos.bank.v1beta1.MessageComposer.withTypeUrl;

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
          (unit) => unit.denom === selectedToken.denom,
        )?.exponent ?? 6;
      const amountInBaseUnits = shiftDigits(amount, exponent);

      const msg = send({
        fromAddress: address,
        toAddress: recipient,
        amount: [{ denom: selectedToken.coreDenom, amount: amountInBaseUnits }],
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

  const [searchTerm, setSearchTerm] = useState("");

  const filteredBalances = balances?.filter((token) =>
    token.metadata?.display.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="text-sm">
      <div className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text text-sm font-medium">Token</span>
          </label>
          <div className="dropdown dropdown-end w-full">
            <label
              tabIndex={0}
              className="btn btn-sm bg-base-300 w-full justify-between"
              aria-label={"dropdown-label"}
            >
              {selectedToken?.metadata?.display.toUpperCase() ?? "Select Token"}
              <PiCaretDownBold className="ml-2" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[100] menu p-2 shadow bg-base-300 rounded-lg w-full mt-1 h-62 max-h-62 min-h-62 overflow-y-auto"
            >
              <li className="sticky top-0 bg-base-300 z-10 hover:bg-transparent">
                <div className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Search tokens..."
                    className="input input-sm w-full pr-8 focus:outline-none focus:ring-0 border-none bg-transparent"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ boxShadow: "none" }}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </li>
              {isBalancesLoading ? (
                <li>
                  <a>Loading tokens...</a>
                </li>
              ) : (
                filteredBalances?.map((token) => (
                  <li
                    key={token.coreDenom}
                    onClick={() => setSelectedToken(token)}
                    className="flex justify-start"
                    aria-label={token.metadata?.display}
                  >
                    <a className="flex-row justify-start gap-3 items-center w-full">
                      <DenomImage denom={token.metadata} />
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
