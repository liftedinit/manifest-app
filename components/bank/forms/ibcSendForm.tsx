import { useChain } from '@cosmos-kit/react';
import { cosmos, ibc } from '@liftedinit/manifestjs';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MsgTransfer } from '@liftedinit/manifestjs/dist/codegen/ibc/applications/transfer/v1/tx';
import { Form, Formik } from 'formik';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { MdContacts } from 'react-icons/md';
import { PiCaretDownBold } from 'react-icons/pi';

import { IbcChain } from '@/components';
import { AmountInput } from '@/components';
import { DenomDisplay } from '@/components/factory';
import { SearchIcon } from '@/components/icons';
import { TextInput } from '@/components/react/inputs';
import { TailwindModal } from '@/components/react/modal';
import env from '@/config/env';
import { useToast } from '@/contexts';
import { useSkipClient } from '@/contexts/skipGoContext';
import { useFeeEstimation, useTx } from '@/hooks';
import { getIbcDenom, getIbcInfo, parseNumberToBigInt, shiftDigits, truncateString } from '@/utils';
import { CombinedBalanceInfo } from '@/utils/types';
import Yup from '@/utils/yupExtensions';

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
  isGroup,
  refetchProposals,
  admin,
  availableToChains,
}: Readonly<{
  address: string;
  destinationChain: IbcChain;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void | Promise<void>;
  refetchHistory: () => void | Promise<void>;
  isIbcTransfer: boolean;
  ibcChains: IbcChain[];
  isGroup?: boolean;
  selectedFromChain: IbcChain;
  setSelectedFromChain: (selectedChain: IbcChain) => void;
  selectedToChain: IbcChain;
  setSelectedToChain: (selectedChain: IbcChain) => void;
  selectedDenom?: string;
  refetchProposals?: () => void;
  admin?: string;
  availableToChains: IbcChain[];
}>) {
  // State management
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feeWarning, setFeeWarning] = useState('');
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  // Hooks and context
  const { getOfflineSignerAmino } = useChain(env.chain);
  const { tx } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);
  const { setToastMessage } = useToast();
  const skipClient = useSkipClient({ getCosmosSigner: async () => getOfflineSignerAmino() });

  // Constants
  const explorerUrl =
    selectedFromChain.id === env.osmosisChain ? env.osmosisExplorerUrl : env.explorerUrl;
  const { transfer } = ibc.applications.transfer.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  // Set initial chain for group transactions
  useEffect(() => {
    if (isGroup) {
      setSelectedFromChain(ibcChains.find(chain => chain.id === env.chain) ?? ibcChains[0]);
    }
  }, [ibcChains, isGroup, setSelectedFromChain]);

  // Memoized filtered balances based on search term
  const filteredBalances = useMemo(() => {
    return balances?.filter(token => {
      const displayName = token.metadata?.display ?? token.display;
      return displayName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [balances, searchTerm]);

  // Initial token selection logic
  const initialSelectedToken = useMemo(() => {
    return balances?.find(token => token.base === selectedDenom) || balances?.[0] || null;
  }, [balances, selectedDenom]);

  // Loading state checks
  if (isBalancesLoading || !initialSelectedToken) {
    return null;
  }

  // Form validation schema
  const validationSchema = Yup.object().shape({
    recipient: Yup.string()
      .required('Recipient is required')
      .manifestAddress()
      .test(
        'recipient-has-prefix',
        'Recipient prefix must match recipient chain',
        function (value) {
          if (!value) return true;
          return selectedToChain.id === env.osmosisChain
            ? value.startsWith('osmo')
            : selectedToChain.id === env.axelarChain
              ? value.startsWith('axelar')
              : value.startsWith('manifest');
        }
      ),
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
      .test('leave-for-fees', '', function (value) {
        const { selectedToken } = this.parent;
        if (!selectedToken || !value || selectedToken.denom !== 'umfx') return true;

        const exponent = selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
        const balance = parseFloat(selectedToken.amount) / Math.pow(10, exponent);

        const MIN_FEE_BUFFER = 0.09;
        const hasInsufficientBuffer = value > balance - MIN_FEE_BUFFER;

        if (hasInsufficientBuffer) {
          setFeeWarning('Remember to leave tokens for fees!');
        } else {
          setFeeWarning('');
        }

        return !hasInsufficientBuffer;
      }),
    selectedToken: Yup.object().required('Please select a token'),
    memo: Yup.string().max(255, 'Memo must be less than 255 characters'),
  });

  // Helper function to format amount with proper decimals
  const formatAmount = (amount: number, decimals: number) => {
    return amount.toFixed(decimals).replace(/\.?0+$/, '');
  };

  // Main form submission handler
  const handleSend = async (values: {
    recipient: string;
    amount: string;
    selectedToken: CombinedBalanceInfo;
    memo: string;
  }) => {
    setIsSending(true);
    try {
      // Convert amount to base units
      const exponent = values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
      const amountInBaseUnits = parseNumberToBigInt(values.amount, exponent).toString();

      // Get IBC channel info
      const { source_port, source_channel } = getIbcInfo(selectedFromChain.id, selectedToChain.id);

      // Setup token and timeout
      const token = {
        denom: values.selectedToken.base,
        amount: amountInBaseUnits,
      };
      const timeoutInNanos = (Date.now() + 1.2e6) * 1e6;

      // Get IBC denom for destination chain
      const ibcDenom = getIbcDenom(selectedToChain.id, values.selectedToken.base);

      // Setup skip protocol route
      const route = await skipClient.route({
        sourceAssetDenom: values.selectedToken.base,
        sourceAssetChainID: selectedFromChain.chainID,
        destAssetChainID: selectedToChain.chainID,
        destAssetDenom: ibcDenom ?? '',
        amountIn: amountInBaseUnits,
      });

      const userAddresses = [
        { chainID: selectedFromChain.chainID, address },
        { chainID: selectedToChain.chainID, address: values.recipient },
      ];

      // Handle regular transfer vs group transfer
      if (!isGroup) {
        try {
          await skipClient.executeRoute({
            route,
            userAddresses,
            onTransactionSigned: async () => {
              setToastMessage({
                type: 'alert-info',
                title: 'IBC Transfer',
                isIbcTransfer: true,
                sourceChain: selectedFromChain.name,
                targetChain: selectedToChain.name,
                sourceChainIcon: selectedFromChain.icon,
                targetChainIcon: selectedToChain.icon,
                status: 'STATE_SUBMITTED',
                description: `Sending ${values.amount} ${values.selectedToken.metadata?.display} to ${truncateString(values.recipient, 12)}`,
              });
            },
            onTransactionBroadcast: async () => {
              setToastMessage({
                type: 'alert-info',
                title: 'IBC Transfer',
                isIbcTransfer: true,
                sourceChain: selectedFromChain.name,
                targetChain: selectedToChain.name,
                sourceChainIcon: selectedFromChain.icon,
                targetChainIcon: selectedToChain.icon,
                status: 'STATE_PENDING',
              });
            },
            onTransactionTracked: async () => {
              setToastMessage({
                type: 'alert-info',
                title: 'IBC Transfer',
                isIbcTransfer: true,
                sourceChain: selectedFromChain.name,
                targetChain: selectedToChain.name,
                sourceChainIcon: selectedFromChain.icon,
                targetChainIcon: selectedToChain.icon,
                status: 'STATE_RECEIVED',
              });
            },
            onTransactionCompleted: async (chainID, txHash, status) => {
              if (status.state === 'STATE_COMPLETED_SUCCESS') {
                await Promise.all([refetchBalances(), refetchHistory()]);
              }

              setToastMessage({
                type: status.state === 'STATE_COMPLETED_SUCCESS' ? 'alert-success' : 'alert-error',
                title: `IBC Transfer ${status.state === 'STATE_COMPLETED_SUCCESS' ? 'Success' : 'Error'}`,
                isIbcTransfer: true,
                sourceChain: selectedFromChain.name,
                explorerLink: `${explorerUrl}/transaction/${txHash}`,
                targetChain: selectedToChain.name,
                sourceChainIcon: selectedFromChain.icon,
                targetChainIcon: selectedToChain.icon,
                status:
                  status.state === 'STATE_COMPLETED_SUCCESS'
                    ? 'STATE_COMPLETED_SUCCESS'
                    : 'STATE_COMPLETED_ERROR',
                description:
                  status.state === 'STATE_COMPLETED_SUCCESS'
                    ? `Successfully sent ${values.amount} ${values.selectedToken.metadata?.display} to ${truncateString(values.recipient, 12)}`
                    : `Failed to send ${values.amount} ${values.selectedToken.metadata?.display}`,
              });
            },
            onValidateGasBalance: async value => {
              if (value.status === 'error') {
                setToastMessage({
                  type: 'alert-error',
                  title: 'Gas Error',
                  description: 'Insufficient balance for gas',
                  bgColor: '#e74c3c',
                });
              }
            },
          });
        } catch (error) {
          console.error('Error during sending:', error);
          setIsSending(false);
        } finally {
          setIsSending(false);
        }
      } else {
        const transferMsg = transfer({
          sourcePort: source_port,
          sourceChannel: source_channel,
          sender: admin ? admin : (address ?? ''),
          receiver: values.recipient ?? '',
          token,
          timeoutHeight: {
            revisionNumber: BigInt(0),
            revisionHeight: BigInt(0),
          },
          timeoutTimestamp: BigInt(timeoutInNanos),
        });

        const msg = submitProposal({
          groupPolicyAddress: admin!,
          messages: [
            Any.fromPartial({
              typeUrl: MsgTransfer.typeUrl,
              value: MsgTransfer.encode(transferMsg.value).finish(),
            }),
          ],
          metadata: '',
          proposers: [address],
          title: `IBC Transfer`,
          summary: `This proposal will send ${values.amount} ${values.selectedToken.metadata?.display} to ${values.recipient} via IBC transfer`,
          exec: 0,
        });

        const fee = await estimateFee(address ?? '', [msg]);

        await tx([msg], {
          memo: values.memo,
          fee,
          onSuccess: () => {
            refetchBalances();
            refetchHistory();
            refetchProposals?.();
          },
        });
      }
    } catch (error) {
      console.error('Error during sending:', error);
      setIsSending(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      style={{ borderRadius: '24px' }}
      className="text-sm bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] p-6 w-full h-full animate-fadeIn duration-400"
    >
      <Formik
        initialValues={{
          recipient: '',
          amount: '',
          selectedToken: initialSelectedToken,
          memo: '',
        }}
        enableReinitialize={false}
        validationSchema={validationSchema}
        onSubmit={handleSend}
      >
        {({ isValid, dirty, setFieldValue, values, errors }) => {
          // Use direct calculation instead of useMemo
          const selectedTokenBalance = values?.selectedToken
            ? balances?.find(token => token.base === values.selectedToken.base)
            : null;

          return (
            <Form className="space-y-6 flex flex-col items-center max-w-md mx-auto">
              <div className="w-full space-y-4">
                <div className=" relative w-full flex flex-col space-y-4">
                  {/* From Chain */}
                  <div className={`w-full ${isIbcTransfer ? 'block' : 'hidden'}`}>
                    <div className="flex flex-col gap-1 justify-center items-start">
                      <span className="label-text text-sm font-medium text-[#00000099] dark:text-[#FFFFFF99]">
                        From Chain
                      </span>
                      <div
                        style={{ borderRadius: '12px' }}
                        className="btn btn-md w-full justify-between border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] cursor-default"
                      >
                        <span className="flex items-center">
                          <Image
                            src={ibcChains.find(chain => chain.id === env.chain)?.icon || ''}
                            alt={ibcChains.find(chain => chain.id === env.chain)?.name || ''}
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                          <span className="ml-2">
                            {ibcChains.find(chain => chain.id === env.chain)?.name}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Switch Button */}
                  {/* <div
                    onClick={e => {
                      e.preventDefault();
                      setIsIconRotated(!isIconRotated);
                      setSelectedFromChain(selectedToChain);
                      setSelectedToChain(selectedFromChain);
                    }}
                    className={`absolute top-[calc(50%-16px)] right-0 w-full  justify-center items-center cursor-pointer z-10 ${
                      isGroup === true ? 'hidden' : 'flex'
                    }`}
                  >
                    <button className="group btn btn-xs btn-primary flex items-center justify-center hover:bg-primary-focus transition-colors">
                      <TransferIcon
                        className={`transition-transform duration-200 cursor-pointer ${
                          isIconRotated ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div> */}
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
                        aria-label="to-chain-selector"
                        role="combobox"
                        aria-expanded="false"
                        aria-controls="chain-dropdown"
                        aria-haspopup="listbox"
                        style={{ borderRadius: '12px' }}
                        className="btn btn-md btn-dropdown w-full justify-between border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A]"
                      >
                        <span className="flex items-center">
                          {selectedToChain && (
                            <Image
                              src={
                                ibcChains.find(chain => chain.id === selectedToChain.id)?.icon || ''
                              }
                              alt={
                                ibcChains.find(chain => chain.id === selectedToChain.id)?.name || ''
                              }
                              width={24}
                              height={24}
                              className="mr-2"
                            />
                          )}
                          <span className={selectedToChain ? 'ml-2' : ''}>
                            {ibcChains.find(chain => chain.id === selectedToChain.id)?.name ??
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
                      {availableToChains?.map(chain => (
                        <li
                          key={chain.id}
                          role="option"
                          aria-selected={selectedToChain.id === chain.id}
                        >
                          <a
                            onClick={e => {
                              if (chain.id === selectedToChain.id) {
                                return;
                              }
                              setSelectedToChain(chain);
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
                                if (chain.id === selectedToChain.id) {
                                  return;
                                }
                                setSelectedToChain(chain);
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
                              chain.id === selectedToChain.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            style={
                              chain.id === selectedToChain.id
                                ? { pointerEvents: 'none' }
                                : undefined
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
                    <AmountInput
                      name="amount"
                      value={values.amount}
                      onValueChange={v => setFieldValue('amount', v)}
                    />
                    <div className="absolute inset-y-1 right-1 flex items-center">
                      <div className="dropdown dropdown-end h-full">
                        <label
                          aria-label="token-selector"
                          tabIndex={0}
                          className="btn btn-sm h-full px-3 bg-[#FFFFFF] dark:bg-[#FFFFFF0F] border-none hover:bg-transparent"
                        >
                          <DenomDisplay
                            withBackground={false}
                            denom={
                              values.selectedToken?.metadata?.display ??
                              values.selectedToken?.display
                            }
                            metadata={values.selectedToken?.metadata}
                          />
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
                                key={token.base}
                                onClick={() => {
                                  setFieldValue('selectedToken', token);
                                  if (document.activeElement instanceof HTMLElement) {
                                    document.activeElement.blur();
                                  }
                                }}
                                className="hover:bg-[#E0E0FF33] dark:hover:bg-[#FFFFFF0F] cursor-pointer rounded-lg"
                                aria-label={token.metadata?.display ?? token.display}
                              >
                                <a className="flex flex-row items-center gap-2 px-2 py-2">
                                  <DenomDisplay
                                    denom={token.metadata?.display ?? token.display}
                                    metadata={token.metadata}
                                    withBackground={false}
                                  />
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
                                Number(selectedTokenBalance?.amount ?? values.selectedToken.amount),
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
                            values.selectedToken?.display ??
                            'Select';

                          return tokenDisplayName.startsWith('factory')
                            ? tokenDisplayName.split('/').pop()?.toUpperCase()
                            : tokenDisplayName.startsWith('u')
                              ? tokenDisplayName.slice(1).toUpperCase()
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
                          if (values.selectedToken.base === 'umfx') {
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
          );
        }}
      </Formik>
    </div>
  );
}
