import { Dialog } from '@headlessui/react';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import BurnForm from '@/components/factory/forms/BurnForm';
import { SignModal } from '@/components/react';
import { useGroupsByAdmin, usePoaGetAdmin } from '@/hooks';
import { ExtendedMetadataSDKType, truncateString } from '@/utils';

export default function BurnModal({
  denom,
  address,
  admin,
  refetch,
  balance,
  totalSupply,
  isOpen,
  onClose,
  isGroup,
}: {
  denom: ExtendedMetadataSDKType | null;
  address: string;
  admin: string;
  refetch: () => void;
  balance: string;
  totalSupply: string;
  isOpen: boolean;
  onClose: () => void;

  isGroup?: boolean;
}) {
  const { groupByAdmin, isGroupByAdminLoading } = useGroupsByAdmin(admin);

  const members = groupByAdmin?.groups?.[0]?.members;
  const isAdmin = members?.some(member => member?.member?.address === address);
  const isLoading = isGroupByAdminLoading;

  if (!denom) return null;

  const modalContent = (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className={`modal modal-open fixed flex p-0 m-0`}
      style={{
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <Dialog.Panel className="modal-box max-w-6xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg">
        <form method="dialog" onSubmit={onClose}>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]">
            ✕
          </button>
        </form>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">
          Burn{' '}
          <span className="font-light text-primary">
            {denom.display
              ? denom.display.startsWith('factory')
                ? (denom.display.split('/').pop()?.toUpperCase() ??
                  truncateString(denom.display, 12).toUpperCase())
                : truncateString(denom.display, 12).toUpperCase()
              : 'UNKNOWN'}
          </span>
        </h3>
        <div className="py-4">
          {isLoading ? (
            <div className="skeleton h-[17rem] max-h-72 w-full"></div>
          ) : (
            <BurnForm
              isAdmin={isAdmin ?? false}
              admin={admin}
              balance={balance}
              totalSupply={totalSupply}
              refetch={refetch}
              address={address}
              denom={denom}
              isGroup={isGroup}
            />
          )}
        </div>
      </Dialog.Panel>

      <SignModal />
    </Dialog>
  );

  // Only render if we're in the browser
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
