import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import { chainName } from "@/config";
import { useFeeEstimation, useTx } from "@/hooks";
import { cosmos, manifest } from "@chalabi/manifestjs";

import { Any } from "@chalabi/manifestjs/dist/codegen/google/protobuf/any";
import {
  MsgBurnHeldBalance,
  MsgPayout,
} from "@chalabi/manifestjs/dist/codegen/manifest/v1/tx";
import { useChain } from "@cosmos-kit/react";
import { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlusCircle,
  FiMinusCircle,
} from "react-icons/fi";

type MessageType = "payout" | "burn";

export function DenomInfoModal({
  denom,
  modalId,
  isMFX,
  admin,
  isMember,
}: {
  denom: any;
  modalId: string;
  isMFX?: boolean;
  admin?: string;
  isMember?: boolean;
}) {
  const { payout, burnHeldBalance } = manifest.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { tx, isSigning, setIsSigning } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { address } = useChain(chainName);
  const [activeTab, setActiveTab] = useState<MessageType>("payout");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messageTypes: MessageType[] = ["payout", "burn"];
  const [messages, setMessages] = useState<{
    payout: MsgPayout;
    burn: MsgBurnHeldBalance;
  }>({
    payout: {
      authority: admin ?? "",
      payoutPairs: [{ address: "", coin: { denom: "", amount: "" } }],
    },
    burn: {
      authority: admin ?? "",
      burnCoins: [{ denom: "", amount: "" }],
    },
  });

  const handleChange = (field: string, value: any) => {
    setMessages((prevMessages) => ({
      ...prevMessages,
      [activeTab]: {
        ...prevMessages[activeTab],
        [field]: value,
      },
    }));
  };

  const PayoutPairsInputs = () => (
    <div className="overflow-y-auto max-h-[28rem]">
      {messages.payout.payoutPairs.map((pair, index) => (
        <div
          key={index}
          className="mb-6 pl-4 border-l-2 border-gray-200 bg-base-200 p-4 rounded-tr-md rounded-br-md relative"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold bg-primary text-primary-content px-2 py-1 rounded">
              Mint MFX #{index + 1}
            </span>
            <button
              className="btn btn-circle btn-secondary btn-xs"
              onClick={() => {
                const newPairs = [...messages.payout.payoutPairs];
                newPairs.splice(index, 1);
                handleChange("payoutPairs", newPairs);
              }}
            >
              <FiMinusCircle className="text-white" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-100 block">Receiver</label>
              <input
                type="text"
                placeholder="Address"
                className="input input-bordered input-sm w-full focus:outline-none"
                value={pair.address}
                onChange={(e) =>
                  handleChange(`payoutPairs.${index}.address`, e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-100 block">Token Name</label>
              <input
                type="text"
                placeholder="Denom"
                className="input input-bordered input-sm w-full focus:outline-none"
                value={pair.coin.denom}
                onChange={(e) =>
                  handleChange(
                    `payoutPairs.${index}.coin.denom`,
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-100 block">Amount</label>
              <input
                type="text"
                placeholder="Amount"
                className="input input-bordered input-sm w-full focus:outline-none"
                value={pair.coin.amount}
                onChange={(e) =>
                  handleChange(
                    `payoutPairs.${index}.coin.amount`,
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const BurnCoinsInputs = () => (
    <div className="overflow-y-auto max-h-[28rem]">
      {messages.burn.burnCoins.map((coin, index) => (
        <div
          key={index}
          className="mb-6 pl-4 border-l-2 border-gray-200 bg-base-200 p-4 rounded-tr-md rounded-br-md relative"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold bg-secondary text-secondary-content px-2 py-1 rounded">
              Burn MFX #{index + 1}
            </span>
            <button
              className="btn btn-circle btn-secondary btn-xs"
              onClick={() => {
                const newCoins = [...messages.burn.burnCoins];
                newCoins.splice(index, 1);
                handleChange("burnCoins", newCoins);
              }}
            >
              <FiMinusCircle className="text-white" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-100 block">Token Name</label>
              <input
                type="text"
                placeholder="Denom"
                className="input input-bordered input-sm w-full focus:outline-none"
                value={coin.denom}
                onChange={(e) =>
                  handleChange(`burnCoins.${index}.denom`, e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-100 block">Amount</label>
              <input
                type="text"
                placeholder="Amount"
                className="input input-bordered input-sm w-full focus:outline-none"
                value={coin.amount}
                onChange={(e) =>
                  handleChange(`burnCoins.${index}.amount`, e.target.value)
                }
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const handleSubmitProposal = async () => {
    setIsSigning(true);
    let encodedMessage;
    switch (activeTab) {
      case "payout":
        encodedMessage = Any.fromPartial({
          typeUrl: MsgPayout.typeUrl,
          value: MsgPayout.encode(payout(messages.payout).value).finish(),
        });
        break;
      case "burn":
        encodedMessage = Any.fromPartial({
          typeUrl: MsgBurnHeldBalance.typeUrl,
          value: MsgBurnHeldBalance.encode(
            burnHeldBalance(messages.burn).value
          ).finish(),
        });
        break;
    }

    const msg = submitProposal({
      groupPolicyAddress: address ?? "",
      messages: [encodedMessage ?? ({} as Any)],
      metadata: "",
      proposers: [address ?? ""],
      title: `Manifest Module Control: ${activeTab}`,
      summary: `This proposal includes a ${activeTab} action.`,
      exec: 0,
    });
    const fee = await estimateFee(address ?? "", [msg]);
    await tx([msg], {
      fee,
      onSuccess: () => {
        setIsSigning(false);
      },
    });
  };

  const toggleManifestControls = () => {
    const modal = document.getElementById(
      "manifest-controls-modal"
    ) as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <>
      <dialog id={modalId} className="modal">
        <div className="modal-box absolute max-w-4xl mx-auto rounded-lg md:ml-20 shadow-lg">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-1 top-1">
              ✕
            </button>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div>
              <h3 className="text-lg font-semibold">Denom Details</h3>
              <div className="divider divider-horizon -mt-0"></div>
              <div>
                <p className="text-sm font-light mt-4">NAME</p>
                <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                  <p className="text-md">{denom.name ?? "No name available"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-light mt-4">SYMBOL</p>
                <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                  <p className="text-md">
                    {denom.symbol ?? "No symbol available"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-light mt-4">DESCRIPTION</p>
                <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2 max-h-[9.53rem] overflow-y-auto">
                  <p className="text-md text-wrap">
                    {denom.description ?? "No description available"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-light mt-4">URI</p>
                <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                  <p className="text-md">{denom.uri ?? "No URI available"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-light mt-4">EXPONENT</p>
                <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                  <p className="text-md">{denom.denom_units[1].exponent}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Denom Units</h3>
              <div className="divider divider-horizon -mt-0"></div>
              {denom.denom_units.map((unit: any, index: number) => (
                <div key={index} className="mb-2">
                  <div>
                    <p className="text-sm font-light mt-4">DENOM</p>
                    <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                      <p className="text-md truncate">{unit.denom}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-light mt-4">ALIASES</p>
                    <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                      <p className="text-md">
                        {unit.aliases.join(", ") || "No aliases"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {isMFX === false ? (
            <div className="px-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div className="divider divider-horizon -mt-0"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-light mt-4">BASE</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    <TruncatedAddressWithCopy address={denom.base} slice={28} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-light mt-4">DISPLAY</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    <p className="text-md">
                      {denom.display ?? "No display available"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-light mt-4">URI HASH</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    <p className="text-md">
                      {denom.uri_hash ?? "No URI hash available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4">
              <button
                disabled={!isMember}
                className="btn btn-primary w-full mt-4"
                onClick={toggleManifestControls}
              >
                MFX Controls
              </button>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <>
        {isMFX && (
          <dialog id="manifest-controls-modal" className="modal">
            <div className="modal-box max-w-2xl">
              <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <h3 className="font-bold text-lg">Mint & Burn MFX</h3>
              <div className="divider mt-0 mb-1"></div>
              <div className="flex flex-col w-full items-center justify-between gap-2">
                <div role="tablist" className="tabs tabs-lg w-full items-end">
                  {["payout", "burn"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      className={`tab tab-lg flex-1  ${
                        activeTab === tab
                          ? "tab-active shadow-inner bg-base-200 "
                          : " "
                      } rounded-tl-lg rounded-tr-lg`}
                      onClick={() => setActiveTab(tab as MessageType)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="relative w-full -mt-2">
                  <div
                    className={`animate-fadeIn p-6 ${
                      activeTab === "payout"
                        ? "rounded-tr-lg rounded-br-lg rounded-bl-lg"
                        : "rounded-br-lg rounded-bl-lg rounded-tl-lg"
                    } shadow-inner
                  bg-base-200 w-full overflow-auto min-h-[28rem] max-h-[28rem]`}
                  >
                    {activeTab === "payout" && <PayoutPairsInputs />}
                    {activeTab === "burn" && <BurnCoinsInputs />}
                  </div>
                  <button
                    className={`btn btn-circle btn-sm absolute bottom-2 right-2 ${
                      activeTab === "payout" ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => {
                      if (activeTab === "payout") {
                        handleChange("payoutPairs", [
                          ...messages.payout.payoutPairs,
                          { address: "", coin: { denom: "", amount: "" } },
                        ]);
                      } else {
                        handleChange("burnCoins", [
                          ...messages.burn.burnCoins,
                          { denom: "", amount: "" },
                        ]);
                      }
                    }}
                  >
                    <FiPlusCircle className="text-lg" />
                  </button>
                </div>

                <div className="w-full px-6 mt-2">
                  <button
                    className="btn btn-primary w-full"
                    onClick={handleSubmitProposal}
                    disabled={isSigning}
                  >
                    Submit Proposal
                  </button>
                </div>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        )}
      </>
    </>
  );
}
