import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { DenomImage } from './DenomImage';
import { DenomDisplay } from './DenomDisplay';
import Link from 'next/link';
import { truncateString, ExtendedMetadataSDKType, shiftDigits, formatTokenDisplay } from '@/utils';
import { MintIcon, BurnIcon, TransferIcon } from '@/components/icons';
import { DenomInfoModal } from '@/components/factory/modals/denomInfo';
import MintModal from '@/components/factory/modals/MintModal';
import BurnModal from '@/components/factory/modals/BurnModal';
import UpdateDenomMetadataModal from '@/components/factory/modals/updateDenomMetadata';
import { PiInfo } from 'react-icons/pi';
import useIsMobile from '@/hooks/useIsMobile';
import TransferModal from '@/components/factory/modals/TransferModal';

type DenomListProps = {
  denoms: ExtendedMetadataSDKType[];
  isLoading: boolean;
  refetchDenoms: () => void;
  refetchProposals?: () => void;
  address: string;
  pageSize: number;
  isGroup?: boolean;
  admin: string;
  searchTerm?: string;
};

export default function DenomList({
  denoms,
  isLoading,
  refetchDenoms,
  refetchProposals,
  address,
  pageSize,
  isGroup = false,
  admin,
  searchTerm = '',
}: Readonly<DenomListProps>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openUpdateDenomMetadataModal, setOpenUpdateDenomMetadataModal] = useState(false);
  const [openTransferDenomModal, setOpenTransferDenomModal] = useState(false);
  const isMobile = useIsMobile();

  const router = useRouter();
  const [selectedDenom, setSelectedDenom] = useState<ExtendedMetadataSDKType | null>(null);
  const [modalType, setModalType] = useState<
    'mint' | 'burn' | 'multimint' | 'multiburn' | 'update' | 'info' | 'transfer' | null
  >(null);

  const filteredDenoms = useMemo(() => {
    return denoms.filter(denom => denom?.display.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [denoms, searchTerm]);

  const totalPages = Math.ceil(filteredDenoms.length / pageSize);
  const paginatedDenoms = filteredDenoms.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getBaseUrl = () => {
    if (isGroup) {
      return `/groups?policyAddress=${admin}&tab=tokens`;
    }
    return '/factory';
  };

  const updateUrlWithModal = (action: string, denomBase?: string) => {
    const baseUrl = getBaseUrl();
    const query: Record<string, string> = isGroup ? { policyAddress: admin, tab: 'tokens' } : {};

    if (action) query.action = action;
    if (denomBase) query.denom = denomBase;

    router.push(
      {
        pathname: isGroup ? '/groups' : '/factory',
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const handleDenomSelect = (denom: ExtendedMetadataSDKType) => {
    if (!modalType) {
      setSelectedDenom(denom);
      setModalType('info');
      updateUrlWithModal('info', denom.base);
    }
  };

  const refetch = () => {
    refetchDenoms();
    if (refetchProposals) {
      refetchProposals();
    }
  };

  useEffect(() => {
    const { denom, action } = router.query;
    if (denom && typeof denom === 'string') {
      const decodedDenom = decodeURIComponent(denom);
      const metadata = denoms.find(d => d.base === decodedDenom);
      if (metadata) {
        setSelectedDenom(metadata);
        if (
          action === 'mint' ||
          action === 'burn' ||
          action === 'multimint' ||
          action === 'multiburn' ||
          action === 'update' ||
          action === 'transfer' ||
          action === 'info'
        ) {
          setModalType(
            action as 'mint' | 'burn' | 'multimint' | 'multiburn' | 'update' | 'info' | 'transfer'
          );
          if (action === 'update') {
            setOpenUpdateDenomMetadataModal(true);
          }
          if (action === 'transfer') {
            setOpenTransferDenomModal(true);
          }
        } else {
          setModalType('info');
        }
      }
    } else {
      setSelectedDenom(null);
      setModalType(null);
    }
  }, [router.query, denoms]);

  const handleCloseModal = () => {
    setSelectedDenom(null);
    setModalType(null);
    setOpenUpdateDenomMetadataModal(false);
    setOpenTransferDenomModal(false);
    updateUrlWithModal('');
  };

  const handleUpdateModalClose = () => {
    setSelectedDenom(null);
    setOpenUpdateDenomMetadataModal(false);
    setOpenTransferDenomModal(false);
    setModalType(null);
    updateUrlWithModal('');
  };

  const handleUpdateModal = (denom: ExtendedMetadataSDKType) => {
    setSelectedDenom(denom);
    setOpenUpdateDenomMetadataModal(true);
    updateUrlWithModal('update', denom.base);
  };

  const handleTransferModal = (denom: ExtendedMetadataSDKType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDenom(denom);
    setModalType('transfer');
    setOpenTransferDenomModal(true);
    updateUrlWithModal('transfer', denom.base);
  };

  const handleModalClose = () => {
    setSelectedDenom(null);
    setModalType(null);
    // Remove modal type from URL
    router.push(
      {
        pathname: isGroup ? '/groups' : '/factory',
        query: isGroup ? { policyAddress: admin, tab: 'tokens' } : undefined,
      },
      undefined,
      { shallow: true }
    );
  };

  const handleMint = (denom: ExtendedMetadataSDKType, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDenom(denom);
    setModalType('mint');
    updateUrlWithModal('mint', denom.base);
  };

  const handleBurn = (denom: ExtendedMetadataSDKType, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDenom(denom);
    setModalType('burn');
    updateUrlWithModal('burn', denom.base);
  };

  const handleUpdate = (denom: ExtendedMetadataSDKType) => {
    setSelectedDenom(denom);
    setOpenUpdateDenomMetadataModal(true);
    updateUrlWithModal('update', denom.base);
  };

  return (
    <div className="w-full mx-auto rounded-[24px] h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-4">
        <div className="overflow-auto">
          <div className="max-w-8xl mx-auto">
            <table className="table w-full border-separate border-spacing-y-3">
              <thead className="sticky top-0 bg-[#F0F0FF] dark:bg-[#0E0A1F]">
                <tr className="text-sm font-medium">
                  <th className="bg-transparent w-1/4">Token</th>
                  <th className="bg-transparent w-2/5 xl:table-cell hidden">Name</th>
                  <th className="bg-transparent w-2/5  md:table-cell hidden">Total Supply</th>
                  <th className="bg-transparent w-1/4">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {isLoading
                  ? Array(isMobile ? 5 : 8)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={index}>
                          <td className="bg-secondary rounded-l-[12px] w-1/4">
                            <div className="flex items-center space-x-3">
                              <div
                                className="skeleton w-10 h-10 rounded-full shrink-0"
                                aria-label={`skeleton-${index}-avatar`}
                              />
                              <div>
                                <div
                                  className="skeleton h-4 w-20 mb-1"
                                  aria-label={`skeleton-${index}-ticker`}
                                />
                                <div
                                  className="skeleton h-3 w-16 xxs:max-xs:hidden"
                                  aria-label={`skeleton-${index}-symbol`}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="bg-secondary w-2/5 xl:table-cell hidden">
                            <div
                              className="skeleton h-4 w-32"
                              aria-label={`skeleton-${index}-name`}
                            />
                          </td>
                          <td className="bg-secondary w-2/5 md:table-cell hidden">
                            <div
                              className="skeleton h-4 w-28"
                              aria-label={`skeleton-${index}-supply`}
                            />
                          </td>
                          <td className="bg-secondary rounded-r-[12px] w-1/4">
                            <div className="flex space-x-2">
                              <button
                                className="btn btn-md btn-outline btn-square btn-primary"
                                disabled
                              >
                                <MintIcon className="w-7 h-7 text-current opacity-50" />
                              </button>
                              <button
                                className="btn btn-md btn-outline btn-square btn-primary"
                                disabled
                              >
                                <BurnIcon className="w-7 h-7 text-current opacity-50" />
                              </button>
                              <button
                                className="btn btn-md btn-outline btn-square btn-info"
                                disabled
                              >
                                <TransferIcon className="w-7 h-7 text-current opacity-50" />
                              </button>
                              <button
                                className="btn btn-md btn-outline btn-square btn-info"
                                disabled
                              >
                                <PiInfo className="w-7 h-7 text-current opacity-50" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  : paginatedDenoms.map(denom => (
                      <TokenRow
                        key={denom.base}
                        denom={denom}
                        onSelectDenom={() => handleDenomSelect(denom)}
                        onMint={e => handleMint(denom, e)}
                        onBurn={e => handleBurn(denom, e)}
                        onTransfer={e => handleTransferModal(denom, e)}
                        onUpdate={() => handleUpdate(denom)}
                      />
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Link
          href={
            isGroup
              ? `/factory/create?isGroup=${isGroup}&groupPolicyAddress=${admin}`
              : '/factory/create'
          }
          passHref
        >
          <button className="btn btn-gradient w-[224px] h-[52px] hidden md:block text-white rounded-[12px] focus:outline-none focus-visible:ring-1 focus-visible:ring-primary">
            Create New Token
          </button>
        </Link>
        {totalPages > 1 && (
          <div
            className="flex items-center justify-center gap-2"
            onClick={e => e.stopPropagation()}
            role="navigation"
            aria-label="Pagination"
          >
            <button
              onClick={e => {
                e.stopPropagation();
                setCurrentPage(prev => Math.max(1, prev - 1));
              }}
              disabled={currentPage === 1 || isLoading}
              className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              ‹
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={e => {
                      e.stopPropagation();
                      setCurrentPage(pageNum);
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-black dark:text-white 
                          ${currentPage === pageNum ? 'bg-[#0000001A] dark:bg-[#FFFFFF1A]' : 'hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A]'}`}
                    aria-label={`Page ${pageNum}`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return (
                  <span key={pageNum} aria-hidden="true">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={e => {
                e.stopPropagation();
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
              }}
              disabled={currentPage === totalPages || isLoading}
              className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}
      </div>
      <div className="mt-6  w-full justify-center md:hidden block">
        <Link
          href={
            isGroup
              ? `/factory/create?isGroup=${isGroup}&groupPolicyAddress=${admin}`
              : '/factory/create'
          }
          passHref
        >
          <button className="btn btn-gradient w-full h-[52px] text-white rounded-[12px]">
            Create New Token
          </button>
        </Link>
      </div>

      <DenomInfoModal
        openDenomInfoModal={modalType === 'info'}
        setOpenDenomInfoModal={open => {
          if (!open) {
            refetch();
            handleCloseModal();
          }
        }}
        denom={selectedDenom}
        modalId="denom-info-modal"
      />
      <MintModal
        admin={admin}
        denom={modalType === 'mint' ? selectedDenom : null}
        address={address}
        refetch={refetch}
        balance={selectedDenom?.balance ?? '0'}
        totalSupply={selectedDenom?.totalSupply ?? '0'}
        isOpen={modalType === 'mint'}
        onClose={handleCloseModal}
        isGroup={isGroup}
      />
      <BurnModal
        admin={admin}
        denom={selectedDenom}
        address={address}
        refetch={refetch}
        balance={selectedDenom?.balance ?? '0'}
        totalSupply={selectedDenom?.totalSupply ?? '0'}
        isOpen={modalType === 'burn'}
        onClose={handleCloseModal}
        isGroup={isGroup}
      />
      <UpdateDenomMetadataModal
        isOpen={openUpdateDenomMetadataModal}
        onClose={handleUpdateModalClose}
        denom={selectedDenom}
        address={address}
        modalId="update-denom-metadata-modal"
        onSuccess={refetchDenoms}
        admin={admin}
        isGroup={isGroup}
      />
      <TransferModal
        denom={selectedDenom}
        address={address}
        isOpen={modalType === 'transfer'}
        onClose={handleModalClose}
        onSuccess={() => {
          refetch();
          handleModalClose();
        }}
        admin={admin}
        isGroup={isGroup}
      />
    </div>
  );
}

function TokenRow({
  denom,
  onSelectDenom,
  onMint,
  onBurn,
  onTransfer,
  onUpdate,
}: {
  denom: ExtendedMetadataSDKType;
  onSelectDenom: () => void;
  onMint: (e: React.MouseEvent) => void;
  onBurn: (e: React.MouseEvent) => void;
  onTransfer: (e: React.MouseEvent) => void;
  onUpdate: () => void;
}) {
  // Add safety checks for the values
  const exponent = denom?.denom_units?.[1]?.exponent ?? 0;
  const totalSupply = denom?.totalSupply ?? '0';

  // Format numbers safely
  const formatAmount = (amount: string) => {
    try {
      return Number(shiftDigits(amount, -exponent)).toLocaleString(undefined, {
        maximumFractionDigits: exponent,
      });
    } catch (error) {
      console.warn('Error formatting amount:', error);
      return '0';
    }
  };

  return (
    <tr
      className="group text-black dark:text-white rounded-lg cursor-pointer transition-colors"
      onClick={onSelectDenom}
    >
      <td className="bg-secondary group-hover:bg-base-300 rounded-l-[12px] w-1/4">
        <div className="flex items-center space-x-3">
          <DenomDisplay metadata={denom} />
        </div>
      </td>
      <td className="bg-secondary group-hover:bg-base-300 w-2/5 xl:table-cell hidden">
        {truncateString(denom?.name ?? 'No name provided', 20)}
      </td>
      <td className="bg-secondary group-hover:bg-base-300 w-2/5 md:table-cell hidden sm:w-1/4">
        <div className="flex flex-col sm:flex-row sm:items-center ">
          <span className="sm:mr-2">{formatAmount(totalSupply)}</span>
          <span className="font-extralight">{formatTokenDisplay(denom.display)}</span>
        </div>
      </td>
      <td
        className="bg-secondary group-hover:bg-base-300 rounded-r-[12px] w-1/4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex space-x-2">
          <button
            className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-none"
            onClick={onMint}
          >
            <MintIcon className="w-7 h-7 text-current" />
          </button>

          <button
            disabled={denom.base.includes('umfx')}
            className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-none"
            onClick={onBurn}
          >
            <BurnIcon className="w-7 h-7 text-current" />
          </button>

          <button
            disabled={denom.base.includes('umfx')}
            className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-none"
            onClick={onTransfer}
          >
            <TransferIcon className="w-7 h-7 text-current" />
          </button>

          <button
            disabled={denom.base.includes('umfx')}
            className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-none"
            onClick={onUpdate}
          >
            <PiInfo className="w-7 h-7 text-current" />
          </button>
        </div>
      </td>
    </tr>
  );
}
