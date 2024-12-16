import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { Formik, Form, FieldArray, Field, FieldProps } from 'formik';
import Yup from '@/utils/yupExtensions';
import { NumberInput, TextInput } from '@/components/react/inputs';

import { PlusIcon, MinusIcon } from '@/components/icons';
import { MdContacts } from 'react-icons/md';
import { useTx, useFeeEstimation } from '@/hooks';
import { cosmos, liftedinit } from '@liftedinit/manifestjs';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';

import { parseNumberToBigInt } from '@/utils';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { TailwindModal } from '@/components/react';
import env from '@/config/env';

interface BurnPair {
  address: string;
  amount: string;
}

interface MultiBurnModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: string;
  address: string;
  denom: MetadataSDKType | null;
}

const BurnPairSchema = Yup.object().shape({
  address: Yup.string().manifestAddress().required('Required'),
  amount: Yup.number().positive('Amount must be positive').required('Required'),
});

const MultiBurnSchema = Yup.object().shape({
  burnPairs: Yup.array()
    .of(BurnPairSchema)
    .min(1, 'At least one burn pair is required')
    .test('unique-address', 'Addresses must be unique', function (pairs) {
      if (!pairs) return true;
      const addresses = pairs.map(pair => pair.address);
      const uniqueAddresses = new Set(addresses);
      return uniqueAddresses.size === addresses.length;
    }),
});

export function MultiBurnModal({ isOpen, onClose, admin, address, denom }: MultiBurnModalProps) {
  const [burnPairs, setBurnPairs] = useState([{ address: admin, amount: '' }]);
  const { tx, isSigning, setIsSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);
  const { burnHeldBalance } = liftedinit.manifest.v1.MessageComposer.withTypeUrl;
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
  }, [isOpen, onClose]);

  const updateBurnPair = (index: number, field: 'address' | 'amount', value: string) => {
    const newPairs = [...burnPairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    setBurnPairs(newPairs);
  };

  const addBurnPair = () => {
    setBurnPairs([...burnPairs, { address: admin, amount: '' }]);
  };

  const removeBurnPair = (index: number) => {
    setBurnPairs(burnPairs.filter((_, i) => i !== index));
  };

  const handleMultiBurn = async (values: { burnPairs: BurnPair[] }) => {
    setIsSigning(true);
    try {
      const messages = values.burnPairs.map(pair =>
        burnHeldBalance({
          authority: admin,
          burnCoins: [
            {
              denom: denom?.base ?? '',
              amount: parseNumberToBigInt(pair.amount, denom?.denom_units?.[1].exponent).toString(),
            },
          ],
        })
      );

      const encodedMessages = messages.map(msg =>
        Any.fromPartial({
          typeUrl: msg.typeUrl,
          value: liftedinit.manifest.v1.MsgBurnHeldBalance.encode(msg.value).finish(),
        })
      );

      const msg = submitProposal({
        groupPolicyAddress: admin,
        messages: encodedMessages,
        metadata: '',
        proposers: [address],
        title: `Burn MFX`,
        summary: `This proposal includes a multi-burn action for MFX.`,
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
      console.error('Error during multi-burn:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const modalContent = (
    <dialog
      id="multi_burn_modal"
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
          <button
            aria-label="Close modal"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]"
          >
            ✕
          </button>
        </form>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">
          Burn <span className="font-light text-primary">MFX</span>
        </h3>
        <div className="py-4 flex flex-col h-[calc(100%-4rem)]">
          <Formik
            initialValues={{ burnPairs }}
            validationSchema={MultiBurnSchema}
            onSubmit={handleMultiBurn}
            validateOnMount={true}
          >
            {({ values, isValid, setFieldValue }) => (
              <Form className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-semibold">Burn Pairs</div>
                </div>

                <div className="overflow-y-auto flex-grow px-1 max-h-[40vh]">
                  <FieldArray name="burnPairs">
                    {({ remove }) => (
                      <div className="flex flex-col gap-4 overflow-y-auto">
                        {values.burnPairs.map((pair, index) => (
                          <div
                            key={index}
                            className="flex relative flex-row dark:bg-[#FFFFFF0A] bg-[#FFFFFF] p-4 gap-2 rounded-lg items-end"
                          >
                            {index > 0 && (
                              <div className="absolute -top-2 left-2 text-xs">#{index + 1}</div>
                            )}
                            <div className="flex-grow relative">
                              <Field name={`burnPairs.${index}.address`}>
                                {({ field, meta }: FieldProps) => (
                                  <div className="relative">
                                    <TextInput
                                      showError={false}
                                      label="Address"
                                      {...field}
                                      value={admin}
                                      disabled={true}
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
                              <Field name={`burnPairs.${index}.amount`}>
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
                                  removeBurnPair(index);
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
                    className="btn btn-md w-[calc(50%-8px)] btn-error  text-white"
                    disabled={isSigning || !isValid}
                  >
                    {isSigning ? <span className="loading loading-dots loading-md"></span> : 'Burn'}
                  </button>
                </div>
                <TailwindModal
                  isOpen={isContactsOpen}
                  setOpen={setIsContactsOpen}
                  showContacts={true}
                  currentAddress={address}
                  onSelect={(selectedAddress: string) => {
                    if (selectedIndex !== null) {
                      updateBurnPair(selectedIndex, 'address', selectedAddress);
                      setFieldValue(`burnPairs.${selectedIndex}.address`, selectedAddress);
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
