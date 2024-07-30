import React, { useState } from "react";
import { chainName } from "@/config";
import { useFeeEstimation, useGroupsByAdmin, useTx } from "@/hooks";
import { cosmos, manifest, osmosis } from "@chalabi/manifestjs";
import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";
import { PiAddressBook, PiPlusCircle, PiMinusCircle } from "react-icons/pi";
import { shiftDigits } from "@/utils";
import { Any } from "@chalabi/manifestjs/dist/codegen/google/protobuf/any";
import { MsgPayout } from "@chalabi/manifestjs/dist/codegen/manifest/v1/tx";
import { MultiMintModal } from "../modals/multiMfxMintModal";

interface PayoutPair {
  address: string;
  amount: string;
}

export default function MintForm({
  admin,
  denom,
  address,
  refetch,
  balance,
  isAdmin,
}: {
  admin: string;
  denom: MetadataSDKType;
  address: string;
  refetch: () => void;
  balance: string;
  isAdmin: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(address);
  const [isSigning, setIsSigning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutPairs, setPayoutPairs] = useState<PayoutPair[]>([
    { address: "", amount: "" },
  ]);

  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { mint } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const { payout } = manifest.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const exponent =
    denom?.denom_units?.find((unit) => unit.denom === denom.display)
      ?.exponent || 0;
  const isMFX = denom.base.includes("mfx");

  const handleMint = async () => {
    if (!amount || isNaN(Number(amount))) {
      return;
    }
    setIsSigning(true);
    try {
      const amountInBaseUnits = BigInt(
        parseFloat(amount) * Math.pow(10, exponent)
      ).toString();

      let msg;
      if (isMFX) {
        const payoutMsg = payout({
          authority: admin ?? "",
          payoutPairs: [
            {
              address: recipient,
              coin: { denom: denom.base, amount: amountInBaseUnits },
            },
          ],
        });
        const encodedMessage = Any.fromPartial({
          typeUrl: payoutMsg.typeUrl,
          value: MsgPayout.encode(payoutMsg.value).finish(),
        });
        msg = submitProposal({
          groupPolicyAddress: admin ?? "",
          messages: [encodedMessage],
          metadata: "",
          proposers: [address ?? ""],
          title: `Manifest Module Control: Mint MFX`,
          summary: `This proposal includes a mint action for MFX.`,
          exec: 0,
        });
      } else {
        msg = mint({
          amount: {
            amount: amountInBaseUnits,
            denom: denom.base,
          },
          sender: address,
          mintToAddress: recipient,
        });
      }

      const fee = await estimateFee(address ?? "", [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          setAmount("");
          refetch();
        },
      });
    } catch (error) {
      console.error("Error during minting:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleMultiMint = async () => {
    if (
      payoutPairs.some(
        (pair) => !pair.address || !pair.amount || isNaN(Number(pair.amount))
      )
    ) {
      alert("Please fill in all fields with valid values.");
      return;
    }
    setIsSigning(true);
    try {
      const payoutMsg = payout({
        authority: admin ?? "",
        payoutPairs: payoutPairs.map((pair) => ({
          address: pair.address,
          coin: {
            denom: denom.base,
            amount: BigInt(
              parseFloat(pair.amount) * Math.pow(10, exponent)
            ).toString(),
          },
        })),
      });
      const encodedMessage = Any.fromAmino({
        type: payoutMsg.typeUrl,
        value: MsgPayout.encode(payoutMsg.value).finish(),
      });
      const msg = submitProposal({
        groupPolicyAddress: admin ?? "",
        messages: [encodedMessage],
        metadata: "",
        proposers: [address ?? ""],
        title: `Manifest Module Control: Multi Mint MFX`,
        summary: `This proposal includes multiple mint actions for MFX.`,
        exec: 0,
      });

      const fee = await estimateFee(address ?? "", [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          setPayoutPairs([{ address: "", amount: "" }]);
          setIsModalOpen(false);
          refetch();
        },
      });
    } catch (error) {
      console.error("Error during multi-minting:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const addPayoutPair = () =>
    setPayoutPairs([...payoutPairs, { address: "", amount: "" }]);
  const removePayoutPair = (index: number) =>
    setPayoutPairs(payoutPairs.filter((_, i) => i !== index));
  const updatePayoutPair = (
    index: number,
    field: "address" | "amount",
    value: string
  ) => {
    const newPairs = [...payoutPairs];
    newPairs[index][field] = value;
    setPayoutPairs(newPairs);
  };

  return (
    <div className="animate-fadeIn text-sm z-10">
      <div className="rounded-lg mb-8">
        {isMFX && !isAdmin ? (
          <div className="w-full p-2 justify-center items-center my-auto h-full mt-24 leading-tight text-xl flex flex-col font-medium text-pretty">
            <span>You are not affiliated with any PoA Admin entity.</span>
          </div>
        ) : (
          <>
            <>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">NAME</p>
                  <p className="font-semibold text-md max-w-[20ch] truncate">
                    {denom.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">YOUR BALANCE</p>
                  <p className="font-semibold text-md">
                    {shiftDigits(balance, -exponent)}
                  </p>
                </div>
                <div>
                  <p className="text-md text-gray-500">EXPONENT</p>
                  <p className="font-semibold text-md">
                    {denom?.denom_units[1]?.exponent}
                  </p>
                </div>
                <div>
                  <p className="text-md text-gray-500">CIRCULATING SUPPLY</p>
                  <p className="font-semibold text-md max-w-[20ch] truncate">
                    {denom.display}
                  </p>
                </div>
              </div>
              <div className="flex space-x-4 mt-8 ">
                <div className="flex-1">
                  <label className="label p-0">
                    <p className="text-md">AMOUNT</p>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter amount"
                    className="input input-bordered h-10 input-sm w-full"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="flex-1 ">
                  <label className="label p-0">
                    <p className="text-md">RECIPIENT</p>
                  </label>
                  <div className="flex flex-row items-center">
                    <input
                      type="text"
                      placeholder="Recipient address"
                      className="input input-bordered input-sm h-10 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none w-full"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                    <button
                      onClick={() => setRecipient(address)}
                      className="btn btn-primary btn-sm h-10 rounded-tr-lg rounded-br-lg rounded-bl-none rounded-tl-none"
                    >
                      <PiAddressBook className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={handleMint}
                className="btn btn-primary btn-md flex-grow"
                disabled={isSigning}
              >
                {isSigning ? (
                  <span className="loading loading-dots loading-xs"></span>
                ) : (
                  "Mint"
                )}
              </button>
              {isMFX && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary btn-md"
                >
                  Multi Mint
                </button>
              )}
              <MultiMintModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                payoutPairs={payoutPairs}
                updatePayoutPair={updatePayoutPair}
                addPayoutPair={addPayoutPair}
                removePayoutPair={removePayoutPair}
                handleMultiMint={handleMultiMint}
                isSigning={isSigning}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
