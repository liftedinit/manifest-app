import React, { useMemo, useState } from 'react';
import { useFeeEstimation, useTx } from '@/hooks';
import { cosmos } from '@liftedinit/manifestjs';
import { PiCaretDownBold } from 'react-icons/pi';
import { parseNumberToBigInt, shiftDigits, truncateString } from '@/utils';
import { CombinedBalanceInfo } from '@/utils/types';
import { DenomDisplay } from '@/components/factory';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput } from '@/components/react/inputs';
import { SearchIcon } from '@/components/icons';
import { TailwindModal } from '@/components/react/modal';
import { MdContacts } from 'react-icons/md';
import env from '@/config/env';
import { Any } from 'cosmjs-types/google/protobuf/any';
import { MsgSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';
import { AmountInput } from '@/components';

export default function SendForm({
  address,
  balances,
  isBalancesLoading,
  refetchBalances,
  refetchHistory,
  selectedDenom,
  isGroup,
  admin,
  refetchProposals,
}: Readonly<{
  address: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
  refetchHistory: () => void;
  selectedDenom?: string;
  isGroup?: boolean;
  admin?: string;
  refetchProposals?: () => void;
}>) {
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feeWarning, setFeeWarning] = useState('');
  const { tx } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);
  const { send } = cosmos.bank.v1beta1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  const filteredBalances = balances?.filter(token => {
    const displayName = token.metadata?.display ?? token.display;
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const initialSelectedToken = useMemo(() => {
    return balances?.find(token => token.base === selectedDenom) || balances?.[0] || null;
  }, [balances, selectedDenom]);

  // Loading state checks
  if (isBalancesLoading || !initialSelectedToken) {
    return null;
  }

  const validationSchema = Yup.object().shape({
    recipient: Yup.string()
      .required('Recipient is required')
      .manifestAddress()
      .test(
        'recipient-has-prefix',
        'Recipient prefix must match recipient chain',
        function (value) {
          if (!value) return true;
          return value.startsWith('manifest');
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

      const msg = isGroup
        ? submitProposal({
            groupPolicyAddress: admin!,
            messages: [
              Any.fromPartial({
                typeUrl: MsgSend.typeUrl,
                value: MsgSend.encode(
                  send({
                    fromAddress: admin!,
                    toAddress: values.recipient,
                    amount: [{ denom: values.selectedToken.base, amount: amountInBaseUnits }],
                  }).value
                ).finish(),
              }),
            ],
            metadata: '',
            proposers: [address],
            title: `Send Tokens`,
            summary: `This proposal will send ${values.amount} ${values.selectedToken.metadata?.display} to ${values.recipient}`,
            exec: 0,
          })
        : send({
            fromAddress: address,
            toAddress: values.recipient,
            amount: [{ denom: values.selectedToken.base, amount: amountInBaseUnits }],
          });

      const fee = await estimateFee(address, [msg]);

      let txResult = await tx([msg], {
        memo: values.memo,
        fee,
        onSuccess: () => {
          refetchBalances();
          refetchHistory();
          refetchProposals?.();
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
      className="text-sm bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] px-6 pb-6 pt-4 w-full h-full animate-fadeIn duration-400"
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
                      onValueChange={value => setFieldValue('amount', value)}
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
                          role="listbox"
                          aria-label="Token selection"
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
                                aria-label={token.metadata?.display}
                              >
                                <a className="flex flex-row items-center gap-2 px-2 py-2">
                                  <DenomDisplay withBackground={false} metadata={token?.metadata} />
                                </a>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs mt-1 flex justify-between text-[#00000099] dark:text-[#FFFFFF99]">
                    <div className="flex flex-row gap-1 ml-1">
                      <span>
                        Balance:{'  '}
                        {selectedTokenBalance
                          ? Number(
                              shiftDigits(
                                Number(selectedTokenBalance.amount),
                                -(selectedTokenBalance.metadata?.denom_units[1]?.exponent ?? 6)
                              )
                            ).toLocaleString()
                          : Number(
                              shiftDigits(
                                Number(values.selectedToken?.amount ?? 0),
                                -(values.selectedToken?.metadata?.denom_units[1]?.exponent ?? 6)
                              )
                            ).toLocaleString()}
                      </span>

                      <span className="">
                        {values.selectedToken?.metadata?.display?.startsWith('factory')
                          ? values.selectedToken?.metadata?.display?.split('/').pop()?.toUpperCase()
                          : truncateString(
                              values.selectedToken?.metadata?.display ?? '',
                              10
                            ).toUpperCase()}
                      </span>
                      <button
                        type="button"
                        className="text-xs text-primary"
                        onClick={() => {
                          if (!selectedTokenBalance) return;

                          const exponent =
                            selectedTokenBalance.metadata?.denom_units[1]?.exponent ?? 6;
                          const maxAmount =
                            Number(selectedTokenBalance.amount) / Math.pow(10, exponent);

                          let adjustedMaxAmount = maxAmount;
                          if (values.selectedToken.base === 'umfx') {
                            adjustedMaxAmount = Math.max(0, maxAmount - 0.1);
                          }

                          const decimals =
                            selectedTokenBalance.metadata?.denom_units[1]?.exponent ?? 6;
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
