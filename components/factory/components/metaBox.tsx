import { useState } from "react";
import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";
import MintForm from "@/components/factory/forms/MintForm";
import BurnForm from "@/components/factory/forms/BurnForm";
import TransferForm from "@/components/factory/forms/TransferForm";

export default function MetaBox({ denom }: { denom: MetadataSDKType | null }) {
  const [activeTab, setActiveTab] = useState<
    "admin" | "mint" | "burn" | "transfer"
  >("transfer");

  const renderContent = () => {
    switch (activeTab) {
      case "admin":
        return <MintForm denom={denom ?? ({} as MetadataSDKType)} />;
      case "mint":
        return <MintForm denom={denom ?? ({} as MetadataSDKType)} />;
      case "burn":
        return <BurnForm denom={denom ?? ({} as MetadataSDKType)} />;
      case "transfer":
        return <TransferForm denom={denom ?? ({} as MetadataSDKType)} />;
    }
  };

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
      <div className="rounded-md px-4 py-2 bg-base-200 max-h-[21rem] min-h-[21rem]">
        <div className="px-4 flex flex-row justify-end items-center border-base-content">
          <div role="tablist" className="tabs tabs-lifted tabs-md -mr-4">
            <a
              role="tab"
              className={`tab ${activeTab === "admin" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("admin")}
            >
              Admin
            </a>
            <a
              role="tab"
              className={`tab ${activeTab === "mint" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("mint")}
            >
              Mint
            </a>
            <a
              role="tab"
              className={`tab ${activeTab === "burn" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("burn")}
            >
              Burn
            </a>
            <a
              role="tab"
              className={`tab ${activeTab === "transfer" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("transfer")}
            >
              Transfer
            </a>
          </div>
        </div>
        <div className=" animate-fadeIn p-4 rounded-tl-md rounded-br-md rounded-bl-md bg-base-100 border-r border-b border-l min-h-[17.45rem] max-h-[17.45rem] border-base-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
