import React, { useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import { TextInput } from '@/components/react/inputs';
import Yup from '@/utils/yupExtensions';
import { useTokenBalances, useTokenBalancesResolved, useTokenFactoryDenomsMetadata } from '@/hooks';
import { CombinedBalanceInfo } from '@/utils/types'; // Import the CombinedBalanceInfo type
import { DenomImage } from '@/components/factory';
import { PiCaretDownBold } from 'react-icons/pi';
import { shiftDigits, truncateString } from '@/utils';

interface SendMessageFormProps {
  address: string;
  message: any;
  index: number;
  handleChange: (field: string, value: any) => void;
}

const SendMessageForm: React.FC<SendMessageFormProps> = ({
  address,
  message,
  index,
  handleChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feeWarning, setFeeWarning] = useState('');

  // Fetch token balances, resolved balances, and metadata
  const { balances, isBalancesLoading } = useTokenBalances(address);
  const { balances: resolvedBalances, isBalancesLoading: resolvedLoading } =
    useTokenBalancesResolved(address);
  const { metadatas, isMetadatasLoading } = useTokenFactoryDenomsMetadata();

  // Combine balances with metadata
  const combinedBalances = useMemo(() => {
    if (!balances || !resolvedBalances || !metadatas) return [];

    return balances.map((coreBalance): CombinedBalanceInfo => {
      const resolvedBalance = resolvedBalances.find(
        rb => rb.denom === coreBalance.denom || rb.denom === coreBalance.denom.split('/').pop()
      );
      const metadata = metadatas.metadatas.find(m => m.base === coreBalance.denom);

      return {
        denom: resolvedBalance?.denom || coreBalance.denom,
        coreDenom: coreBalance.denom,
        amount: coreBalance.amount,
        metadata: metadata || null,
      };
    });
  }, [balances, resolvedBalances, metadatas]);

  const filteredBalances = combinedBalances?.filter(token =>
    token.metadata?.display.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initialSelectedToken =
    combinedBalances?.find(token => token.denom === 'umfx') || combinedBalances?.[0] || null;

  const validationSchema = Yup.object().shape({
    amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
    to_address: Yup.string().required('Recipient address is required').manifestAddress(),
    denom: Yup.string().required('Denomination is required'),
    selectedToken: Yup.object().required('Please select a token'),
    memo: Yup.string().max(255, 'Memo must be less than 255 characters'),
  });

  const formatAmount = (amount: number, decimals: number) => {
    return amount.toFixed(decimals).replace(/\.?0+$/, '');
  };

  return (
    <div style={{ borderRadius: '24px' }} className="text-sm w-full h-full p-2">
      <Formik
        initialValues={{
          amount: '',
          to_address: message.to_address ?? '',
          memo: message.memo ?? '',
          selectedToken: initialSelectedToken,
        }}
        validationSchema={validationSchema}
        onSubmit={() => {}}
        validateOnChange={true}
      >
        {({ values, setFieldValue, errors }) => (
          <Form className="space-y-6 flex flex-col items-center mx-auto">
            <div className="w-full space-y-4">
              {/* Amount Input */}
              <div className="w-full">
                <label className="label">
                  <span className="label-text text-md font-medium text-[#00000099] dark:text-[#FFFFFF99]">
                    Amount
                  </span>
                </label>
                <div className="relative">
                  <input
                    className="input input-md border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full pr-24 dark:text-[#FFFFFF] text-[#161616]"
                    name="amount"
                    placeholder="0.00"
                    style={{ borderRadius: '12px' }}
                    value={values.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0) {
                        setFieldValue('amount', value);
                        handleChange('amount', value);
                      }
                    }}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (!/[\d.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />

                  <div className="absolute inset-y-1 right-1 flex items-center">
                    <div className="dropdown dropdown-end h-full">
                      <label
                        aria-label="token-selector"
                        tabIndex={0}
                        className="btn btn-sm h-full px-3 bg-[#FFFFFF] dark:bg-[#FFFFFF0F] border-none hover:bg-transparent"
                      >
                        {values.selectedToken?.metadata ? (
                          <DenomImage denom={values.selectedToken?.metadata} />
                        ) : null}

                        {values.selectedToken?.metadata?.display.startsWith('factory')
                          ? values.selectedToken?.metadata?.display?.split('/').pop()?.toUpperCase()
                          : truncateString(
                              values.selectedToken?.metadata?.display ?? 'Select',
                              10
                            ).toUpperCase()}
                        <PiCaretDownBold className="ml-1" />
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[100] menu p-2 shadow bg-base-300 rounded-lg w-full mt-1 h-62 max-h-62 min-h-62 min-w-44 overflow-y-auto dark:text-[#FFFFFF] text-[#161616]"
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
                              onClick={() => {
                                setFieldValue('selectedToken', token);
                                setFieldValue('denom', token.coreDenom);
                                handleChange('denom', token.coreDenom);
                              }}
                              className="flex justify-start mb-2"
                              aria-label={token.metadata?.display}
                            >
                              <a className="flex-row justify-start gap-3 items-center w-full">
                                <DenomImage denom={token?.metadata} />
                                {token.metadata?.display.startsWith('factory')
                                  ? token.metadata?.display.split('/').pop()?.toUpperCase()
                                  : truncateString(token.metadata?.display ?? '', 10).toUpperCase()}
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
                      {values.selectedToken
                        ? (() => {
                            const exponent =
                              values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
                            const amount = shiftDigits(
                              Number(values.selectedToken.amount),
                              -exponent
                            );
                            return Number(amount) < 0.01 ? '> 0.01' : amount;
                          })()
                        : '0'}
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
                        handleChange('amount', formattedAmount);
                      }}
                    >
                      MAX
                    </button>
                  </div>
                  {errors.amount && typeof errors.amount === 'string' && (
                    <div className="text-red-500 text-xs">{errors.amount}</div>
                  )}
                  {feeWarning && !errors.amount && (
                    <div className="text-yellow-500 text-xs">{feeWarning}</div>
                  )}
                </div>
              </div>

              {/* Recipient Input */}
              <TextInput
                label="Send To"
                name="to_address"
                placeholder="Enter address"
                value={values.to_address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue('to_address', e.target.value);
                  handleChange('to_address', e.target.value);
                }}
                className="input-md w-full"
                style={{ borderRadius: '12px' }}
              />

              {/* Memo Input */}
              <TextInput
                label="Memo (optional)"
                name="memo"
                placeholder="Memo"
                style={{ borderRadius: '12px' }}
                value={values.memo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue('memo', e.target.value);
                  handleChange('memo', e.target.value);
                }}
                className="input-md w-full"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SendMessageForm;
