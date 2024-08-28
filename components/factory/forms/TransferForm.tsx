import React, { useState } from "react";
import { chainName } from "@/config";
import { useFeeEstimation, useTx } from "@/hooks";
import { osmosis } from "@chalabi/manifestjs";
import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";
import { PiAddressBook, PiSwap } from "react-icons/pi";

export default function TransferForm({
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
  const [fromAddress, setFromAddress] = useState(address);
  const [toAddress, setToAddress] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { forceTransfer } =
    osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

  const handleTransfer = async () => {
    if (!amount || isNaN(Number(amount))) {
      return;
    }
    setIsSigning(true);
    try {
      const exponent =
        denom?.denom_units?.find((unit) => unit.denom === denom.display)
          ?.exponent || 0;
      const amountInBaseUnits = BigInt(
        parseFloat(amount) * Math.pow(10, exponent),
      ).toString();
      const msg = forceTransfer({
        sender: address,
        amount: {
          amount: amountInBaseUnits,
          denom: denom.base,
        },
        transferFromAddress: fromAddress,
        transferToAddress: toAddress,
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
      console.error("Error during transfer:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleFromAddressBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setFromAddress(address);
  };

  const handleToAddressBookClick = (e: React.MouseEvent) => {
    setToAddress(address);
  };

  const handleSwap = () => {
    const temp = fromAddress;
    setFromAddress(toAddress);
    setToAddress(temp);
  };

  return (
    <div className="animate-fadeIn text-sm z-10 ">
      <div className="rounded-lg mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">CIRCULATING SUPPLY</p>
            <p className="font-semibold text-md max-w-[20ch] truncate">
              {denom.symbol}
            </p>
          </div>
          <div>
            <p className="text-md text-gray-500">EXPONENT</p>
            <p className="font-semibold text-md">
              {denom?.denom_units[1]?.exponent}
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
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
      </div>
      <div className="flex space-x-4 mt-3 items-center">
        <div className="flex-1">
          <label className="label p-0">
            <p className="text-md ">FROM</p>
          </label>
          <div className="flex flex-row items-center">
            <input
              type="text"
              placeholder="From address"
              className="input input-bordered input-sm h-10 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none w-full "
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
            />
            <button
              onClick={handleFromAddressBookClick}
              className="btn btn-primary btn-sm  h-10 rounded-tr-lg rounded-br-lg rounded-bl-none rounded-tl-none"
            >
              <PiAddressBook className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div>
          <button onClick={handleSwap} className="btn btn-ghost btn-circle">
            <PiSwap className="w-6 h-6 mt-4" />
          </button>
        </div>
        <div className="flex-1">
          <label className="label p-0">
            <p className="text-md ">TO</p>
          </label>
          <div className="flex flex-row items-center">
            <input
              type="text"
              placeholder="To address"
              className="input input-bordered input-sm h-10 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none w-full "
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
            <button
              onClick={handleToAddressBookClick}
              className="btn btn-primary btn-sm  h-10 rounded-tr-lg rounded-br-lg rounded-bl-none rounded-tl-none"
            >
              <PiAddressBook className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleTransfer}
          className="btn btn-primary btn-md w-full"
          disabled={isSigning}
        >
          {isSigning ? (
            <span className="loading loading-dots loading-xs"></span>
          ) : (
            "Transfer"
          )}
        </button>
      </div>
    </div>
  );
}
