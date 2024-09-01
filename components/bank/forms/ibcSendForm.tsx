import React, { useState, useEffect } from 'react';
import { chainName } from '@/config';
import { useFeeEstimation, useTx } from '@/hooks';
import { ibc } from '@chalabi/manifestjs';
import { getIbcInfo } from '@/utils';
import { PiAddressBook, PiCaretDownBold } from 'react-icons/pi';
import { CombinedBalanceInfo } from '@/pages/bank';
import { DenomImage } from '@/components/factory';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { TextInput } from '@/components/react/inputs';

export default function IbcSendForm({
  address,
  destinationChain,
  balances,
  isBalancesLoading,
  refetchBalances,
}: Readonly<{
  address: string;
  destinationChain: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
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
    recipient: Yup.string()
      .required('Recipient is required')
      .test('valid-address', 'Invalid address', value => {
        // Use the prefix from the destination chain for validation
        return value?.startsWith(destinationChain) && value.length >= 44;
      }),
    amount: Yup.string()
      .required('Amount is required')
      .test('valid-amount', 'Invalid amount', value => {
        return /^\d*\.?\d*$/.test(value); // Allows integers and decimals
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
  });

  const handleSend = async (values: {
    recipient: string;
    amount: string;
    selectedToken: CombinedBalanceInfo;
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
    <div className="text-sm">
      <Formik
        initialValues={{
          recipient: '',
          amount: '',
          selectedToken: initialSelectedToken ?? ({} as CombinedBalanceInfo),
        }}
        validationSchema={validationSchema}
        onSubmit={handleSend}
      >
        {({ isValid, dirty, setFieldValue, values }) => (
          <Form className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text text-sm font-medium">Token</span>
              </label>
              <div className="dropdown dropdown-end w-full" aria-label="dropdown">
                <label
                  tabIndex={0}
                  className="btn btn-sm bg-base-300 w-full justify-between"
                  aria-label="dropdown-label"
                >
                  {values.selectedToken?.metadata?.display.toUpperCase() ?? 'Select Token'}
                  <PiCaretDownBold className="ml-2" />
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[100] menu p-2 shadow bg-base-300 rounded-lg w-full mt-1 h-62 max-h-62 min-h-62 overflow-y-auto"
                >
                  <li className="sticky top-0 bg-base-300 z-10 hover:bg-transparent">
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
                        className="flex justify-start"
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

            <TextInput
              label="Recipient"
              name="recipient"
              placeholder="Recipient address"
              value={values.recipient}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFieldValue('recipient', e.target.value);
              }}
              className="input-sm"
            />

            <TextInput
              label="Amount"
              name="amount"
              placeholder="Enter amount"
              value={values.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  // Only allow numbers and one decimal point
                  setFieldValue('amount', value);
                }
              }}
              className="input-sm"
            />

            <div className="mt-4">
              <button
                type="submit"
                className="btn btn-primary w-full"
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
