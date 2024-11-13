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
    e.stopPropagation();
    setSelectedDenom(denom);
    // Important: Don't show the denom info modal
    setModalType('update');
    const modal = document.getElementById('update-denom-metadata-modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  const handleSwitchToMultiMint = () => {
    setModalType('multimint');
    // Update URL
    router.push(`/factory?denom=${selectedDenom?.base}&action=multimint`, undefined, {
      shallow: true,
    });
  };

  const handleSwitchToMultiBurn = () => {
    setModalType('multiburn'); // Set the modal type to multiburn
    // Update URL
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center -mb-4 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            <h1
              className="text-black dark:text-white"
              style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
            >
              My Factory
            </h1>
            <div className="relative w-full sm:w-[224px]">
              <input
                type="text"
                placeholder="Search for a token..."
                className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-[#0000000A] dark:bg-[#FFFFFF1F] pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/factory/create" passHref className="hidden md:block">
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
                  <th className="bg-transparent w-1/4">Token</th>
                  <th className="bg-transparent w-1/4 xl:table-cell hidden">Symbol</th>
                  <th className="bg-transparent w-2/4 sm:w-1/4 lg:table-cell hidden">
                    Total Supply
                  </th>
                  <th className="bg-transparent w-2/4 sm:w-1/4 md:table-cell hidden">
                    Your Balance
                  </th>
                  <th className="bg-transparent w-1/4">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {isLoading
                  ? Array(10)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={index}>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-l-[12px] w-1/4">
                            <div className="flex items-center space-x-3">
                              <div className="skeleton w-10 h-8 rounded-full shrink-0"></div>
                              <div className="skeleton h-3 w-24"></div>
                            </div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-1/4 xl:table-cell hidden">
                            <div className="skeleton h-2 w-8"></div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-2/4 sm:w-1/4 lg:table-cell hidden">
                            <div className="skeleton h-2 w-24"></div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-2/4 sm:w-1/4 md:table-cell hidden">
                            <div className="skeleton h-2 w-32"></div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-r-[12px] w-1/4">
                            <div className="skeleton h-2 w-12"></div>
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
          <div className="block md:hidden mt-8">
            <Link href="/factory/create" passHref>
              <button className="btn btn-gradient w-full h-[52px] text-white rounded-[12px]">
                Create New Token
              </button>
            </Link>
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
      <td className="rounded-l-[12px] w-1/4 ">
        <div className="flex items-center space-x-3">
          <DenomImage denom={denom} />

          <span className="font-medium xxs:max-xs:hidden block">
            {denom.display.startsWith('factory')
              ? denom.display.split('/').pop()?.toUpperCase()
              : truncateString(denom.display, 12)}
          </span>
        </div>
      </td>
      <td className="w-1/4 xl:table-cell hidden">{truncateString(denom.symbol, 20)}</td>
      <td className="w-2/4 sm:w-1/4 lg:table-cell hidden">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="sm:mr-2">{formatAmount(totalSupply)}</span>
          <span className="font-extralight">
            {truncateString(denom?.display ?? '', 10).toUpperCase()}
          </span>
        </div>
      </td>
      <td className="w-2/4 sm:w-1/4 md:table-cell hidden">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="sm:mr-2">{formatAmount(balance)}</span>
          <span className="font-extralight">
            {truncateString(denom?.display ?? '', 10).toUpperCase()}
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
