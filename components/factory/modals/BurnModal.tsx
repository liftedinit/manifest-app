import React from 'react';

import BurnForm from '@/components/factory/forms/BurnForm';
import { SigningModalDialog } from '@/components/react';
import { useGroupsByAdmin } from '@/hooks';
import { ExtendedMetadataSDKType, truncateString } from '@/utils';

export default function BurnModal({
  denom,
  address,
  admin,
  balance,
  totalSupply,
  isOpen,
  onClose,
  isGroup,
  refetch,
}: {
  denom: ExtendedMetadataSDKType | null;
  address: string;
  admin: string;
  balance: string;
  totalSupply: string;
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
  isGroup?: boolean;
}) {
  const { groupByAdmin, isGroupByAdminLoading } = useGroupsByAdmin(admin);
  if (!denom) return null;

  const members = groupByAdmin?.groups?.[0]?.members;
  const isAdmin = members?.some(member => member?.member?.address === address);
  const isLoading = isGroupByAdminLoading;

  const tokenName = denom.display
    ? denom.display.startsWith('factory')
      ? (denom.display.split('/').pop()?.toUpperCase() ??
        truncateString(denom.display, 12).toUpperCase())
      : truncateString(denom.display, 12).toUpperCase()
    : 'UNKNOWN';

  return (
    <SigningModalDialog
      open={isOpen}
      onClose={onClose}
      title={
        <>
          Burn <span className="font-light text-primary">{tokenName}</span>
        </>
      }
    >
      <div className="py-4">
        {isLoading ? (
          <div className="skeleton h-[17rem] max-h-72 w-full"></div>
        ) : (
          <BurnForm
            isAdmin={isAdmin ?? false}
            admin={admin}
            balance={balance}
            totalSupply={totalSupply}
            address={address}
            denom={denom}
            isGroup={isGroup}
            refetch={refetch}
          />
        )}
      </div>
    </SigningModalDialog>
  );
}
