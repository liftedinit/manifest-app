import React, { useState, useEffect } from 'react';
import { chainName } from '@/config';
import { useFeeEstimation, useTx } from '@/hooks';
import { ibc } from '@chalabi/manifestjs';
import { getIbcInfo } from '@/utils';
import { PiAddressBook, PiCaretDownBold } from 'react-icons/pi';
import { CombinedBalanceInfo } from '@/pages/bank';
import { DenomImage } from '@/components/factory';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput } from '@/components/react/inputs';
import { IbcChain } from '../components/sendBox';
import Image from 'next/image';
import { shiftDigits } from '@/utils';

export default function IbcSendForm({
  address,
  destinationChain,
  balances,
  isBalancesLoading,
  refetchBalances,
  isIbcTransfer,
  setIsIbcTransfer,
  ibcChains,
  selectedChain,
  setSelectedChain,
}: Readonly<{
  address: string;
  destinationChain: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
  isIbcTransfer: boolean;
  setIsIbcTransfer: (isIbcTransfer: boolean) => void;
  ibcChains: IbcChain[];
  selectedChain: string;
  setSelectedChain: (selectedChain: string) => void;
}>) {
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { transfer } = ibc.applications.transfer.v1.MessageComposer.withTypeUrl;

  const filteredBalances = balances?.filter(token =>
    token.metadata?.display.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initialSelectedToken = balances && balances.length > 0 ? balances[0] : null;

  const validationSchema = Yup.object().shape({
    recipient: Yup.string().required('Recipient is required').manifestAddress(),
    amount: Yup.string()
      .required('Amount is required')
      .test('valid-amount', 'Invalid amount', value => {
        return /^\d*\.?\d*$/.test(value);
      })
      .test('positive', 'Amount must be positive', value => {
        return parseFloat(value) > 0;
      })
      .test('sufficient-balance', 'Insufficient balance', function (value) {
        const { selectedToken } = this.parent;
        if (!selectedToken) return false;
        const balance = parseFloat(selectedToken.amount);
        return parseFloat(value) <= balance;
      }),
    selectedToken: Yup.object().required('Please select a token'),
    memo: Yup.string().max(255, 'Memo must be less than 255 characters'),
  });

  const handleSend = async (values: {
    recipient: string;
    amount: string;
    selectedToken: CombinedBalanceInfo;
    memo: string;
  }) => {
    setIsSending(true);
    try {
      const exponent =
        values.selectedToken.metadata?.denom_units.find(
          unit => unit.denom === values.selectedToken.denom
        )?.exponent ?? 6;

      const amountInSmallestUnit = parseFloat(values.amount) * Math.pow(10, exponent);
      const amountInBaseUnits = Math.floor(amountInSmallestUnit).toString();

      const { source_port, source_channel } = getIbcInfo(chainName ?? '', destinationChain ?? '');

      const token = {
        denom: values.selectedToken.coreDenom,
        amount: amountInBaseUnits,
      };

      const stamp = Date.now();
      const timeoutInNanos = (stamp + 1.2e6) * 1e6;

      const msg = transfer({
        sourcePort: source_port,
        sourceChannel: source_channel,
        sender: address ?? '',
        receiver: values.recipient ?? '',
        token,
        //@ts-ignore
        timeoutHeight: undefined,
        //@ts-ignore
        timeoutTimestamp: timeoutInNanos,
      });

      const fee = await estimateFee(address, [msg]);

      await tx([msg], {
        memo: values.memo,
        fee,
        onSuccess: () => {
          refetchBalances();
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
          selectedToken: initialSelectedToken ?? ({} as CombinedBalanceInfo),
          memo: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSend}
      >
        {({ isValid, dirty, setFieldValue, values }) => (
          <Form className="space-y-6 flex flex-col items-center max-w-md mx-auto">
            <div className="w-full space-y-4">
              <div className={`dropdown dropdown-end w-full ${isIbcTransfer ? 'block' : 'hidden'}`}>
                <div className="flex flex-col gap-1 justify-center items-start">
                  <span className="label-text text-sm font-medium text-[#00000099] dark:text-[#FFFFFF99]">
                    Chain
                  </span>
                  <label
                    tabIndex={0}
                    style={{ borderRadius: '12px' }}
                    className="btn   btn-md btn-dropdown w-full justify-between border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A]"
                  >
                    <span className="flex items-center">
                      {selectedChain && (
                        <Image
                          src={ibcChains.find(chain => chain.id === selectedChain)?.icon || ''}
                          alt={ibcChains.find(chain => chain.id === selectedChain)?.name || ''}
                          width={24}
                          height={24}
                          className="mr-2"
                        />
                      )}
                      <span className={selectedChain ? 'ml-2' : ''}>
                        {ibcChains.find(chain => chain.id === selectedChain)?.name ??
                          'Select Chain'}
                      </span>
                    </span>
                    <PiCaretDownBold />
                  </label>
                </div>

                <ul
                  tabIndex={0}
                  className="dropdown-content z-[100] menu p-2 shadow dark:bg-[#0E0A1F] bg-[#F0F0FF] rounded-lg w-full mt-1"
                >
                  {ibcChains.map(chain => (
                    <li key={chain.id}>
                      <a
                        onClick={() => setSelectedChain(chain.id)}
                        className="flex items-center"
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

              <div className="w-full">
                <label className="label">
                  <span className="label-text text-md font-medium text-[#00000099] dark:text-[#FFFFFF99]">
                    Amount
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="amount"
                    placeholder="0.00"
                    value={values.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        setFieldValue('amount', value);
                      }
                    }}
                    style={{ borderRadius: '12px' }}
                    className="input input-md border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full pr-24"
                  />
                  <div className="absolute inset-y-1 right-1 flex items-center">
                    <div className="dropdown dropdown-end h-full">
                      <label
                        tabIndex={0}
                        className="btn btn-sm h-full px-3 bg-[#FFFFFF] dark:bg-[#FFFFFF0F] border-none hover:bg-transparent"
                      >
                        <DenomImage denom={values.selectedToken?.metadata} />
                        {values.selectedToken?.metadata?.display.toUpperCase() ?? 'Select'}
                        <PiCaretDownBold className="ml-1" />
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[100] menu p-2 shadow  dark:bg-[#0E0A1F] bg-[#F0F0FF]  rounded-lg w-full mt-1 h-62 max-h-62 min-h-62 min-w-44 overflow-y-auto"
                      >
                        <li className="sticky top-0 bg-transparent z-10 hover:bg-transparent mb-2">
                          <div className="px-2 py-1">
                            <input
                              type="text"
                              placeholder="Search tokens..."
                              className="input input-sm w-full pr-8 focus:outline-none focus:ring-0 border-none bg-transparent"
                              onChange={e => setSearchTerm(e.target.value)}
                              style={{ boxShadow: 'none' }}
                            />
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          </div>
                        </li>
                        {isBalancesLoading ? (
                          <li>
                            <a>Loading tokens...</a>
                          </li>
                        ) : (
                          filteredBalances?.map(token => (
                            <li
                              key={token.coreDenom}
                              onClick={() => setFieldValue('selectedToken', token)}
                              className="flex justify-start mb-2"
                              aria-label={token.metadata?.display}
                            >
                              <a className="flex-row justify-start gap-3 items-center w-full">
                                <DenomImage denom={token.metadata} />
                                {token.metadata?.display.toUpperCase()}
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
                      Balance:{'  '}
                      {shiftDigits(
                        Number(values.selectedToken.amount),
                        -(values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6)
                      )}
                    </span>
                    <span className="text-primary">
                      {values.selectedToken?.metadata?.display?.toUpperCase() || ''}
                    </span>
                  </div>
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
                className="btn btn-gradient w-full"
                disabled={isSending || !isValid || !dirty}
                aria-label="send-btn"
              >
                {isSending ? <span className="loading loading-dots loading-xs"></span> : 'Send'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
