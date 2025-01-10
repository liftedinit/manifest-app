import React, { useState, useMemo } from 'react';
import {
  useFeeEstimation,
  useOsmosisTokenBalancesResolved,
  useOsmosisTokenFactoryDenomsMetadata,
  useTokenBalancesOsmosis,
  useTx,
} from '@/hooks';
import { ibc } from '@liftedinit/manifestjs';
import { MsgTransfer } from '@liftedinit/manifestjs/dist/codegen/ibc/applications/transfer/v1/tx';
import {
  getIbcInfo,
  parseNumberToBigInt,
  shiftDigits,
  truncateString,
  getIbcDenom,
  OSMOSIS_TOKEN_DATA,
} from '@/utils';
import { PiCaretDownBold } from 'react-icons/pi';
import { MdContacts } from 'react-icons/md';
import { CombinedBalanceInfo } from '@/utils/types';
import { DenomImage } from '@/components/factory';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput } from '@/components/react/inputs';
import { IbcChain } from '@/components';
import Image from 'next/image';
import { SearchIcon, TransferIcon } from '@/components/icons';

import { TailwindModal } from '@/components/react/modal';
import env from '@/config/env';
import { useChain } from '@cosmos-kit/react';

//TODO: switch to main-net names
export default function IbcSendForm({
  address,
  destinationChain,
  balances,
  isBalancesLoading,
  refetchBalances,
  refetchHistory,
  isIbcTransfer,
  ibcChains,
  selectedFromChain,
  setSelectedFromChain,
  selectedToChain,
  setSelectedToChain,
  selectedDenom,
}: Readonly<{
  address: string;
  destinationChain: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
  refetchHistory: () => void;
  isIbcTransfer: boolean;
  ibcChains: IbcChain[];
  selectedFromChain: string;
  setSelectedFromChain: (selectedChain: string) => void;
  selectedToChain: string;
  setSelectedToChain: (selectedChain: string) => void;
  selectedDenom?: string;
}>) {
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feeWarning, setFeeWarning] = useState('');
  const { tx } = useTx(
    selectedFromChain === env.osmosisTestnetChain ? env.osmosisTestnetChain : env.chain
  );
  const { estimateFee } = useFeeEstimation(
    selectedFromChain === env.osmosisTestnetChain ? env.osmosisTestnetChain : env.chain
  );
  const { transfer } = ibc.applications.transfer.v1.MessageComposer.withTypeUrl;
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  const { address: osmosisAddress } = useChain(env.osmosisTestnetChain);
  const { balances: osmosisBalances, isBalancesLoading: isOsmosisBalancesLoading } =
    useTokenBalancesOsmosis(osmosisAddress ?? '');
  const {
    balances: resolvedOsmosisBalances,
    isBalancesLoading: resolvedOsmosisLoading,
    refetchBalances: resolveOsmosisRefetch,
  } = useOsmosisTokenBalancesResolved(osmosisAddress ?? '');

  const { metadatas: osmosisMetadatas, isMetadatasLoading: isOsmosisMetadatasLoading } =
    useOsmosisTokenFactoryDenomsMetadata();

  // Add this combined balances memo for Osmosis tokens
  const combinedOsmosisBalances = useMemo(() => {
    if (!osmosisBalances || !resolvedOsmosisBalances || !osmosisMetadatas) {
      return [];
    }

    const combined = osmosisBalances.map((coreBalance): CombinedBalanceInfo => {
      const resolvedBalance = resolvedOsmosisBalances.find(
        rb => rb.denom === coreBalance.denom || rb.denom === coreBalance.denom.split('/').pop()
      );

      return {
        denom: resolvedBalance?.denom || coreBalance.denom,
        coreDenom: coreBalance.denom,
        amount: coreBalance.amount,
        metadata: OSMOSIS_TOKEN_DATA,
      };
    });

    return combined;
  }, [osmosisBalances, resolvedOsmosisBalances, osmosisMetadatas]);

  // Update the filtered balances logic to use the appropriate balance source
  const filteredBalances = useMemo(() => {
    const sourceBalances =
      selectedFromChain === env.osmosisTestnetChain ? combinedOsmosisBalances : balances;

    return sourceBalances?.filter(token => {
      const displayName = token.metadata?.display ?? token.denom;
      return displayName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [balances, combinedOsmosisBalances, searchTerm, selectedFromChain]);

  // Update initialSelectedToken to consider the chain
  const initialSelectedToken = useMemo(() => {
    const sourceBalances =
      selectedFromChain === env.osmosisTestnetChain ? combinedOsmosisBalances : balances;

    return (
      sourceBalances?.find(token => token.coreDenom === selectedDenom) ||
      sourceBalances?.[0] ||
      null
    );
  }, [balances, combinedOsmosisBalances, selectedDenom, selectedFromChain]);

  // Update the loading check
  if (
    (selectedFromChain === env.osmosisTestnetChain
      ? isOsmosisBalancesLoading
      : isBalancesLoading) ||
    !initialSelectedToken
  ) {
    return null;
  }

  const validationSchema = Yup.object().shape({
    recipient: Yup.string().required('Recipient is required').manifestAddress(),
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .test('sufficient-balance', 'Amount exceeds balance', function (value) {
        const { selectedToken } = this.parent;
        if (!selectedToken || !value) return true;

        const exponent = selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
        const balance = parseFloat(selectedToken.amount) / Math.pow(10, exponent);
        return value <= balance;
      })
      .test('leave-for-fees', 'Insufficient balance for fees', function (value) {
        const { selectedToken } = this.parent;
        if (!selectedToken || !value || selectedToken.denom !== 'umfx') return true;

        const exponent = selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
        const balance = parseFloat(selectedToken.amount) / Math.pow(10, exponent);

        return value <= balance - 0.09;
      }),
    selectedToken: Yup.object().required('Please select a token'),
    memo: Yup.string().max(255, 'Memo must be less than 255 characters'),
  });

  const formatAmount = (amount: number, decimals: number) => {
    return amount.toFixed(decimals).replace(/\.?0+$/, '');
  };

  const handleSend = async (values: {
    recipient: string;
    amount: string;
    selectedToken: CombinedBalanceInfo;
    memo: string;
  }) => {
    setIsSending(true);
    try {
      const exponent = values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
      const amountInBaseUnits = parseNumberToBigInt(values.amount, exponent).toString();
      console.log(selectedFromChain, selectedToChain);
      const { source_port, source_channel } = getIbcInfo(selectedFromChain, selectedToChain);

      const token = {
        denom: values.selectedToken.coreDenom,
        amount: amountInBaseUnits,
      };

      const stamp = Date.now();
      const timeoutInNanos = (stamp + 1.2e6) * 1e6;

      const msg = transfer({
        sourcePort: source_port,
        sourceChannel: source_channel,
        sender:
          selectedFromChain === env.osmosisTestnetChain ? (osmosisAddress ?? '') : (address ?? ''),
        receiver: values.recipient ?? '',
        token,
        timeoutHeight: {
          revisionNumber: BigInt(0),
          revisionHeight: BigInt(0),
        },
        timeoutTimestamp: BigInt(timeoutInNanos),
      });

      const fee = await estimateFee(
        selectedFromChain === env.osmosisTestnetChain ? (osmosisAddress ?? '') : (address ?? ''),
        [msg]
      );

      await tx([msg], {
        memo: values.memo,
        fee,
        onSuccess: () => {
          refetchBalances();
          refetchHistory();
        },
      });
    } catch (error) {
      console.error('Error during sending:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      style={{ borderRadius: '24px' }}
      className="text-sm bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] p-6 w-full h-full"
    >
      <Formik
        initialValues={{
          recipient: '',
          amount: '',
          selectedToken: initialSelectedToken,
          memo: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSend}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ isValid, dirty, setFieldValue, values, errors }) => (
          <Form className="space-y-6 flex flex-col items-center max-w-md mx-auto">
            <div className="w-full space-y-4">
              <div className=" relative w-full flex flex-col space-y-4">
                {/* From Chain (Manifest) */}
                <div
                  className={`dropdown dropdown-end w-full ${isIbcTransfer ? 'block' : 'hidden'}`}
                >
                  <div className="flex flex-col gap-1 justify-center items-start">
                    <span className="label-text text-sm font-medium text-[#00000099] dark:text-[#FFFFFF99]">
                      From Chain
                    </span>
                    <label
                      tabIndex={0}
                      aria-label="chain-selector"
                      role="combobox"
                      aria-expanded="false"
                      aria-controls="chain-dropdown"
                      aria-haspopup="listbox"
                      style={{ borderRadius: '12px' }}
                      className="btn   btn-md btn-dropdown w-full justify-between border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A]"
                    >
                      <span className="flex items-center">
                        {selectedFromChain && (
                          <Image
                            src={
                              ibcChains.find(chain => chain.id === selectedFromChain)?.icon || ''
                            }
                            alt={
                              ibcChains.find(chain => chain.id === selectedFromChain)?.name || ''
                            }
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                        )}
                        <span className={selectedFromChain ? 'ml-2' : ''}>
                          {ibcChains.find(chain => chain.id === selectedFromChain)?.name ??
                            'Select Chain'}
                        </span>
                      </span>
                      <PiCaretDownBold />
                    </label>
                  </div>

                  <ul
                    tabIndex={0}
                    role="listbox"
                    className="dropdown-content z-[100] menu p-2 shadow bg-base-300 rounded-lg w-full mt-1 dark:text-[#FFFFFF] text-[#161616]"
                  >
                    {ibcChains.map(chain => (
                      <li
                        key={chain.id}
                        role="option"
                        aria-selected={selectedFromChain === chain.id}
                      >
                        <a
                          onClick={e => {
                            if (chain.id === selectedFromChain) {
                              return;
                            }
                            setSelectedFromChain(chain.id);
                            // Get the dropdown element and remove focus
                            const dropdown = (e.target as HTMLElement).closest('.dropdown');
                            if (dropdown) {
                              (dropdown as HTMLElement).removeAttribute('open');
                              (dropdown.querySelector('label') as HTMLElement)?.focus();
                              (dropdown.querySelector('label') as HTMLElement)?.blur();
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              if (chain.id === selectedFromChain) {
                                return;
                              }
                              setSelectedFromChain(chain.id);
                              // Get the dropdown element and remove focus
                              const dropdown = (e.target as HTMLElement).closest('.dropdown');
                              if (dropdown) {
                                (dropdown as HTMLElement).removeAttribute('open');
                                (dropdown.querySelector('label') as HTMLElement)?.focus();
                                (dropdown.querySelector('label') as HTMLElement)?.blur();
                              }
                            }
                          }}
                          tabIndex={0}
                          className={`flex items-center ${
                            chain.id === selectedFromChain ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          style={
                            chain.id === selectedFromChain ? { pointerEvents: 'none' } : undefined
                          }
                          aria-label={chain.name}
                        >
                          <Image
                            src={chain.icon}
                            alt={chain.name}
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                          {chain.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Switch Button */}
                <div
                  onClick={e => {
                    e.preventDefault();
                    setSelectedFromChain(selectedToChain);
                    setSelectedToChain(selectedFromChain);
                  }}
                  className="absolute top-[calc(50%-16px)] right-0 w-full flex justify-center items-center cursor-pointer z-10"
                >
                  <button className="group btn btn-xs btn-primary flex items-center justify-center hover:bg-primary-focus transition-colors">
                    <TransferIcon className=" group-hover:rotate-180 transition-transform duration-200 cursor-pointer" />
                  </button>
                </div>
                {/* To Chain (Osmosis) */}
                <div
                  className={`dropdown dropdown-end w-full ${isIbcTransfer ? 'block' : 'hidden'}`}
                >
                  <div className="flex flex-col gap-1 justify-center items-start">
                    <span className="label-text text-sm font-medium text-[#00000099] dark:text-[#FFFFFF99]">
                      To Chain
                    </span>
                    <label
                      tabIndex={0}
                      aria-label="chain-selector"
                      role="combobox"
                      aria-expanded="false"
                      aria-controls="chain-dropdown"
                      aria-haspopup="listbox"
                      style={{ borderRadius: '12px' }}
                      className="btn   btn-md btn-dropdown w-full justify-between border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A]"
                    >
                      <span className="flex items-center">
                        {selectedToChain && (
                          <Image
                            src={ibcChains.find(chain => chain.id === selectedToChain)?.icon || ''}
                            alt={ibcChains.find(chain => chain.id === selectedToChain)?.name || ''}
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                        )}
                        <span className={selectedToChain ? 'ml-2' : ''}>
                          {ibcChains.find(chain => chain.id === selectedToChain)?.name ??
                            'Select Chain'}
                        </span>
                      </span>
                      <PiCaretDownBold />
                    </label>
                  </div>

                  <ul
                    tabIndex={0}
                    role="listbox"
                    className="dropdown-content z-[100] menu p-2 shadow bg-base-300 rounded-lg w-full mt-1 dark:text-[#FFFFFF] text-[#161616]"
                  >
                    {ibcChains.map(chain => (
                      <li key={chain.id} role="option" aria-selected={selectedToChain === chain.id}>
                        <a
                          onClick={e => {
                            if (chain.id === selectedToChain) {
                              return;
                            }
                            setSelectedToChain(chain.id);
                            // Get the dropdown element and remove focus
                            const dropdown = (e.target as HTMLElement).closest('.dropdown');
                            if (dropdown) {
                              (dropdown as HTMLElement).removeAttribute('open');
                              (dropdown.querySelector('label') as HTMLElement)?.focus();
                              (dropdown.querySelector('label') as HTMLElement)?.blur();
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              if (chain.id === selectedToChain) {
                                return;
                              }
                              setSelectedToChain(chain.id);
                              // Get the dropdown element and remove focus
                              const dropdown = (e.target as HTMLElement).closest('.dropdown');
                              if (dropdown) {
                                (dropdown as HTMLElement).removeAttribute('open');
                                (dropdown.querySelector('label') as HTMLElement)?.focus();
                                (dropdown.querySelector('label') as HTMLElement)?.blur();
                              }
                            }
                          }}
                          tabIndex={0}
                          className={`flex items-center ${
                            chain.id === selectedToChain ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          style={
                            chain.id === selectedToChain ? { pointerEvents: 'none' } : undefined
                          }
                          aria-label={chain.name}
                        >
                          <Image
                            src={chain.icon}
                            alt={chain.name}
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                          {chain.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="w-full">
                <label className="label">
                  <span className="label-text text-md font-medium text-[#00000099] dark:text-[#FFFFFF99]">
                    Amount
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*"
                    name="amount"
                    placeholder="0.00"
                    value={values.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setFieldValue('amount', e.target.value);
                      }
                    }}
                    style={{ borderRadius: '12px' }}
                    className="input input-md border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full pr-24 dark:text-[#FFFFFF] text-[#161616]"
                  />
                  <div className="absolute inset-y-1 right-1 flex items-center">
                    <div className="dropdown dropdown-end h-full">
                      <label
                        aria-label="token-selector"
                        tabIndex={0}
                        className="btn btn-sm h-full px-3 bg-[#FFFFFF] dark:bg-[#FFFFFF0F] border-none hover:bg-transparent"
                      >
                        {values.selectedToken?.metadata ? (
                          <DenomImage
                            denom={values.selectedToken.metadata}
                            withBackground={false}
                          />
                        ) : null}

                        {(() => {
                          const tokenDisplayName =
                            values.selectedToken?.metadata?.display ??
                            values.selectedToken?.denom ??
                            'Select';

                          return tokenDisplayName.startsWith('factory')
                            ? tokenDisplayName.split('/').pop()?.toUpperCase()
                            : truncateString(tokenDisplayName, 10).toUpperCase();
                        })()}
                        <PiCaretDownBold className="ml-1" />
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-20 p-2 shadow bg-base-300 rounded-lg w-full mt-1 max-h-72 min-w-44 overflow-y-auto dark:text-[#FFFFFF] text-[#161616]"
                      >
                        <li className=" bg-base-300 z-30 hover:bg-transparent h-full mb-2">
                          <div className="px-2 py-1 relative">
                            <input
                              type="text"
                              placeholder="Search tokens..."
                              className="input input-sm w-full pr-8 focus:outline-none focus:ring-0 border  border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A]"
                              onChange={e => setSearchTerm(e.target.value)}
                              style={{ boxShadow: 'none', borderRadius: '8px' }}
                            />
                            <SearchIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </li>
                        {isBalancesLoading ? (
                          <li>
                            <a className="block px-4 py-2">Loading tokens...</a>
                          </li>
                        ) : (
                          filteredBalances?.map(token => (
                            <li
                              key={token.coreDenom}
                              onClick={() => {
                                setFieldValue('selectedToken', token);
                                if (document.activeElement instanceof HTMLElement) {
                                  document.activeElement.blur();
                                }
                              }}
                              className="hover:bg-[#E0E0FF33] dark:hover:bg-[#FFFFFF0F] cursor-pointer rounded-lg"
                              aria-label={token.metadata?.display ?? token.denom}
                            >
                              <a className="flex flex-row items-center gap-2 px-2 py-2">
                                {token.metadata ? (
                                  <DenomImage denom={token.metadata} withBackground={false} />
                                ) : null}
                                <span className="truncate">
                                  {(() => {
                                    const tokenDisplayName =
                                      token.metadata?.display ?? token.denom ?? 'Select';

                                    return tokenDisplayName.startsWith('factory')
                                      ? tokenDisplayName.split('/').pop()?.toUpperCase()
                                      : truncateString(tokenDisplayName, 10).toUpperCase();
                                  })()}
                                </span>
                              </a>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="text-xs mt-1 flex  justify-between text-[#00000099] dark:text-[#FFFFFF99]">
                  <div className="flex flex-row gap-1">
                    <span>
                      Balance:{' '}
                      {values.selectedToken
                        ? Number(
                            shiftDigits(
                              Number(values.selectedToken.amount),
                              -(values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6)
                            )
                          ).toLocaleString(undefined, {
                            maximumFractionDigits:
                              values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6,
                          })
                        : '0'}
                    </span>
                    <span>
                      {(() => {
                        const tokenDisplayName =
                          values.selectedToken?.metadata?.display ??
                          values.selectedToken?.denom ??
                          'Select';

                        return tokenDisplayName.startsWith('factory')
                          ? tokenDisplayName.split('/').pop()?.toUpperCase()
                          : truncateString(tokenDisplayName, 10).toUpperCase();
                      })()}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-primary"
                      onClick={() => {
                        if (!values.selectedToken) return;

                        const exponent =
                          values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
                        const maxAmount =
                          Number(values.selectedToken.amount) / Math.pow(10, exponent);

                        let adjustedMaxAmount = maxAmount;
                        if (values.selectedToken.denom === 'umfx') {
                          adjustedMaxAmount = Math.max(0, maxAmount - 0.1);
                        }

                        const decimals =
                          values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
                        const formattedAmount = formatAmount(adjustedMaxAmount, decimals);

                        setFieldValue('amount', formattedAmount);
                      }}
                    >
                      MAX
                    </button>
                  </div>
                  {errors.amount && <div className="text-red-500 text-xs">{errors.amount}</div>}
                  {feeWarning && !errors.amount && (
                    <div className="text-yellow-500 text-xs">{feeWarning}</div>
                  )}
                </div>
              </div>

              <TextInput
                label="Send To"
                name="recipient"
                placeholder="Enter address"
                value={values.recipient}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue('recipient', e.target.value);
                }}
                className="input-md w-full"
                style={{ borderRadius: '12px' }}
                rightElement={
                  <button
                    type="button"
                    aria-label="contacts-btn"
                    onClick={() => setIsContactsOpen(true)}
                    className="btn btn-primary btn-sm text-white"
                  >
                    <MdContacts className="w-5 h-5" />
                  </button>
                }
              />

              <TextInput
                label="Memo (optional)"
                name="memo"
                placeholder="Memo"
                style={{ borderRadius: '12px' }}
                value={values.memo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue('memo', e.target.value);
                }}
                className="input-md w-full"
              />
            </div>

            <div className="w-full mt-6">
              <button
                type="submit"
                className="btn btn-gradient w-full text-white"
                disabled={isSending || !isValid || !dirty}
                aria-label="send-btn"
              >
                {isSending ? <span className="loading loading-dots loading-xs"></span> : 'Send'}
              </button>
            </div>
            <TailwindModal
              isOpen={isContactsOpen}
              setOpen={setIsContactsOpen}
              showContacts={true}
              currentAddress={address}
              onSelect={(selectedAddress: string) => {
                setFieldValue('recipient', selectedAddress);
              }}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
}
