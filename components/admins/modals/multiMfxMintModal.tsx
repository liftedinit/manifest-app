import { Dialog } from '@headlessui/react';
import { cosmos, liftedinit } from '@liftedinit/manifestjs';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MsgPayout } from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import { Field, FieldArray, FieldProps, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { MdContacts } from 'react-icons/md';

import { MinusIcon, PlusIcon } from '@/components/icons';
import { SignModal } from '@/components/react';
import { NumberInput, TextInput } from '@/components/react/inputs';
import { AddressInput } from '@/components/react/inputs/AddressInput';
import env from '@/config/env';
import { useFeeEstimation, useTx } from '@/hooks';
import { parseNumberToBigInt, shiftDigits } from '@/utils';
import Yup from '@/utils/yupExtensions';

//TODO: find max mint amount from team for mfx. Find tx size limit for max payout pairs
interface PayoutPair {
  address: string;
  amount: string;
}

interface MultiMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: string;
  address: string;
  denom: MetadataSDKType | null;
}

const PayoutPairSchema = Yup.object().shape({
  address: Yup.string().manifestAddress().required('Required'),
  amount: Yup.number().positive('Amount must be positive').required('Required'),
});

const MultiMintSchema = Yup.object().shape({
  payoutPairs: Yup.array()
    .of(PayoutPairSchema)
    .max(100, 'Maximum 100 payout pairs allowed')
    .min(1, 'At least one payout pair is required')
    .test('unique-address', 'Addresses must be unique', function (pairs) {
      if (!pairs) return true;
      const addresses = pairs.map(pair => pair.address);
      const uniqueAddresses = new Set(addresses);
      return uniqueAddresses.size === addresses.length;
    }),
});

export function MultiMintModal({ isOpen, onClose, admin, address, denom }: MultiMintModalProps) {
  const [payoutPairs, setPayoutPairs] = useState([{ address: '', amount: '' }]);
  const { tx, isSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);
  const { payout } = liftedinit.manifest.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
    try {
      const exponent = denom?.denom_units?.[1]?.exponent ?? 6;
      const payoutMsg = payout({
        authority: admin,
        payoutPairs: values.payoutPairs.map(pair => ({
          address: pair.address,
          coin: {
            denom: denom?.base ?? '',
            amount: parseNumberToBigInt(pair.amount, exponent).toString(),
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
        title: `Multi Mint MFX`,
        summary: `This proposal includes a multi-mint action for MFX.`,
        exec: 0,
      });

      await tx([msg], {
        fee: () => estimateFee(address, [msg]),
        onSuccess: () => {
          onClose();
        },
      });
    } catch (error) {
      console.error('Error during multi-mint:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      className="modal modal-open mx-auto fixed flex p-0 m-0 top-0"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <Dialog.Panel className="modal-box max-w-4xl mx-auto min-h-[30vh] max-h-[70vh] rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg overflow-y-auto">
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
                            className="flex relative flex-row dark:bg-[#FFFFFF0A] bg-[#FFFFFF] h-full p-4 gap-2 rounded-lg items-end"
                          >
                            {index > 0 && (
                              <div className="absolute -top-2 left-2 text-xs">#{index + 1}</div>
                            )}
                            <div className="flex-grow relative">
                              <Field name={`payoutPairs.${index}.address`}>
                                {({ field, meta }: FieldProps) => (
                                  <div className="relative">
                                    <AddressInput
                                      showError={false}
                                      label="Address"
                                      {...field}
                                      placeholder="manifest1..."
                                      className={`input input-bordered w-full ${
                                        meta.touched && meta.error ? 'input-error' : ''
                                      }`}
                                    />
                                    {meta.touched && meta.error && (
                                      <div
                                        className="tooltip tooltip-bottom tooltip-open tooltip-error bottom-0 absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs"
                                        data-tip={meta.error}
                                      ></div>
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
                                      <div
                                        className="tooltip tooltip-bottom tooltip-open tooltip-error bottom-0 absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs"
                                        data-tip={meta.error}
                                      ></div>
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
                                aria-label="Remove payout pair"
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

                <div className="mt-4 gap-6 flex justify-center w-full p-2">
                  <button
                    type="button"
                    className="btn w-[calc(50%-8px)] btn-md focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A]"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-md w-[calc(50%-8px)] btn-gradient  text-white"
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

        <SignModal />
      </Dialog.Panel>
    </Dialog>
  );
}
