import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import BurnForm from '@/components/factory/forms/BurnForm';
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
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const { groupByAdmin, isGroupByAdminLoading } = useGroupsByAdmin(admin);

  const members = groupByAdmin?.groups?.[0]?.members;
  const isAdmin = members?.some(member => member?.member?.address === address);
  const isLoading = isGroupByAdminLoading;

  if (!denom) return null;

  const modalContent = (
    <dialog
      id={`burn-modal-${denom?.base}`}
      className={`modal ${isOpen ? 'modal-open' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        height: '100vh',
        width: '100vw',
        display: isOpen ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="modal-box max-w-6xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg">
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
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
        onSubmit={onClose}
      >
        <button>close</button>
      </form>
    </dialog>
  );

  // Only render if we're in the browser
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
