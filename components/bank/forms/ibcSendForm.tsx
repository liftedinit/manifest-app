import React, { useState, useMemo, useEffect } from 'react';
import {
  useFeeEstimation,
  useOsmosisTokenBalancesResolved,
  useOsmosisTokenFactoryDenomsMetadata,
  useTokenBalancesOsmosis,
  useTx,
} from '@/hooks';
import { cosmos, ibc } from '@liftedinit/manifestjs';
import { MsgTransfer } from '@liftedinit/manifestjs/dist/codegen/ibc/applications/transfer/v1/tx';
import {
  getIbcInfo,
  parseNumberToBigInt,
  shiftDigits,
  truncateString,
  getIbcDenom,
  OSMOSIS_TOKEN_DATA,
  denomToAsset,
} from '@/utils';
import { PiCaretDownBold } from 'react-icons/pi';
import { MdContacts } from 'react-icons/md';
import { CombinedBalanceInfo } from '@/utils/types';
import { DenomImage } from '@/components/factory';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput } from '@/components/react/inputs';

import Image from 'next/image';
import { SearchIcon, TransferIcon } from '@/components/icons';

import { TailwindModal } from '@/components/react/modal';
import env from '@/config/env';
import { useChains } from '@cosmos-kit/react';
import { useSearchParams } from 'next/navigation';
import { Any } from 'cosmjs-types/google/protobuf/any';
import { useSkipClient } from '@/contexts/skipGoContext';

import { IbcChain } from '@/components';
import { ChainContext } from '@cosmos-kit/core';

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
  osmosisBalances,
  isOsmosisBalancesLoading,
  refetchOsmosisBalances,
  resolveOsmosisRefetch,
  refetchProposals,
  admin,
  availableToChains,
  chains,
}: Readonly<{
  address: string;
  destinationChain: IbcChain;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
  refetchHistory: () => void;
  isIbcTransfer: boolean;
  ibcChains: IbcChain[];
  isGroup?: boolean;
  selectedFromChain: IbcChain;
  setSelectedFromChain: (selectedChain: IbcChain) => void;
  selectedToChain: IbcChain;
  setSelectedToChain: (selectedChain: IbcChain) => void;
  selectedDenom?: string;
  osmosisBalances: CombinedBalanceInfo[];
  isOsmosisBalancesLoading: boolean;
  refetchOsmosisBalances: () => void;
  resolveOsmosisRefetch: () => void;
  refetchProposals?: () => void;
  admin?: string;
  availableToChains: IbcChain[];
  chains: Record<string, ChainContext>;
}>) {
  const formatTokenDisplayName = (displayName: string) => {
    if (displayName.startsWith('factory')) {
      return displayName.split('/').pop()?.toUpperCase();
    }
    if (displayName.startsWith('u')) {
      return displayName.slice(1).toUpperCase();
    }
    return truncateString(displayName, 10).toUpperCase();
  };

  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feeWarning, setFeeWarning] = useState('');
  const { tx } = useTx(selectedFromChain.name === env.osmosisChain ? env.osmosisChain : env.chain);
  const { estimateFee } = useFeeEstimation(
    selectedFromChain.name === env.osmosisChain ? env.osmosisChain : env.chain
  );

  const { transfer } = ibc.applications.transfer.v1.MessageComposer.withTypeUrl;
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isIconRotated, setIsIconRotated] = useState(false);

  const getCosmosSigner = async () => {
    const signer = chains[selectedFromChain.name].getOfflineSignerAmino();
    return signer;
  };
  const skipClient = useSkipClient({
    getCosmosSigner: getCosmosSigner,
  });

  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  useEffect(() => {
    if (isGroup) {
      setSelectedFromChain(ibcChains.find(chain => chain.id === env.chain) ?? ibcChains[0]);
    }
  }, [isGroup, setSelectedFromChain]);

  // Add this combined balances memo for Osmosis tokens

  // Update the filtered balances logic to use passed props instead of hooks
  const filteredBalances = useMemo(() => {
    const sourceBalances = selectedFromChain.id === env.osmosisChain ? osmosisBalances : balances;

    return sourceBalances?.filter(token => {
      const displayName = token.metadata?.display ?? token.denom;
      return displayName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [balances, osmosisBalances, searchTerm, selectedFromChain]);

  // Update initialSelectedToken to consider the chain
  const initialSelectedToken = useMemo(() => {
    const sourceBalances = selectedFromChain.id === env.osmosisChain ? osmosisBalances : balances;

    return (
      sourceBalances?.find(token => token.coreDenom === selectedDenom) ||
      sourceBalances?.[0] ||
      null
    );
  }, [balances, osmosisBalances, selectedDenom, selectedFromChain]);

  // Update the loading check
  if (
    (selectedFromChain.id === env.osmosisChain ? isOsmosisBalancesLoading : isBalancesLoading) ||
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

      const { source_port, source_channel } = getIbcInfo(selectedFromChain.id, selectedToChain.id);

      const skipChains = await skipClient.chains({
        onlyTestnets: true,
      });
      console.log('Available Skip chains:', skipChains);

      const token = {
        denom: values.selectedToken.coreDenom,
        amount: amountInBaseUnits,
      };

      const stamp = Date.now();
      const timeoutInNanos = (stamp + 1.2e6) * 1e6;

      const ibcDenom = getIbcDenom(selectedToChain.id, values.selectedToken.coreDenom);

      const route = await skipClient.route({
        sourceAssetDenom: values.selectedToken.coreDenom,
        sourceAssetChainID: selectedFromChain.chainID,
        destAssetChainID: selectedToChain.chainID,
        destAssetDenom: ibcDenom ?? '',
        amountIn: amountInBaseUnits,
      });

      console.log('route', route);

      const addressList = route.requiredChainAddresses.map(chainID => ({
        address:
          Object.values(chains).find(chain => chain.chain.chain_id === chainID)?.address ?? '',
      }));

      const userAddresses = route.requiredChainAddresses.map(chainID => ({
        address:
          Object.values(chains).find(chain => chain.chain.chain_id === chainID)?.address ?? '',
        chainID: chainID,
      }));

      console.log(userAddresses);

      const messages = await skipClient.messages({
        sourceAssetDenom: values.selectedToken.coreDenom,
        sourceAssetChainID: selectedFromChain.chainID,
        destAssetDenom: ibcDenom ?? values.selectedToken.coreDenom,
        destAssetChainID: selectedToChain.chainID,
        amountIn: amountInBaseUnits,
        amountOut: route.estimatedAmountOut ?? '',
        addressList: addressList.map(user => user.address),
        operations: route.operations,
        estimatedAmountOut: route.estimatedAmountOut ?? '',
        slippageTolerancePercent: '1',
        affiliates: [],
        chainIDsToAffiliates: {},
        postRouteHandler: undefined,
        enableGasWarnings: false,
      });

      await skipClient.executeRoute({
        route,
        userAddresses,
        simulate: true,
        // Executes after all of the operations triggered by a user's signature complete.
        // For multi-tx routes that require multiple user signatures, this will be called once for each tx in sequence
        onTransactionCompleted: async (chainID, txHash, status) => {
          console.log(`Route completed with tx hash: ${txHash} & status: ${status.state}`);
        },
        // called after the transaction that the user signs gets broadcast on chain
        onTransactionBroadcast: async ({ txHash, chainID }) => {
          console.log(`Transaction broadcasted with tx hash: ${txHash}`);
        },
        // called after the transaction that the user signs is successfully registered for tracking
        onTransactionTracked: async ({ txHash, chainID }) => {
          console.log(`Transaction tracked with tx hash: ${txHash}`);
        },
        // called after the user signs a transaction
        onTransactionSigned: async ({ chainID }) => {
          console.log(`Transaction signed with chain ID: ${chainID}`);
        },
        // validate gas balance on each chain
        onValidateGasBalance: async ({ chainID, txIndex, status }) => {
          console.log(`Validating gas balance for chain ${chainID}...`);
        },
      });

      // const transferMsg = transfer({
      //   sourcePort: source_port,
      //   sourceChannel: source_channel,
      //   sender: admin
      //     ? admin
      //     : selectedFromChain.id === env.osmosisChain
      //       ? (chains?.osmosistestnet?.address ?? '')
      //       : (address ?? ''),
      //   receiver: values.recipient ?? '',
      //   token,
      //   timeoutHeight: {
      //     revisionNumber: BigInt(0),
      //     revisionHeight: BigInt(0),
      //   },
      //   timeoutTimestamp: BigInt(timeoutInNanos),
      // });

      // const msg = isGroup
      //   ? submitProposal({
      //       groupPolicyAddress: admin!,
      //       messages: [
      //         Any.fromPartial({
      //           typeUrl: MsgTransfer.typeUrl,
      //           value: MsgTransfer.encode(transferMsg.value).finish(),
      //         }),
      //       ],
      //       metadata: '',
      //       proposers: [address],
      //       title: `IBC Transfer`,
      //       summary: `This proposal will send ${values.amount} ${values.selectedToken.metadata?.display} to ${values.recipient} via IBC transfer`,
      //       exec: 0,
      //     })
      //   : transferMsg;

      // const fee = await estimateFee(
      //   selectedFromChain.id === env.osmosisChain
      //     ? (chains.osmosistestnet.address ?? '')
      //     : (address ?? ''),
      //   [msg]
      // );

      // await tx([msg], {
      //   memo: values.memo,
      //   fee,
      //   onSuccess: () => {
      //     refetchBalances();
      //     refetchHistory();
      //     refetchOsmosisBalances();
      //     resolveOsmosisRefetch();
      //     refetchProposals?.();
      //   },
      // });
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
                {/* From Chain */}
                <div className={`w-full ${isIbcTransfer ? 'block' : 'hidden'}`}>
                  {isGroup ? (
                    // Static display for groups
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
                  ) : (
                    // Dropdown for non-group transfers
                    <div className="dropdown dropdown-end w-full">
                      <div className="flex flex-col gap-1 justify-center items-start">
                        <span className="label-text text-sm font-medium text-[#00000099] dark:text-[#FFFFFF99]">
                          From Chain
                        </span>
                        <label
                          tabIndex={0}
                          aria-label="from-chain-selector"
                          role="combobox"
                          aria-expanded="false"
                          aria-controls="from-chain-dropdown"
                          aria-haspopup="listbox"
                          style={{ borderRadius: '12px' }}
                          className="btn btn-md btn-dropdown w-full justify-between border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A]"
                        >
                          <span className="flex items-center">
                            {selectedFromChain && (
                              <Image
                                src={
                                  ibcChains.find(chain => chain.id === selectedFromChain.id)
                                    ?.icon || ''
                                }
                                alt={
                                  ibcChains.find(chain => chain.id === selectedFromChain.id)
                                    ?.name || ''
                                }
                                width={24}
                                height={24}
                                className="mr-2"
                              />
                            )}
                            <span className={selectedFromChain ? 'ml-2' : ''}>
                              {ibcChains.find(chain => chain.id === selectedFromChain.id)?.name ??
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
                            aria-selected={selectedFromChain.id === chain.id}
                          >
                            <a
                              onClick={e => {
                                if (chain.id === selectedFromChain.id) {
                                  return;
                                }
                                setSelectedFromChain(chain);
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
                                  if (chain.id === selectedFromChain.id) {
                                    return;
                                  }
                                  setSelectedFromChain(chain);
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
                                chain.id === selectedFromChain.id
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                              style={
                                chain.id === selectedFromChain.id
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
                  )}
                </div>
                {/* Switch Button */}
                <div
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
                            chain.id === selectedToChain.id ? { pointerEvents: 'none' } : undefined
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

                          return formatTokenDisplayName(tokenDisplayName);
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
                                      : tokenDisplayName.startsWith('u')
                                        ? tokenDisplayName.slice(1).toUpperCase()
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
function useSkip(getCosmosSigner: () => Promise<import('@cosmjs/amino').OfflineAminoSigner>) {
  throw new Error('Function not implemented.');
}
