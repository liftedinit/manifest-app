import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { DenomImage } from './DenomImage';
import Link from 'next/link';
import { truncateString, ExtendedMetadataSDKType, shiftDigits, formatTokenDisplay } from '@/utils';
import {
  SearchIcon,
  MintIcon,
  BurnIcon,
  TransferIcon,
  FactoryIcon,
  GithubIcon,
} from '@/components/icons';
import { DenomInfoModal } from '@/components/factory/modals/denomInfo';
import MintModal from '@/components/factory/modals/MintModal';
import BurnModal from '@/components/factory/modals/BurnModal';
import { UpdateDenomMetadataModal } from '@/components/factory/modals/updateDenomMetadata';
import { PiCaretDownBold, PiInfo } from 'react-icons/pi';
import { ExtendedGroupType, usePoaGetAdmin } from '@/hooks';
import useIsMobile from '@/hooks/useIsMobile';
import TransferModal from '@/components/factory/modals/TransferModal';

export default function MyDenoms({
  groups,
  setSelectedAddress,
  selectedAddress,
  denoms,
  isLoading,
  refetchDenoms,
  address,
  isDataReady,
  isError,
}: {
  groups: ExtendedGroupType[];
  setSelectedAddress: (address: string) => void;
  selectedAddress: string;
  denoms: ExtendedMetadataSDKType[];
  isLoading: boolean;
  refetchDenoms: () => void;
  address: string;
  isDataReady: boolean;
  isError: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openUpdateDenomMetadataModal, setOpenUpdateDenomMetadataModal] = useState(false);
  const [openTransferDenomModal, setOpenTransferDenomModal] = useState(false);
  const isMobile = useIsMobile();

  const pageSize = isMobile ? 5 : 8;

  const router = useRouter();
  const [selectedDenom, setSelectedDenom] = useState<ExtendedMetadataSDKType | null>(null);
  const [modalType, setModalType] = useState<
    'mint' | 'burn' | 'multimint' | 'multiburn' | 'update' | 'info' | 'transfer' | null
  >(null);

  const filteredDenoms = useMemo(() => {
    return denoms.filter(denom => denom?.display.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [denoms, searchQuery]);

  const totalPages = Math.ceil(filteredDenoms.length / pageSize);
  const paginatedDenoms = filteredDenoms.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDenomSelect = (denom: ExtendedMetadataSDKType) => {
    if (!modalType) {
      setSelectedDenom(denom);
      setModalType('info');
      router.push(`/factory?denom=${denom.base}&action=info`, undefined, { shallow: true });
    }
  };

  const { poaAdmin, isPoaAdminLoading } = usePoaGetAdmin();

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
    router.push('/factory', undefined, { shallow: true });
  };

  const handleUpdateModalClose = () => {
    setSelectedDenom(null);
    setOpenUpdateDenomMetadataModal(false);
    setOpenTransferDenomModal(false);
    setModalType(null);
    router.push('/factory', undefined, { shallow: true });
  };

  const handleUpdateModal = (denom: ExtendedMetadataSDKType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDenom(denom);
    setModalType('update');
    setOpenUpdateDenomMetadataModal(true);
    router.push(`/factory?denom=${denom.base}&action=update`, undefined, { shallow: true });
  };

  const handleTransferModal = (denom: ExtendedMetadataSDKType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDenom(denom);
    setModalType('transfer');
    setOpenTransferDenomModal(true);
    router.push(`/factory?denom=${denom.base}&action=transfer`, undefined, { shallow: true });
  };

  const handleSwitchToMultiMint = () => {
    setModalType('multimint');
    router.push(`/factory?denom=${selectedDenom?.base}&action=multimint`, undefined, {
      shallow: true,
    });
  };

  const handleSwitchToMultiBurn = () => {
    setModalType('multiburn');
    router.push(`/factory?denom=${selectedDenom?.base}&action=multiburn`, undefined, {
      shallow: true,
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="h-full flex flex-col p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            <h1
              className="text-secondary-content"
              style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
            >
              My Factory
            </h1>
            <div className="relative w-full sm:w-[224px]">
              <input
                type="text"
                placeholder="Search for a token..."
                className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-secondary text-secondary-content pl-10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="dropdown dropdown-end h-full">
              <label
                aria-label="group-selector"
                tabIndex={0}
                className="btn btn-md h-full px-3 bg-[#FFFFFF] dark:bg-[#FFFFFF0F] border-none hover:bg-transparent"
              >
                {selectedAddress ? (
                  <div className="flex items-center gap-2">
                    {selectedAddress === address
                      ? 'My Address'
                      : groups.find(group =>
                          group.policies.some(policy => policy.address === selectedAddress)
                        )?.ipfsMetadata?.title ||
                        `Untitled Group ${
                          groups.find(group =>
                            group.policies.some(policy => policy.address === selectedAddress)
                          )?.id
                        }`}
                  </div>
                ) : (
                  'Select Address'
                )}
                <PiCaretDownBold className="ml-1" />
              </label>
              <ul
                tabIndex={0}
                role="listbox"
                aria-label="Address selection"
                className="dropdown-content z-20 p-2 shadow bg-base-300 rounded-lg w-full mt-1 max-h-72 min-w-44 overflow-y-auto dark:text-[#FFFFFF] text-[#161616]"
              >
                <li
                  className="hover:bg-[#E0E0FF33] dark:hover:bg-[#FFFFFF0F] cursor-pointer rounded-lg"
                  aria-label="My Address"
                >
                  <a
                    className="flex flex-row items-center gap-2 px-2 py-2"
                    onClick={() => setSelectedAddress(address)}
                  >
                    <span className="truncate">My Address</span>
                  </a>
                </li>

                <div className="divider my-1"></div>

                {groups.map(group => (
                  <li
                    key={Number(group.id)}
                    className="hover:bg-[#E0E0FF33] dark:hover:bg-[#FFFFFF0F] cursor-pointer rounded-lg"
                    aria-label={group.ipfsMetadata?.title}
                  >
                    {group.policies.map(policy => (
                      <a
                        key={policy.address}
                        className="flex flex-row items-center gap-2 px-2 py-2"
                        onClick={() => setSelectedAddress(policy.address)}
                      >
                        <span className="truncate">
                          {group.ipfsMetadata?.title || `Untitled Group ${group.id}`}
                        </span>
                      </a>
                    ))}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden md:block">
              <Link href="/factory/create" passHref>
                <button className="btn btn-gradient w-[224px] h-[52px] text-white rounded-[12px] focus:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                  Create New Token
                </button>
              </Link>
            </div>
          </div>
        </div>
        {isError && !isLoading ? (
          <section className="transition-opacity duration-300 h-[80vh] ease-in-out animate-fadeIn w-full flex items-center justify-center">
            <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
                  Error loading tokens!
                </h1>
                <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                  Please refresh the page and check the logs! Use the button to create an issue on
                  Github.
                </p>
                <div className="w-[50%]">
                  <Link
                    href="https://github.com/liftedinit/manifest-app/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn w-full border-0 duration-300 ease-in-out text-white btn-gradient"
                  >
                    <GithubIcon className="w-5 h-5 mr-2 hidden md:block" />
                    Open an issue
                  </Link>
                </div>
              </div>
              <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
                <FactoryIcon className="h-60 w-60 text-primary" />
              </div>
            </div>
          </section>
        ) : !isDataReady && !isLoading ? (
          <section className="transition-opacity duration-300 h-[80vh] ease-in-out animate-fadeIn w-full flex items-center justify-center">
            <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
                  No factory tokens!
                </h1>
                <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                  Click the button to create your own token!
                </p>
                <div className="w-[50%]">
                  <Link
                    href="/factory/create"
                    className="btn w-full border-0 duration-300 ease-in-out text-white btn-gradient"
                  >
                    <FactoryIcon className="w-5 h-5 mr-2 hidden md:block" />
                    Create a token
                  </Link>
                </div>
              </div>
              <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
                <FactoryIcon className="h-60 w-60 text-primary" />
              </div>
            </div>
          </section>
        ) : (
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
                                  className="btn btn-md btn-outline btn-square btn-primary"
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
                          onMint={e => {
                            e.stopPropagation();
                            setSelectedDenom(denom);
                            setModalType('mint');
                            router.push(`/factory?denom=${denom.base}&action=mint`, undefined, {
                              shallow: true,
                            });
                          }}
                          onBurn={e => {
                            e.stopPropagation();
                            setSelectedDenom(denom);
                            setModalType('burn');
                            router.push(`/factory?denom=${denom.base}&action=burn`, undefined, {
                              shallow: true,
                            });
                          }}
                          onTransfer={e => handleTransferModal(denom, e)}
                          onUpdate={e => handleUpdateModal(denom, e)}
                        />
                      ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-center gap-2 "
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
            <div className="block md:hidden mt-8">
              <Link href="/factory/create" passHref>
                <button className="btn btn-gradient w-full h-[52px] text-white rounded-[12px]">
                  Create New Token
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <DenomInfoModal
        openDenomInfoModal={modalType === 'info'}
        setOpenDenomInfoModal={open => {
          if (!open) {
            handleCloseModal();
          }
        }}
        denom={selectedDenom}
        modalId="denom-info-modal"
      />
      <MintModal
        admin={poaAdmin ?? 'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'}
        isPoaAdminLoading={isPoaAdminLoading}
        denom={modalType === 'mint' ? selectedDenom : null}
        address={address}
        refetch={refetchDenoms}
        balance={selectedDenom?.balance ?? '0'}
        totalSupply={selectedDenom?.totalSupply ?? '0'}
        isOpen={modalType === 'mint'}
        onClose={handleCloseModal}
        onSwitchToMultiMint={handleSwitchToMultiMint}
        isGroup={selectedAddress !== address}
      />
      <BurnModal
        denom={selectedDenom}
        address={address}
        refetch={refetchDenoms}
        balance={selectedDenom?.balance ?? '0'}
        totalSupply={selectedDenom?.totalSupply ?? '0'}
        isOpen={modalType === 'burn'}
        onClose={handleCloseModal}
        onSwitchToMultiBurn={handleSwitchToMultiBurn}
        isGroup={selectedAddress !== address}
      />
      <UpdateDenomMetadataModal
        modalId="update-denom-metadata-modal"
        isGroup={selectedAddress !== address}
        denom={selectedDenom}
        address={address}
        onSuccess={() => {
          refetchDenoms();
          handleUpdateModalClose();
        }}
        openUpdateDenomMetadataModal={openUpdateDenomMetadataModal}
        setOpenUpdateDenomMetadataModal={open => {
          if (!open) {
            handleUpdateModalClose();
          } else {
            setOpenUpdateDenomMetadataModal(true);
          }
        }}
      />
      <TransferModal
        modalId="transfer-denom-modal"
        isGroup={selectedAddress !== address}
        openTransferDenomModal={openTransferDenomModal}
        setOpenTransferDenomModal={open => {
          if (!open) {
            handleCloseModal();
          } else {
            setOpenTransferDenomModal(true);
          }
        }}
        onSuccess={() => {
          refetchDenoms();
          handleUpdateModalClose();
        }}
        denom={selectedDenom}
        address={address}
        isOpen={modalType === 'transfer'}
        onClose={handleCloseModal}
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
  onUpdate: (e: React.MouseEvent) => void;
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
          <DenomImage denom={denom} />
          <span className="font-medium sm:block hidden">{formatTokenDisplay(denom.display)}</span>
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
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onUpdate(e);
            }}
          >
            <PiInfo className="w-7 h-7 text-current" />
          </button>
        </div>
      </td>
    </tr>
  );
}
