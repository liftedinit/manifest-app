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
import { MFX_TOKEN_DATA } from '@/utils/constants';

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
  const [showContent, setShowContent] = useState(false);
  const [selectedDenom, setSelectedDenom] = useState<ExtendedMetadataSDKType | null>(null);
  const [modalType, setModalType] = useState<'mint' | 'burn' | null>(null);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleDenomSelect = (denom: ExtendedMetadataSDKType) => {
    setSelectedDenom(denom);
    router.push(`/factory?denom=${denom?.base}`, undefined, { shallow: true });
  };

  const allDenoms = useMemo(() => {
    const mfxBalance = denoms.find(denom => denom.base === 'umfx')?.balance || '0';
    const mfxSupply = denoms.find(denom => denom.base === 'umfx')?.totalSupply || '0';
    const mfxWithBalance: ExtendedMetadataSDKType = {
      ...MFX_TOKEN_DATA,
      balance: mfxBalance,
      totalSupply: mfxSupply,
    };
    return [mfxWithBalance, ...denoms.filter(denom => denom.base !== 'umfx')];
  }, [denoms]);

  useEffect(() => {
    const { denom, action } = router.query;
    if (denom && typeof denom === 'string') {
      const decodedDenom = decodeURIComponent(denom);
      const metadata = allDenoms.find(d => d.base === decodedDenom);
      if (metadata) {
        setSelectedDenom(metadata);
        if (action === 'mint' || action === 'burn') {
          setModalType(action);
        } else {
          // Open the DenomInfo modal
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
  }, [router.query, allDenoms]);

  const handleCloseModal = () => {
    setSelectedDenom(null);
    setModalType(null);
    router.push('/factory', undefined, { shallow: true });
  };

  const handleUpdateModal = (denom: ExtendedMetadataSDKType) => {
    setSelectedDenom(denom);
    const modal = document.getElementById('update-denom-metadata-modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  const filteredDenoms = allDenoms.filter(denom =>
    denom?.display.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log(denoms);

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
                  <th className="bg-transparent w-1/5 lg:table-cell hidden">Token</th>
                  <th className="bg-transparent w-1/5 sm:table-cell hidden">Symbol</th>
                  <th className="bg-transparent w-1/5 md:table-cell hidden">Total Supply</th>
                  <th className="bg-transparent w-2/5">Your Balance</th>
                  <th className="bg-transparent w-1/5">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {isLoading || !showContent
                  ? Array(12)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={index}>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-l-[12px] w-1/5 lg:table-cell hidden">
                            <div className="flex items-center space-x-3">
                              <div className="skeleton w-10 h-8 rounded-full shrink-0"></div>
                              <div className="skeleton h-3 w-24"></div>
                            </div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-1/5 sm:table-cell hidden">
                            <div className="skeleton h-2 w-8"></div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-2/5 md:table-cell hidden">
                            <div className="skeleton h-2 w-24"></div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-2/5">
                            <div className="skeleton h-2 w-32"></div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-r-[12px] w-1/5">
                            <div className="skeleton h-2 w-32"></div>
                          </td>
                        </tr>
                      ))
                  : filteredDenoms.map(denom => (
                      <TokenRow
                        key={denom.base}
                        denom={denom}
                        onSelectDenom={() => handleDenomSelect(denom)}
                        onMint={() => {
                          setSelectedDenom(denom);
                          setModalType('mint');
                          router.push(`/factory?denom=${denom.base}&action=mint`, undefined, {
                            shallow: true,
                          });
                        }}
                        onBurn={() => {
                          setSelectedDenom(denom);
                          setModalType('burn');
                          router.push(`/factory?denom=${denom.base}&action=burn`, undefined, {
                            shallow: true,
                          });
                        }}
                        onUpdate={() => handleUpdateModal(denom)}
                      />
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DenomInfoModal denom={selectedDenom} modalId="denom-info-modal" />
      <MintModal
        denom={selectedDenom}
        address={address}
        refetch={refetchDenoms}
        balance={selectedDenom?.balance ?? '0'}
        totalSupply={selectedDenom?.totalSupply ?? '0'}
        isOpen={modalType === 'mint'}
        onClose={handleCloseModal}
      />
      <BurnModal
        denom={selectedDenom}
        address={address}
        refetch={refetchDenoms}
        balance={selectedDenom?.balance ?? '0'}
        totalSupply={selectedDenom?.totalSupply ?? '0'}
        isOpen={modalType === 'burn'}
        onClose={handleCloseModal}
      />
      <UpdateDenomMetadataModal
        modalId="update-denom-metadata-modal"
        denom={selectedDenom}
        address={address}
        onSuccess={() => {
          refetchDenoms();
        }}
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
  onMint: () => void;
  onBurn: () => void;
  onUpdate: () => void;
}) {
  return (
    <tr
      className="hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] dark:bg-[#FFFFFF0F] bg-[#FFFFFF] text-black dark:text-white rounded-lg cursor-pointer"
      onClick={onSelectDenom}
    >
      <td className="rounded-l-[12px] w-1/4 lg:table-cell hidden">
        <div className="flex items-center space-x-3">
          <DenomImage denom={denom} />
          <span className="font-medium">{truncateString(denom.display, 24)}</span>
        </div>
      </td>
      <td className="w-1/4 sm:table-cell hidden">{truncateString(denom.symbol, 20)}</td>
      <td className="w-2/4 sm:w-1/4">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="sm:mr-2">
            {Number(shiftDigits(denom.totalSupply, -denom.denom_units[1]?.exponent)).toLocaleString(
              undefined,
              {
                maximumFractionDigits: denom.denom_units[1]?.exponent ?? 6,
              }
            )}
          </span>
          <span className=" font-extralight ">
            {truncateString(denom.display, 10).toUpperCase()}
          </span>
        </div>
      </td>
      <td className="w-2/4 sm:w-1/4">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="sm:mr-2">
            {Number(shiftDigits(denom.balance, -denom.denom_units[1]?.exponent)).toLocaleString(
              undefined,
              {
                maximumFractionDigits: denom.denom_units[1]?.exponent ?? 6,
              }
            )}
          </span>
          <span className="font-extralight ">
            {truncateString(denom.display, 10).toUpperCase()}
          </span>
        </div>
      </td>
      <td className="rounded-r-[12px] w-1/4">
        <div className="flex space-x-2">
          <button
            className="btn btn-sm btn-outline btn-square  btn-primary group"
            onClick={e => {
              e.stopPropagation();
              onMint();
            }}
          >
            <MintIcon className="w-5 h-5 text-current group-hover:text-white" />
          </button>

          <button
            className="btn btn-sm btn-outline btn-square  btn-error group"
            onClick={e => {
              e.stopPropagation();
              onBurn();
            }}
          >
            <BurnIcon className="w-5 h-5 text-current group-hover:text-white" />
          </button>

          <button
            disabled={denom.base.includes('umfx')}
            className="btn btn-sm btn-square btn-outline btn-info group"
            onClick={e => {
              e.stopPropagation();
              onUpdate();
            }}
          >
            <PiInfo className="w-5 h-5 text-current group-hover:text-white" />
          </button>
        </div>
      </td>
    </tr>
  );
}
