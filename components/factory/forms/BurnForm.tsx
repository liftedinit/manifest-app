import React, { useState } from "react";
import { chainName } from "@/config";
import { useFeeEstimation, useTx } from "@/hooks";
import { osmosis } from "@chalabi/manifestjs";
import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";
import { PiAddressBook } from "react-icons/pi";
import { shiftDigits } from "@/utils";

export default function BurnForm({
  denom,
  address,
  refetch,
  balance,
}: {
  denom: MetadataSDKType;
  address: string;
  refetch: () => void;
  balance: string;
}) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(address);
  const [isSigning, setIsSigning] = useState(false);
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { burn } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const exponent =
    denom.denom_units.find((unit) => unit.denom === denom.display)?.exponent ||
    0;
  const handleBurn = async () => {
    if (!amount || isNaN(Number(amount))) {
    }
    setIsSigning(true);
    try {
      const amountInBaseUnits = BigInt(
        parseFloat(amount) * Math.pow(10, exponent)
      ).toString();
      const msg = burn({
        amount: {
          amount: amountInBaseUnits,
          denom: denom.base,
        },
        sender: address,
        burnFromAddress: recipient,
      });
      const fee = await estimateFee(address ?? "", [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          setAmount("");
          refetch();
        },
      });
    } catch (error) {
      console.error("Error during Burning:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleAddressBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setRecipient(address);
  };

  return (
    <div className="animate-fadeIn text-sm z-10 ">
      <div className="rounded-lg mb-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">NAME</p>
            <p className="font-semibold text-md">{denom.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">YOUR BALANCE</p>
            <p className="font-semibold text-md">
              {" "}
              {shiftDigits(balance, -exponent)}
            </p>
          </div>
          <div>
            <p className="text-md text-gray-500">EXPONENT</p>
            <p className="font-semibold text-md">
              {denom.denom_units[1].exponent}
            </p>
          </div>
          <div>
            <p className="text-md text-gray-500">CIRCULATING SUPPLY</p>
            <p className="font-semibold text-md">{denom.display}</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="label p-0">
            <p className="text-md ">AMOUNT</p>
          </label>
          <input
            type="text"
            placeholder="Enter amount"
            className="input input-bordered h-10 input-sm w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="label p-0">
            <p className="text-md ">TARGET</p>
          </label>
          <div className="flex flex-row items-center">
            <input
              type="text"
              placeholder="Target address"
              className="input input-bordered input-sm h-10 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none w-full "
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <button
              onClick={handleAddressBookClick}
              className="btn btn-secondary btn-sm  h-10 rounded-tr-lg rounded-br-lg rounded-bl-none rounded-tl-none"
            >
              <PiAddressBook className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleBurn}
          className="btn btn-secondary btn-md w-full"
          disabled={isSigning}
        >
          {isSigning ? (
            <span className="loading loading-dots loading-xs"></span>
          ) : (
            "Burn"
          )}
        </button>
      </div>
    </div>
  );
}
