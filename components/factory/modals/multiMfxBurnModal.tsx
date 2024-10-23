import React from 'react';
import { PiPlusCircle, PiMinusCircle } from 'react-icons/pi';
import { Formik, Form, FieldArray, Field, FieldProps } from 'formik';
import Yup from '@/utils/yupExtensions';
import { NumberInput, TextInput } from '@/components/react/inputs';
import { PiAddressBook } from 'react-icons/pi';
import { PlusIcon, MinusIcon } from '@/components/icons';

interface BurnPair {
  address: string;
  amount: string;
}

interface MultiBurnModalProps {
  isOpen: boolean;
  onClose: () => void;
  burnPairs: BurnPair[];
  updateBurnPair: (index: number, field: 'address' | 'amount', value: string) => void;
  addBurnPair: () => void;
  removeBurnPair: (index: number) => void;
  handleMultiBurn: () => void;
  isSigning: boolean;
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

export function MultiBurnModal({
  isOpen,
  onClose,
  burnPairs,
  updateBurnPair,
  addBurnPair,
  removeBurnPair,
  handleMultiBurn,
  isSigning,
}: MultiBurnModalProps) {
  return (
    <dialog id="multi_burn_modal" className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-4xl mx-auto min-h-[30vh] max-h-[70vh] rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg overflow-y-auto">
        <form method="dialog" onSubmit={onClose}>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]">
            ✕
          </button>
        </form>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">
          Multi Burn <span className="font-light text-primary">MFX</span>
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
                  <button
                    type="button"
                    className="btn btn-sm btn-primary text-white"
                    onClick={() => {
                      setFieldValue('burnPairs', [
                        ...values.burnPairs,
                        { address: '', amount: '' },
                      ]);
                      addBurnPair();
                    }}
                  >
                    <PlusIcon className="text-lg" />
                    <span className="ml-1">Add Burn</span>
                  </button>
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
                                      placeholder="manifest1..."
                                      className={`input input-bordered w-full ${
                                        meta.touched && meta.error ? 'input-error' : ''
                                      }`}
                                      rightElement={
                                        <button
                                          type="button"
                                          onClick={() => {
                                            updateBurnPair(index, 'address', '');
                                            setFieldValue(`burnPairs.${index}.address`, '');
                                          }}
                                          className="btn btn-primary btn-sm text-white absolute right-2 top-1/2 transform -translate-y-1/2"
                                        >
                                          <PiAddressBook className="w-5 h-5" />
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

                <div className="modal-action mt-6">
                  <button className="btn btn-ghost" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-error text-white"
                    disabled={isSigning || !isValid}
                  >
                    {isSigning ? (
                      <span className="loading loading-dots loading-md"></span>
                    ) : (
                      'Multi Burn'
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
