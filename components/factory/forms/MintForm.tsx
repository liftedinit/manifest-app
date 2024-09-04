import React, { useState } from 'react';
import { chainName } from '@/config';
import { useFeeEstimation, useGroupsByAdmin, useTx } from '@/hooks';
import { cosmos, manifest, osmosis } from '@chalabi/manifestjs';
import { MetadataSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { PiAddressBook, PiPlusCircle, PiMinusCircle } from 'react-icons/pi';
import { shiftDigits } from '@/utils';
import { Any } from '@chalabi/manifestjs/dist/codegen/google/protobuf/any';
import { MsgPayout } from '@chalabi/manifestjs/dist/codegen/manifest/v1/tx';
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
  const { payout } = manifest.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const exponent = denom?.denom_units?.find(unit => unit.denom === denom.display)?.exponent || 0;
  const isMFX = denom.base.includes('mfx');

  const MintSchema = Yup.object().shape({
    amount: Yup.number()
      .positive('Amount must be positive')
      .required('Amount is required')
      .max(1e12, 'Amount is too large'),
    recipient: Yup.string()
      .required('Recipient address is required')
      .manifestAddress('Invalid address format'),
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
                <p className="text-sm text-gray-500">NAME</p>
                <p className="font-semibold text-md max-w-[20ch] truncate">{denom.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">YOUR BALANCE</p>
                <p className="font-semibold text-md">{shiftDigits(balance, -exponent)}</p>
              </div>
              <div>
                <p className="text-md text-gray-500">EXPONENT</p>
                <p className="font-semibold text-md">{denom?.denom_units[1]?.exponent}</p>
              </div>
              <div>
                <p className="text-md text-gray-500">CIRCULATING SUPPLY</p>
                <p className="font-semibold text-md max-w-[20ch] truncate">{denom.display}</p>
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
                  <div className="flex space-x-4 mt-8 ">
                    <div className="flex-1">
                      <NumberInput
                        label="AMOUNT"
                        aria-label="mint-amount-input"
                        name="amount"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setAmount(e.target.value);
                          setFieldValue('amount', e.target.value);
                        }}
                      />
                    </div>
                    <div className="flex-1 ">
                      <div className="flex flex-row items-center">
                        <TextInput
                          label="RECIPIENT"
                          aria-label="mint-recipient-input"
                          name="recipient"
                          placeholder="Recipient address"
                          value={recipient}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setRecipient(e.target.value);
                            setFieldValue('recipient', e.target.value);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setRecipient(address)}
                          className="btn btn-primary btn-sm h-10 rounded-tr-lg rounded-br-lg rounded-bl-none rounded-tl-none"
                        >
                          <PiAddressBook className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 space-x-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-md flex-grow"
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
