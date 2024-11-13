import React, { useState } from 'react';

import BurnForm from '@/components/factory/forms/BurnForm';
import { useGroupsByAdmin, usePoaGetAdmin } from '@/hooks';
import { ExtendedMetadataSDKType, truncateString } from '@/utils';

export default function BurnModal({
  denom,
  address,
  refetch,
  balance,
  totalSupply,
  isOpen,
  onClose,
  onSwitchToMultiBurn,
}: {
  denom: ExtendedMetadataSDKType | null;
  address: string;
  refetch: () => void;
  balance: string;
  totalSupply: string;
  isOpen: boolean;
  onClose: () => void;
  onSwitchToMultiBurn: () => void;
}) {
  const { poaAdmin, isPoaAdminLoading } = usePoaGetAdmin();
  const { groupByAdmin, isGroupByAdminLoading } = useGroupsByAdmin(
    poaAdmin ?? 'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'
  );

  const members = groupByAdmin?.groups?.[0]?.members;
  const isAdmin = members?.some(member => member?.member?.address === address);
  const isLoading = isPoaAdminLoading || isGroupByAdminLoading;

  if (!denom) return null;

  const handleMultiBurnOpen = () => {
    onSwitchToMultiBurn();
  };

  return (
    <>
      <dialog id={`burn-modal-${denom?.base}`} className={`modal ${isOpen ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-4xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg">
          <form method="dialog" onSubmit={onClose}>
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]">
              ✕
            </button>
          </form>
          <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">
            Burn{' '}
            <span className="font-light text-primary">
              {denom.display.startsWith('factory')
                ? denom.display.split('/').pop()?.toUpperCase()
                : truncateString(denom.display, 12)}
            </span>
          </h3>
          <div className="py-4">
            {isLoading ? (
              <div className="skeleton h-[17rem] max-h-72 w-full"></div>
            ) : (
              <BurnForm
                isAdmin={isAdmin ?? false}
                admin={poaAdmin ?? ''}
                balance={balance}
                totalSupply={totalSupply}
                refetch={refetch}
                address={address}
                denom={denom}
                onMultiBurnClick={handleMultiBurnOpen}
              />
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
