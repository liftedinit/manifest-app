import { useState } from "react";
import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";
import MintForm from "@/components/factory/forms/MintForm";
import BurnForm from "@/components/factory/forms/BurnForm";
import TransferForm from "@/components/factory/forms/TransferForm";
import { usePoaParams } from "@/hooks";

export default function MetaBox({
  denom,
  address,
  refetch,
  balance,
}: {
  denom: MetadataSDKType | null;
  address: string;
  refetch: () => void;
  balance: string;
}) {
  const { poaParams } = usePoaParams();
  const [activeTab, setActiveTab] = useState<"transfer" | "burn" | "mint">(
    "mint"
  );
  const admin = poaParams?.admins[0];

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
    <div className="flex flex-col gap-2 rounded-md max-h-[23rem] min-h-[23rem] bg-base-100 shadow w-full p-4 animate-fadeIn">
      <div className="px-4 flex flex-row justify-between items-center border-base-content">
        <h2 className="text-xl font-semibold">
          {`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ${
            denom.display
          }`}
        </h2>
        <div
          role="tablist"
          className="tabs tabs-lifted tabs-md -mr-4 items-end"
        >
          {[
            ...(denom.base.includes("mfx") ? [] : ["transfer"]),
            "burn",
            "mint",
          ].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              className={`tab [--tab-bg:#edf2f7] dark:[--tab-bg:#202020] [--tab-border-color:transparent] ${
                activeTab === tab ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab(tab as "transfer" | "burn" | "mint")}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div
        className={`animate-fadeIn p-4 -mt-2 rounded-tl-md rounded-br-md rounded-bl-md ${
          activeTab != "mint" ? "rounded-tr-md" : ""
        }  min-h-[19rem] max-h-[19rem] border-base-300 bg-base-300 `}
      >
        {!denom.base.includes("mfx") && activeTab === "transfer" && (
          <TransferForm
            balance={balance}
            refetch={refetch}
            address={address}
            denom={denom}
          />
        )}
        {activeTab === "burn" && (
          <BurnForm
            admin={admin ?? ""}
            balance={balance}
            refetch={refetch}
            address={address}
            denom={denom}
          />
        )}
        {activeTab === "mint" && (
          <MintForm
            admin={admin ?? ""}
            balance={balance}
            refetch={refetch}
            address={address}
            denom={denom}
          />
        )}
      </div>
    </div>
  );
}
