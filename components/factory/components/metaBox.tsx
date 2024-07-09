import { useState } from "react";
import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";
import MintForm from "@/components/factory/forms/MintForm";
import BurnForm from "@/components/factory/forms/BurnForm";
import TransferForm from "@/components/factory/forms/TransferForm";

export default function MetaBox({
  denom,
  address,
  refetch,
}: {
  denom: MetadataSDKType | null;
  address: string;
  refetch: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "mint" | "burn" | "admin" | "transfer"
  >("mint");

  if (!denom) {
    return (
      <div className="flex flex-col rounded-md max-h-[23rem] min-h-[23rem] bg-base-100 shadow w-full p-4 animate-fadeIn">
        <div className="flex items-center justify-center h-full">
          <p className="text-center text-gray-500">
            Select a token to view options
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-md max-h-[23rem] min-h-[23rem] bg-base-100 shadow w-full p-4 animate-fadeIn">
      <h2 className="text-xl font-semibold mb-4">
        {`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ${
          denom.display
        }`}
      </h2>
      <div role="tablist" className="tabs tabs-lifted bg-transparent">
        <button
          type="button"
          role="tab"
          className={`tab ${activeTab === "mint" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("mint")}
          aria-selected={activeTab === "mint"}
        >
          Mint
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${activeTab === "burn" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("burn")}
          aria-selected={activeTab === "burn"}
        >
          Burn
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${activeTab === "admin" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("admin")}
          aria-selected={activeTab === "admin"}
        >
          Admin
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${activeTab === "transfer" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("transfer")}
          aria-selected={activeTab === "transfer"}
        >
          Transfer
        </button>
      </div>

      {activeTab === "mint" && (
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box p-6"
        >
          <MintForm refetch={refetch} address={address} denom={denom} />
        </div>
      )}
      {activeTab === "burn" && (
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box p-6"
        >
          <BurnForm refetch={refetch} address={address} denom={denom} />
        </div>
      )}
      {activeTab === "admin" && (
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box p-6"
        ></div>
      )}
      {activeTab === "transfer" && (
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box p-6"
        >
          <TransferForm denom={denom} />
        </div>
      )}
    </div>
  );
}
