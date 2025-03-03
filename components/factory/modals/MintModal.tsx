import React from 'react';

import MintForm from '@/components/factory/forms/MintForm';
import { SigningModalDialog } from '@/components/react/modalDialog';
import { useGroupsByAdmin } from '@/hooks';
import { ExtendedMetadataSDKType, truncateString } from '@/utils';

export default function MintModal({
  denom,
  address,
  totalSupply,
  isOpen,
  onClose,
  admin,
  isGroup,
  refetch,
}: {
  denom: ExtendedMetadataSDKType | null;
  address: string;
  totalSupply: string;
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
  admin: string;
  isGroup?: boolean;
}) {
  const { groupByAdmin, isGroupByAdminLoading } = useGroupsByAdmin(admin);
  if (!denom) return null;

  const members = groupByAdmin?.groups?.[0]?.members;
  const isAdmin = members?.some(member => member?.member?.address === address);
  const isLoading = isGroupByAdminLoading;

  const safeTotalSupply = totalSupply || '0';

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
      style={{
        height: '100vh',
        width: '100vw',
      }}
      title={
        <>
          Mint <span className="font-light text-primary">{tokenName}</span>
        </>
      }
    >
      <div className="py-4">
        {isLoading ? (
          <div className="skeleton h-[17rem] max-h-72 w-full"></div>
        ) : (
          <MintForm
            isAdmin={isAdmin ?? false}
            totalSupply={safeTotalSupply}
            address={address}
            denom={denom}
            isGroup={isGroup}
            admin={admin}
            refetch={() => refetch()}
          />
        )}
      </div>
    </SigningModalDialog>
  );
}
