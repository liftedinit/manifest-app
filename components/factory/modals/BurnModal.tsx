import React from 'react';
import { MetadataSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import BurnForm from '@/components/factory/forms/BurnForm';
import { useGroupsByAdmin, usePoaGetAdmin } from '@/hooks';

export default function BurnModal({
  denom,
  address,
  refetch,
  balance,
  isOpen,
  onClose,
}: {
  denom: MetadataSDKType | null;
  address: string;
  refetch: () => void;
  balance: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { poaAdmin, isPoaAdminLoading } = usePoaGetAdmin();
  const { groupByAdmin, isGroupByAdminLoading } = useGroupsByAdmin(
    poaAdmin ?? 'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'
  );

  const members = groupByAdmin?.groups?.[0]?.members;
  const isAdmin = members?.some(member => member?.member?.address === address);
  const isLoading = isPoaAdminLoading || isGroupByAdminLoading;

  if (!denom) return null;

  return (
    <dialog id={`burn-modal-${denom.base}`} className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-4xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg">
        <form method="dialog" onSubmit={onClose}>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]">
            ✕
          </button>
        </form>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">
          Burn {denom.display}
        </h3>
        <div className="">
          {isLoading ? (
            <div className="w-full h-full flex flex-col">
              <div className="skeleton h-[17rem] max-h-72 w-full"></div>
            </div>
          ) : (
            <BurnForm
              isAdmin={isAdmin ?? false}
              admin={poaAdmin ?? ''}
              balance={balance}
              refetch={refetch}
              address={address}
              denom={denom}
            />
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
