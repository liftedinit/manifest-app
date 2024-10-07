import React, { useState } from 'react';
import { chainName } from '@/config';
import { useFeeEstimation, useGroupsByAdmin, useTx } from '@/hooks';
import { cosmos, manifest, osmosis, liftedinit } from '@chalabi/manifestjs';
import { MetadataSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { PiAddressBook, PiPlusCircle, PiMinusCircle } from 'react-icons/pi';
import { shiftDigits } from '@/utils';
import { Any } from '@chalabi/manifestjs/dist/codegen/google/protobuf/any';
import { MsgPayout } from '@chalabi/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import { MultiMintModal } from '../modals/multiMfxMintModal';
import { useToast } from '@/contexts';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { NumberInput, TextInput } from '@/components/react/inputs';

interface PayoutPair {
  address: string;
  amount: string;
}

export default function MintForm({
  admin,
  denom,
  address,
  refetch,
  balance,
  isAdmin,
}: Readonly<{
  admin: string;
  denom: MetadataSDKType;
  address: string;
  refetch: () => void;
  balance: string;
  isAdmin: boolean;
}>) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(address);
  const [isSigning, setIsSigning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutPairs, setPayoutPairs] = useState<PayoutPair[]>([{ address: '', amount: '' }]);
  const { setToastMessage } = useToast();
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { mint } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const { payout } = liftedinit.manifest.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const exponent = denom?.denom_units?.find(unit => unit.denom === denom.display)?.exponent || 0;
  const isMFX = denom.base.includes('mfx');

  const MintSchema = Yup.object().shape({
    amount: Yup.number()
      .positive('Amount must be positive')
      .required('Amount is required')
      .max(1e12, 'Amount is too large'),
    recipient: Yup.string().required('Recipient address is required').manifestAddress(),
  });

  const handleMint = async () => {
    if (!amount || isNaN(Number(amount))) {
      return;
    }
    setIsSigning(true);
    try {
      const amountInBaseUnits = BigInt(parseFloat(amount) * Math.pow(10, exponent)).toString();

      let msg;
      if (isMFX) {
        const payoutMsg = payout({
          authority: admin ?? '',
          payoutPairs: [
            {
              address: recipient,
              coin: { denom: denom.base, amount: amountInBaseUnits },
            },
          ],
        });
        const encodedMessage = Any.fromPartial({
          typeUrl: payoutMsg.typeUrl,
          value: MsgPayout.encode(payoutMsg.value).finish(),
        });
        msg = submitProposal({
          groupPolicyAddress: admin ?? '',
          messages: [encodedMessage],
          metadata: '',
          proposers: [address ?? ''],
          title: `Manifest Module Control: Mint MFX`,
          summary: `This proposal includes a mint action for MFX.`,
          exec: 0,
        });
      } else {
        msg = mint({
          amount: {
            amount: amountInBaseUnits,
            denom: denom.base,
          },
          sender: address,
          mintToAddress: recipient,
        });
      }

      const fee = await estimateFee(address ?? '', [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          setAmount('');
          refetch();
        },
      });
    } catch (error) {
      console.error('Error during minting:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleMultiMint = async () => {
    if (payoutPairs.some(pair => !pair.address || !pair.amount || isNaN(Number(pair.amount)))) {
      setToastMessage({
        type: 'alert-error',
        title: 'Missing fields',
        description: 'Please fill in all fields with valid values.',
        bgColor: '#e74c3c',
      });
      return;
    }
    setIsSigning(true);
    try {
      const payoutMsg = payout({
        authority: admin ?? '',
        payoutPairs: payoutPairs.map(pair => ({
          address: pair.address,
          coin: {
            denom: denom.base,
            amount: BigInt(parseFloat(pair.amount) * Math.pow(10, exponent)).toString(),
          },
        })),
      });
      const encodedMessage = Any.fromAmino({
        type: payoutMsg.typeUrl,
        value: MsgPayout.encode(payoutMsg.value).finish(),
      });
      const msg = submitProposal({
        groupPolicyAddress: admin ?? '',
        messages: [encodedMessage],
        metadata: '',
        proposers: [address ?? ''],
        title: `Manifest Module Control: Multi Mint MFX`,
        summary: `This proposal includes multiple mint actions for MFX.`,
        exec: 0,
      });

      const fee = await estimateFee(address ?? '', [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          setPayoutPairs([{ address: '', amount: '' }]);
          setIsModalOpen(false);
          refetch();
        },
      });
    } catch (error) {
      console.error('Error during multi-minting:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const addPayoutPair = () => setPayoutPairs([...payoutPairs, { address: '', amount: '' }]);
  const removePayoutPair = (index: number) =>
    setPayoutPairs(payoutPairs.filter((_, i) => i !== index));
  const updatePayoutPair = (index: number, field: 'address' | 'amount', value: string) => {
    const newPairs = [...payoutPairs];
    newPairs[index][field] = value;
    setPayoutPairs(newPairs);
  };

  return (
    <div className="animate-fadeIn text-sm z-10">
      <div className="rounded-lg mb-8">
        {isMFX && !isAdmin ? (
          <div className="w-full p-2 justify-center items-center my-auto h-full mt-24 leading-tight text-xl flex flex-col font-medium text-pretty">
            <span>You are not affiliated with any PoA Admin entity.</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">NAME</p>
                <div className="bg-base-300 p-4 rounded-md">
                  <p className="font-semibold text-md max-w-[20ch] truncate text-black dark:text-white">
                    {denom.name}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">
                  YOUR BALANCE
                </p>
                <div className="bg-base-300 p-4 rounded-md">
                  <p className="font-semibold text-md text-black dark:text-white">
                    {shiftDigits(balance, -exponent)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">EXPONENT</p>
                <div className="bg-base-300 p-4 rounded-md">
                  <p className="font-semibold text-md text-black dark:text-white">
                    {denom?.denom_units[1]?.exponent}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">
                  CIRCULATING SUPPLY
                </p>
                <div className="bg-base-300 p-4 rounded-md">
                  <p className="font-semibold text-md max-w-[20ch] truncate text-black dark:text-white">
                    {denom.display}
                  </p>
                </div>
              </div>
            </div>
            <Formik
              initialValues={{ amount: '', recipient: address }}
              validationSchema={MintSchema}
              onSubmit={values => {
                setAmount(values.amount);
                setRecipient(values.recipient);
                handleMint();
              }}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ isValid, dirty, setFieldValue, errors, touched }) => (
                <Form>
                  <div className="flex space-x-4 mt-8">
                    <div className="flex-grow relative">
                      <NumberInput
                        showError={false}
                        label="AMOUNT"
                        name="amount"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setAmount(e.target.value);
                          setFieldValue('amount', e.target.value);
                        }}
                        className={`input input-bordered w-full ${
                          touched.amount && errors.amount ? 'input-error' : ''
                        }`}
                      />
                      {touched.amount && errors.amount && (
                        <div
                          className="tooltip tooltip-bottom tooltip-open tooltip-error bottom-0 absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs"
                          data-tip={errors.amount}
                        >
                          <div className="w-0 h-0"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow relative">
                      <TextInput
                        showError={false}
                        label="RECIPIENT"
                        name="recipient"
                        placeholder="Recipient address"
                        value={recipient}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setRecipient(e.target.value);
                          setFieldValue('recipient', e.target.value);
                        }}
                        className={`input input-bordered w-full ${
                          touched.recipient && errors.recipient ? 'input-error' : ''
                        }`}
                        rightElement={
                          <button
                            type="button"
                            onClick={() => {
                              setRecipient(address);
                              setFieldValue('recipient', address);
                            }}
                            className="btn btn-primary btn-sm text-white absolute right-2 top-1/2 transform -translate-y-1/2"
                          >
                            <PiAddressBook className="w-5 h-5" />
                          </button>
                        }
                      />
                      {touched.recipient && errors.recipient && (
                        <div
                          className="tooltip tooltip-bottom tooltip-open tooltip-error bottom-0 absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs"
                          data-tip={errors.recipient}
                        >
                          <div className="w-0 h-0"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 space-x-2">
                    <button
                      type="submit"
                      className="btn btn-gradient btn-md flex-grow text-white"
                      disabled={isSigning || !isValid || !dirty}
                    >
                      {isSigning ? (
                        <span className="loading loading-dots loading-xs"></span>
                      ) : (
                        'Mint'
                      )}
                    </button>
                    {isMFX && (
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary btn-md"
                        aria-label="multi-mint-button"
                      >
                        Multi Mint
                      </button>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
            <MultiMintModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              payoutPairs={payoutPairs}
              updatePayoutPair={updatePayoutPair}
              addPayoutPair={addPayoutPair}
              removePayoutPair={removePayoutPair}
              handleMultiMint={handleMultiMint}
              isSigning={isSigning}
            />
          </>
        )}
      </div>
    </div>
  );
}
