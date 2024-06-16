import {
  ExtendedQueryGroupsByMemberResponseSDKType,
  useBalance,
  useTokenFactoryBalance,
} from "@/hooks/useQueries";
import { GroupDetailsModal } from "@/components/groups";
import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import Link from "next/link";
import { shiftDigits, truncateString } from "@/utils";
import { Key, useEffect, useState } from "react";
import { PiArrowUpRightLight } from "react-icons/pi";
import { UpdateGroupModal } from "@/components/groups";
import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";

export default function DenomInfo({
  denom,
  address,
  refetchDenoms,
}: {
  denom: MetadataSDKType | null;
  address: string;
  refetchDenoms: () => void;
}) {
  const { balance } = useTokenFactoryBalance(address, denom?.base ?? "");
  console.log(balance);

  const DenomConversion = ({ denom }: { denom: MetadataSDKType }) => {
    if (!denom || !denom.denom_units || denom.denom_units.length === 0) {
      return null;
    }

    const displayUnit = denom.display;
    const baseUnit = denom.denom_units[0].denom.split("/").pop();
    const conversionFactor = 10 ** denom.denom_units[1].exponent;

    return (
      <div className="text-md">
        1&nbsp;{displayUnit}&nbsp;=&nbsp;{conversionFactor.toLocaleString()}
        &nbsp;{baseUnit?.toUpperCase()}
      </div>
    );
  };
  const baseUnit = denom?.denom_units[0].denom.split("/").pop();
  return (
    <div className="flex flex-col max-h-[23rem] relative shadow  min-h-[23rem] rounded-md bg-base-100  w-full p-4">
      <div className="w-full  rounded-md ">
        <div className="px-4 py-2 justify-between items-center border-base-content">
          <div className="flex flex-row w-full justify-between items-center">
            <h3 className="text-lg font-bold leading-6">Metadata</h3>
            <button
              onClick={() => {
                const modal = document.getElementById(
                  `update_metadata_${denom?.base}`
                ) as HTMLDialogElement;
                modal?.showModal();
              }}
              className="btn-xs btn btn-primary "
            >
              Update
            </button>
          </div>
          <div className="divider divider-horizon -mt-0"></div>
        </div>
        {!denom && (
          <div className="p-4 py-24 -mt-4 underline  text-center">
            <p>No Denom Selected</p>
          </div>
        )}
        {denom && (
          <div className="flex flex-col">
            <div className="flex flex-col  gap-3 justify-left px-4 mb-2 -mt-4 rounded-md   items-left">
              <span className="text-sm leading-3 capitalize text-gray-400">
                TICKER
              </span>
              <span className="text-xl leading-3 ">
                {denom?.display ?? "No Ticker available"}
              </span>
            </div>

            <div className="flex  gap-4 px-4   flex-row   py-4 rounded-md  ">
              <div className="flex flex-col   w-1/2 ">
                <div className="flex flex-col gap-2 bg-base-300 p-4 rounded-md  justify-left mb-6 items-left">
                  <span className="text-sm  capitalize text-gray-400 truncate">
                    BASE DENOM
                  </span>
                  <TruncatedAddressWithCopy address={denom.base} slice={14} />
                </div>

                <div className="flex flex-col gap-2 bg-base-300 p-4 rounded-md  justify-left items-left">
                  <span className="text-sm  capitalize text-gray-400 md:block hidden">
                    YOUR BALANCE
                  </span>
                  <span className="text-sm  capitalize text-gray-400 block md:hidden">
                    BALANCE
                  </span>
                  <div className="flex flex-row gap-1 items-center justify-start truncate">
                    <span className="text-md ">
                      {shiftDigits(
                        balance?.amount ?? "",
                        -Number(denom?.denom_units[1].exponent)
                      )}
                      &nbsp;
                      {baseUnit?.toUpperCase().slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col   w-1/2 ">
                <div className="flex flex-col bg-base-300 p-4 rounded-md  gap-2 justify-left mb-6 items-left">
                  <span className="text-sm  capitalize text-gray-400 truncate">
                    EXPONENT
                  </span>

                  <DenomConversion denom={denom} />
                </div>
                <div className="flex flex-col bg-base-300 p-4 rounded-md  gap-2 justify-left items-left">
                  <span className="text-sm  capitalize text-gray-400">
                    THRESHOLD
                  </span>
                  <div className="flex flex-row justify-between items-start">
                    {denom?.uri ?? "No Description"}
                    <div className="flex-row  justify-between items-center gap-2 hidden md:flex">
                      <button
                        className="btn btn-xs btn-secondary "
                        onClick={() => {
                          const modal = document.getElementById(
                            `group_modal_${denom.base}`
                          ) as HTMLDialogElement;
                          modal?.showModal();
                        }}
                      >
                        more info <PiArrowUpRightLight />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
