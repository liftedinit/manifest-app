import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { MetadataSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { DenomImage } from './DenomImage';
import Link from 'next/link';
import { truncateString } from '@/utils';
import { SearchIcon, MintIcon, BurnIcon } from '@/components/icons';
import { DenomInfo } from '@/components/factory/modals/denomInfo';
import MintModal from '@/components/factory/modals/MintModal';
import BurnModal from '@/components/factory/modals/BurnModal';

const MFX_TOKEN_DATA: MetadataSDKType = {
  description: 'The native token of the Manifest Chain',
  denom_units: [
    { denom: 'umfx', exponent: 0, aliases: [] },
    { denom: 'mfx', exponent: 6, aliases: [] },
  ],
  base: 'umfx',
  display: 'mfx',
  name: 'Manifest',
  symbol: 'MFX',
  uri: '',
  uri_hash: '',
};

export default function MyDenoms({
  denoms,
  isLoading,
  isError,
  refetchDenoms,
  onSelectDenom,
  address,
  balance,
}: {
  denoms: MetadataSDKType[];
  isLoading: boolean;
  isError: Error | null | boolean;
  refetchDenoms: () => void;
  onSelectDenom: (denom: MetadataSDKType) => void;
  address: string;
  balance: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [selectedDenom, setSelectedDenom] = useState<MetadataSDKType | null>(null);
  const [modalType, setModalType] = useState<'mint' | 'burn' | null>(null);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleDenomSelect = (denom: MetadataSDKType) => {
    onSelectDenom(denom);
    setSelectedDenom(denom);
    router.push(`/factory?denom=${denom?.base}`, undefined, { shallow: true });
  };

  const allDenoms = useMemo(() => [MFX_TOKEN_DATA, ...denoms], [denoms]);
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

  const filteredDenoms = allDenoms.filter(denom =>
    denom?.display.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <th className="bg-transparent w-1/5">Token</th>
                  <th className="bg-transparent w-1/5">Symbol</th>
                  <th className="bg-transparent w-2/5">Description</th>
                  <th className="bg-transparent w-1/5">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {isLoading || !showContent
                  ? Array(12)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={index}>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-l-[12px] w-1/5">
                            <div className="flex items-center space-x-3">
                              <div className="skeleton w-10 h-8 rounded-full shrink-0"></div>
                              <div className="skeleton h-3 w-24"></div>
                            </div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-1/5">
                            <div className="skeleton h-2 w-8"></div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] w-2/5">
                            <div className="skeleton h-2 w-24"></div>
                          </td>
                          <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-r-[12px] w-1/5">
                            <div className="skeleton h-2 w-32"></div>
                          </td>
                        </tr>
                      ))
                  : filteredDenoms.map((denom, index) => (
                      <TokenRow
                        key={index}
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
                      />
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DenomInfo denom={selectedDenom} modalId="denom-info-modal" />
      <MintModal
        denom={selectedDenom}
        address={address}
        refetch={refetchDenoms}
        balance={balance}
        isOpen={modalType === 'mint'}
        onClose={handleCloseModal}
      />
      <BurnModal
        denom={selectedDenom}
        address={address}
        refetch={refetchDenoms}
        balance={balance}
        isOpen={modalType === 'burn'}
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
}: {
  denom: MetadataSDKType;
  onSelectDenom: () => void;
  onMint: () => void;
  onBurn: () => void;
}) {
  return (
    <tr
      className="hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] dark:bg-[#FFFFFF0F] bg-[#FFFFFF] text-black dark:text-white rounded-lg  cursor-pointer"
      onClick={onSelectDenom}
    >
      <td className=" rounded-l-[12px] w-1/5">
        <div className="flex items-center space-x-3">
          <DenomImage denom={denom} />
          <span className="font-medium">{truncateString(denom.display, 24)}</span>
        </div>
      </td>
      <td className=" w-1/5">{denom.symbol}</td>
      <td className=" w-2/5">{truncateString(denom.description, 50)}</td>
      <td className=" rounded-r-[12px] w-1/5">
        <div className="flex space-x-2">
          <button
            className="btn btn-sm btn-outline btn-primary"
            onClick={e => {
              e.stopPropagation();
              onMint();
            }}
          >
            <MintIcon className="w-4 h-4" />
          </button>
          <button
            className="btn btn-sm btn-outline btn-error"
            onClick={e => {
              e.stopPropagation();
              onBurn();
            }}
          >
            <BurnIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
