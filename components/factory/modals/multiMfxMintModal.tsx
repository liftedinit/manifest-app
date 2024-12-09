import React, { useState, useEffect } from 'react';
import { Formik, Form, FieldArray, Field, FieldProps } from 'formik';
import Yup from '@/utils/yupExtensions';
import { NumberInput, TextInput } from '@/components/react/inputs';
import { TailwindModal } from '@/components/react';
import { createPortal } from 'react-dom';

import { MdContacts } from 'react-icons/md';
import { PlusIcon, MinusIcon } from '@/components/icons';
import { useTx, useFeeEstimation } from '@/hooks';
import { chainName } from '@/config';
import { cosmos, liftedinit } from '@liftedinit/manifestjs';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MsgPayout } from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import { parseNumberToBigInt } from '@/utils';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
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
  const { tx, isSigning, setIsSigning } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { payout } = liftedinit.manifest.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

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
            denom: denom?.base ?? '',
            amount: parseNumberToBigInt(
              pair.amount,
              denom?.denom_units?.[0].exponent ?? 0
            ).toString(),
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

      const fee = await estimateFee(address, [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          onClose();
        },
      });
    } catch (error) {
      console.error('Error during multi-mint:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const modalContent = (
    <dialog
      id="multi_mint_modal"
      className={`modal ${isOpen ? 'modal-open' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        height: '100vh',
        width: '100vw',
        display: isOpen ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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
                            className="flex relative flex-row dark:bg-[#FFFFFF0A] bg-[#FFFFFF] h-full p-4 gap-2 rounded-lg items-end"
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
                                            setSelectedIndex(index);
                                            setIsContactsOpen(true);
                                          }}
                                          className="btn btn-primary btn-sm text-white"
                                        >
                                          <MdContacts className="w-5 h-5" />
                                        </button>
                                      }
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
                <TailwindModal
                  isOpen={isContactsOpen}
                  setOpen={setIsContactsOpen}
                  showContacts={true}
                  currentAddress={address}
                  onSelect={(selectedAddress: string) => {
                    if (selectedIndex !== null) {
                      // Update both the local state and Formik state
                      updatePayoutPair(selectedIndex, 'address', selectedAddress);
                      setFieldValue(`payoutPairs.${selectedIndex}.address`, selectedAddress);
                    }
                    setIsContactsOpen(false);
                    setSelectedIndex(null);
                  }}
                />
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
        onSubmit={onClose}
      >
        <button>close</button>
      </form>
    </dialog>
  );

  // Only render if we're in the browser
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
