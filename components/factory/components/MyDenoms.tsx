import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { DenomImage } from './DenomImage';
import Link from 'next/link';
import { truncateString } from '@/utils';
import { SearchIcon, MintIcon, BurnIcon } from '@/components/icons';
import { DenomInfoModal } from '@/components/factory/modals/denomInfo';
import MintModal from '@/components/factory/modals/MintModal';
import BurnModal from '@/components/factory/modals/BurnModal';
import { UpdateDenomMetadataModal } from '@/components/factory/modals/updateDenomMetadata';
import { PiInfo } from 'react-icons/pi';
import { ExtendedMetadataSDKType, shiftDigits } from '@/utils';
import { MultiMintModal } from '@/components/factory/modals';
import { MultiBurnModal } from '../modals/multiMfxBurnModal';
import { usePoaGetAdmin } from '@/hooks';
export default function MyDenoms({
  denoms,
  isLoading,
  isError,
  refetchDenoms,
  address,
}: {
  denoms: ExtendedMetadataSDKType[];
  isLoading: boolean;
  isError: Error | null | boolean;
  refetchDenoms: () => void;
  address: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [selectedDenom, setSelectedDenom] = useState<ExtendedMetadataSDKType | null>(null);
  const [modalType, setModalType] = useState<
    'mint' | 'burn' | 'multimint' | 'multiburn' | 'update' | null
  >(null);

  const handleDenomSelect = (denom: ExtendedMetadataSDKType) => {
    if (!modalType) {
      // Only show denom info if no other modal is active
      setSelectedDenom(denom);
      setModalType(null); // Ensure no other modal type is set
      const modal = document.getElementById('denom-info-modal') as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
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
          action === 'multiburn'
        ) {
          setModalType(action as 'mint' | 'burn' | 'multimint' | 'multiburn');
        } else {
          // Only show denom info if no other action is specified
          const modal = document.getElementById('denom-info-modal') as HTMLDialogElement;
          if (modal) {
            modal.showModal();
          }
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
    router.push('/factory', undefined, { shallow: true });
  };

  const handleUpdateModal = (denom: ExtendedMetadataSDKType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling up to the row
    setSelectedDenom(denom);
    // Important: Don't show the denom info modal
    setModalType('update'); // Add this new modal type
    const modal = document.getElementById('update-denom-metadata-modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  const handleSwitchToMultiMint = () => {
    setModalType('multimint');
    // Update URL if needed
    router.push(`/factory?denom=${selectedDenom?.base}&action=multimint`, undefined, {
      shallow: true,
    });
  };

  const handleSwitchToMultiBurn = () => {
    setModalType('multiburn'); // Set the modal type to multiburn
    // Update URL if needed
    router.push(`/factory?denom=${selectedDenom?.base}&action=multiburn`, undefined, {
      shallow: true,
    });
  };

  const filteredDenoms = useMemo(() => {
    return denoms.filter(denom => denom?.display.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [denoms, searchQuery]);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="space-y-4 w-full pt-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h1
              className="text-black dark:text-white"
              style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
            >
              My Factory
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a token..."
                className="input input-bordered w-[224px] h-[40px] rounded-[12px] border-none bg:[#0000000A] dark:bg-[#FFFFFF1F] pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/factory/create" passHref>
              <button className="btn btn-gradient w-[224px] h-[52px] text-white rounded-[12px]">
                Create New Token
              </button>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[87vh] w-full">
          <div className="max-w-8xl mx-auto">
            <table className="table w-full border-separate border-spacing-y-3">
              <thead className="sticky top-0 bg-[#F0F0FF] dark:bg-[#0E0A1F]">
                <tr className="text-sm font-medium">
                  <th className="bg-transparent w-1/4 lg:table-cell hidden">Token Symbol</th>
                  <th className="bg-transparent w-2/5 lg:table-cell hidden">Name</th>
                  <th className="bg-transparent w-2/5 md:table-cell hidden">Total Supply</th>
                  <th className="bg-transparent w-1/4">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {isLoading
                  ? Array(12)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={index} aria-label={`skeleton-${index}`}>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-l-[12px] w-1/4 lg:table-cell hidden">
                            <div className="flex items-center space-x-3">
                              <div className="skeleton w-10 h-8 rounded-full shrink-0"></div>
                              <div className="skeleton h-3 w-24"></div>
                            </div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-2/5 md:table-cell hidden">
                            <div className="skeleton h-2 w-24"></div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-2/5">
                            <div className="skeleton h-2 w-32"></div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-r-[12px] w-1/4">
                            <div className="skeleton h-2 w-32"></div>
                          </td>
                        </tr>
                      ))
                  : filteredDenoms.map(denom => (
                      <TokenRow
                        key={denom.base}
                        denom={denom}
                        onSelectDenom={() => handleDenomSelect(denom)}
                        onMint={e => {
                          e.stopPropagation();
                          setSelectedDenom(denom);
                          setModalType('mint');
                        }}
                        onBurn={e => {
                          e.stopPropagation();
                          setSelectedDenom(denom);
                          setModalType('burn');
                        }}
                        onUpdate={e => handleUpdateModal(denom, e)}
                      />
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DenomInfoModal
        denom={selectedDenom}
        modalId="denom-info-modal"
        isOpen={!!selectedDenom && !modalType}
        onClose={handleCloseModal}
      />
      <MintModal
        admin={poaAdmin ?? 'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'}
        isPoaAdminLoading={isPoaAdminLoading}
        denom={selectedDenom}
        address={address}
        refetch={refetchDenoms}
        balance={selectedDenom?.balance ?? '0'}
        totalSupply={selectedDenom?.totalSupply ?? '0'}
        isOpen={modalType === 'mint'}
        onClose={handleCloseModal}
        onSwitchToMultiMint={handleSwitchToMultiMint}
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
      />
      <UpdateDenomMetadataModal
        modalId="update-denom-metadata-modal"
        denom={selectedDenom}
        address={address}
        onSuccess={() => {
          refetchDenoms();
        }}
      />
      <MultiMintModal
        admin={poaAdmin ?? 'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'}
        address={address}
        denom={selectedDenom}
        exponent={selectedDenom?.denom_units[1]?.exponent ?? 0}
        refetch={refetchDenoms}
        isOpen={modalType === 'multimint'}
        onClose={handleCloseModal}
      />
      <MultiBurnModal
        admin={poaAdmin ?? 'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'}
        address={address}
        denom={selectedDenom}
        exponent={selectedDenom?.denom_units[1]?.exponent ?? 0}
        refetch={refetchDenoms}
        isOpen={modalType === 'multiburn'}
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
  onUpdate,
}: {
  denom: ExtendedMetadataSDKType;
  onSelectDenom: () => void;
  onMint: (e: React.MouseEvent) => void;
  onBurn: (e: React.MouseEvent) => void;
  onUpdate: (e: React.MouseEvent) => void;
}) {
  // Add safety checks for the values
  const exponent = denom?.denom_units?.[1]?.exponent ?? 0;
  const totalSupply = denom?.totalSupply ?? '0';
  const balance = denom?.balance ?? '0';

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
      className="hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] dark:bg-[#FFFFFF0F] bg-[#FFFFFF] text-black dark:text-white rounded-lg cursor-pointer"
      onClick={onSelectDenom}
    >
      <td className="rounded-l-[12px] w-1/4 lg:table-cell hidden">
        <div className="flex items-center space-x-3">
          <DenomImage denom={denom} />
          <span className="font-medium">
            {truncateString(denom?.display ?? 'No ticker provided', 24).toUpperCase()}
          </span>
        </div>
      </td>
      <td className="w-2/5 sm:table-cell hidden">
        {truncateString(denom?.name ?? 'No name provided', 20)}
      </td>
      <td className="w-2/5 sm:w-1/4">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="sm:mr-2">{formatAmount(totalSupply)}</span>
          <span className="font-extralight">
            {truncateString(denom?.display ?? 'No ticker provided', 10).toUpperCase()}
          </span>
        </div>
      </td>
      <td className="rounded-r-[12px] w-1/4" onClick={e => e.stopPropagation()}>
        <div className="flex space-x-2">
          <button className="btn btn-sm btn-outline btn-square btn-primary group" onClick={onMint}>
            <MintIcon className="w-5 h-5 text-current group-hover:text-white" />
          </button>

          <button
            disabled={denom.base.includes('umfx')}
            className="btn btn-sm btn-outline btn-square btn-error group"
            onClick={onBurn}
          >
            <BurnIcon className="w-5 h-5 text-current group-hover:text-white" />
          </button>

          <button
            disabled={denom.base.includes('umfx')}
            className="btn btn-sm btn-square btn-outline btn-info group"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onUpdate(e);
            }}
          >
            <PiInfo className="w-5 h-5 text-current group-hover:text-white" />
          </button>
        </div>
      </td>
    </tr>
  );
}
