import React, { useState } from 'react';
import { Formik, Form, FieldArray, Field, FieldProps } from 'formik';
import Yup from '@/utils/yupExtensions';
import { NumberInput, TextInput } from '@/components/react/inputs';
import { PiAddressBook } from 'react-icons/pi';
import { PlusIcon, MinusIcon } from '@/components/icons';
import { useTx, useFeeEstimation } from '@/hooks';
import { chainName } from '@/config';
import { cosmos, liftedinit } from '@chalabi/manifestjs';
import { Any } from '@chalabi/manifestjs/dist/codegen/google/protobuf/any';
import { MsgPayout } from '@chalabi/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';

interface PayoutPair {
  address: string;
  amount: string;
}

interface MultiMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: string;
  address: string;
  denom: any;
  exponent: number;
  refetch: () => void;
}

const PayoutPairSchema = Yup.object().shape({
  address: Yup.string().manifestAddress().required('Required'),
  amount: Yup.number().positive('Amount must be positive').required('Required'),
});

const MultiMintSchema = Yup.object().shape({
  payoutPairs: Yup.array()
    .of(PayoutPairSchema)
    .min(1, 'At least one payout pair is required')
    .test('unique-address', 'Addresses must be unique', function (pairs) {
      if (!pairs) return true;
      const addresses = pairs.map(pair => pair.address);
      const uniqueAddresses = new Set(addresses);
      return uniqueAddresses.size === addresses.length;
    }),
});

export function MultiMintModal({
  isOpen,
  onClose,
  admin,
  address,
  denom,
  exponent,
  refetch,
}: MultiMintModalProps) {
  const [payoutPairs, setPayoutPairs] = useState([{ address: '', amount: '' }]);
  const { tx, isSigning, setIsSigning } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { payout } = liftedinit.manifest.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const updatePayoutPair = (index: number, field: 'address' | 'amount', value: string) => {
    const newPairs = [...payoutPairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    setPayoutPairs(newPairs);
  };

  const addPayoutPair = () => {
    setPayoutPairs([...payoutPairs, { address: '', amount: '' }]);
  };

  const removePayoutPair = (index: number) => {
    setPayoutPairs(payoutPairs.filter((_, i) => i !== index));
  };

  const handleMultiMint = async (values: { payoutPairs: PayoutPair[] }) => {
    setIsSigning(true);
    try {
      const payoutMsg = payout({
        authority: admin,
        payoutPairs: values.payoutPairs.map(pair => ({
          address: pair.address,
          coin: {
            denom: denom.base,
            amount: BigInt(parseFloat(pair.amount) * Math.pow(10, exponent)).toString(),
          },
        })),
      });

      const encodedMessage = Any.fromPartial({
        typeUrl: payoutMsg.typeUrl,
        value: MsgPayout.encode(payoutMsg.value).finish(),
      });

      const msg = submitProposal({
        groupPolicyAddress: admin,
        messages: [encodedMessage],
        metadata: '',
        proposers: [address],
        title: `Manifest Module Control: Multi Mint MFX`,
        summary: `This proposal includes a multi-mint action for MFX.`,
        exec: 0,
      });

      const fee = await estimateFee(address, [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          refetch();
          onClose();
        },
      });
    } catch (error) {
      console.error('Error during multi-mint:', error);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <dialog id="multi_mint_modal" className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-4xl mx-auto min-h-[30vh] max-h-[70vh] rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg overflow-y-auto">
        <form method="dialog" onSubmit={onClose}>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]">
            ✕
          </button>
        </form>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">
          Multi Mint <span className="font-light text-primary">MFX</span>
        </h3>
        <div className="py-4 flex flex-col h-[calc(100%-4rem)]">
          <Formik
            initialValues={{ payoutPairs }}
            validationSchema={MultiMintSchema}
            onSubmit={handleMultiMint}
            validateOnMount={true}
          >
            {({ values, isValid, setFieldValue }) => (
              <Form className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-semibold">Payout Pairs</div>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary text-white"
                    onClick={() => {
                      // Update both Formik state and parent component state
                      setFieldValue('payoutPairs', [
                        ...values.payoutPairs,
                        { address: '', amount: '' },
                      ]);
                      addPayoutPair();
                    }}
                  >
                    <PlusIcon className="text-lg" />
                    <span className="ml-1">Add Payout</span>
                  </button>
                </div>

                <div className="overflow-y-auto flex-grow px-1 max-h-[40vh]">
                  <FieldArray name="payoutPairs">
                    {({ remove }) => (
                      <div className="flex flex-col gap-4 overflow-y-auto">
                        {values.payoutPairs.map((pair, index) => (
                          <div
                            key={index}
                            className="flex relative flex-row dark:bg-[#FFFFFF0A] bg-[#FFFFFF] p-4 gap-2 rounded-lg items-end"
                          >
                            {index > 0 && (
                              <div className="absolute -top-2 left-2 text-xs">#{index + 1}</div>
                            )}
                            <div className="flex-grow relative">
                              <Field name={`payoutPairs.${index}.address`}>
                                {({ field, meta }: FieldProps) => (
                                  <div className="relative">
                                    <TextInput
                                      showError={false}
                                      label="Address"
                                      {...field}
                                      placeholder="manifest1..."
                                      className={`input input-bordered w-full ${
                                        meta.touched && meta.error ? 'input-error' : ''
                                      }`}
                                      rightElement={
                                        <button
                                          type="button"
                                          onClick={() => {
                                            updatePayoutPair(index, 'address', '');
                                            setFieldValue(`payoutPairs.${index}.address`, '');
                                          }}
                                          className="btn btn-primary btn-sm text-white absolute right-2 top-1/2 transform -translate-y-1/2"
                                        >
                                          <PiAddressBook className="w-5 h-5" />
                                        </button>
                                      }
                                    />
                                    {meta.touched && meta.error && (
                                      <div className="tooltip tooltip-bottom tooltip-open tooltip-error bottom-0 absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs">
                                        <div className="w-0 h-0"></div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Field>
                            </div>
                            <div className="flex-grow relative">
                              <Field name={`payoutPairs.${index}.amount`}>
                                {({ field, meta }: FieldProps) => (
                                  <div className="relative">
                                    <NumberInput
                                      showError={false}
                                      label="Amount"
                                      {...field}
                                      placeholder="Enter amount"
                                      className={`input input-bordered w-full ${
                                        meta.touched && meta.error ? 'input-error' : ''
                                      }`}
                                    />
                                    {meta.touched && meta.error && (
                                      <div className="tooltip tooltip-bottom tooltip-open tooltip-error bottom-0 absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs">
                                        <div className="w-0 h-0"></div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Field>
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                className="btn btn-error btn-sm text-white absolute top-3 right-5"
                                onClick={() => {
                                  remove(index);
                                  removePayoutPair(index);
                                }}
                              >
                                <MinusIcon className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                </div>

                <div className="modal-action mt-6">
                  <button className="btn btn-ghost" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-gradient text-white"
                    disabled={isSigning || !isValid}
                  >
                    {isSigning ? (
                      <span className="loading loading-dots loading-md"></span>
                    ) : (
                      'Multi Mint'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
