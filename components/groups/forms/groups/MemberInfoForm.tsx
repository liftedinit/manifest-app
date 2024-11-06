import { Action, FormData } from '@/helpers/formReducer';
import React, { useState, useEffect, useRef } from 'react';
import { MdContacts } from 'react-icons/md';
import { Formik, Form, FieldArray, Field, FieldProps } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TrashIcon, PlusIcon } from '@/components/icons';
import { NumberInput, TextInput } from '@/components/react';
import { TailwindModal } from '@/components/react/modal';

const MemberSchema = Yup.object().shape({
  address: Yup.string().manifestAddress().required('Required'),
  name: Yup.string().required('Required').noProfanity('Profanity is not allowed'),
  weight: Yup.number().min(1, 'Must be at least 1').required('Required'),
});

const MemberInfoSchema = Yup.object().shape({
  members: Yup.array()
    .of(MemberSchema)
    .min(1, 'At least one member is required')
    .test('unique-address', 'Addresses must be unique', function (members) {
      if (!members) return true;
      const addresses = members.map(member => member.address);
      const uniqueAddresses = new Set(addresses);
      return uniqueAddresses.size === addresses.length;
    }),
});

export default function MemberInfoForm({
  formData,
  dispatch,
  nextStep,
  prevStep,
  address,
}: Readonly<{
  formData: FormData;
  dispatch: (action: Action) => void;
  nextStep: () => void;
  prevStep: () => void;
  address: string;
}>) {
  const [isValidForm, setIsValidForm] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [activeMemberIndex, setActiveMemberIndex] = useState<number | null>(null);
  const addMemberRef = useRef<() => void>(() => {});

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
          <div className="w-full">
            <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:text-[#FFFFFF99] dark:border-[#FFFFFF99] border-b-[black] pb-4">
              Member Info
            </h1>
            <Formik
              initialValues={{ members: formData.members }}
              validationSchema={MemberInfoSchema}
              onSubmit={nextStep}
              validateOnMount={true}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ values, isValid, setFieldValue, errors }) => {
                setIsValidForm(isValid);
                return (
                  <Form className="flex flex-col gap-4">
                    <div className="max-h-[55vh] overflow-y-auto px-1">
                      <FieldArray name="members">
                        {({ remove, push }) => {
                          addMemberRef.current = () => {
                            push({ address: '', name: '', weight: '1' });
                            dispatch({
                              type: 'ADD_MEMBER',
                              member: { address: '', name: '', weight: '1' },
                            });
                          };
                          return (
                            <>
                              {values.members.map((member, index) => (
                                <div
                                  key={index}
                                  className="flex relative flex-row dark:bg-[#FFFFFF0A] bg-[#FFFFFF] p-4 gap-2 mb-4 rounded-lg items-end"
                                >
                                  {index > 0 && (
                                    <div className=" absolute -top-2 left-2  text-xs">
                                      #{index + 1}
                                    </div>
                                  )}

                                  <div className="flex-grow relative">
                                    <Field name={`members.${index}.address`}>
                                      {({ field, meta }: FieldProps) => (
                                        <div className="relative">
                                          <TextInput
                                            showError={false}
                                            label="Address"
                                            {...field}
                                            type="text"
                                            placeholder="manifest1..."
                                            className={`input input-bordered w-full ${
                                              meta.touched && meta.error ? 'input-error' : ''
                                            }`}
                                            rightElement={
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveMemberIndex(index);
                                                  setIsContactsOpen(true);
                                                }}
                                                className="btn btn-primary btn-sm text-white"
                                              >
                                                <MdContacts className="w-5 h-5" />
                                              </button>
                                            }
                                            onChange={e => {
                                              field.onChange(e);
                                              dispatch({
                                                type: 'UPDATE_MEMBER',
                                                index,
                                                field: 'address',
                                                value: e.target.value,
                                              });
                                            }}
                                          />
                                          {meta.touched && meta.error && (
                                            <div
                                              className="tooltip tooltip-bottom tooltip-open tooltip-error bottom-0 absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs"
                                              data-tip={meta.error}
                                              role="alert"
                                              aria-live="polite"
                                            >
                                              <div className="w-0 h-0"></div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </Field>
                                  </div>
                                  <div className="flex-grow relative">
                                    <Field name={`members.${index}.name`}>
                                      {({ field, meta }: FieldProps) => (
                                        <div className="relative">
                                          <TextInput
                                            showError={false}
                                            label="Name"
                                            {...field}
                                            type="text"
                                            placeholder="Alice"
                                            className={`input input-bordered w-full ${
                                              meta.touched && meta.error ? 'input-error' : ''
                                            }`}
                                            onChange={e => {
                                              field.onChange(e);
                                              dispatch({
                                                type: 'UPDATE_MEMBER',
                                                index,
                                                field: 'name',
                                                value: e.target.value,
                                              });
                                            }}
                                          />
                                          {meta.touched && meta.error && (
                                            <div
                                              className="tooltip tooltip-bottom tooltip-open bottom-0 tooltip-error absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs"
                                              data-tip={meta.error}
                                            >
                                              <div className="w-0 h-0"></div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </Field>
                                  </div>
                                  <div className="flex-grow relative">
                                    <Field name={`members.${index}.weight`}>
                                      {({ field, meta }: FieldProps) => (
                                        <div className="relative">
                                          <NumberInput
                                            showError={false}
                                            label="Weight"
                                            {...field}
                                            type="number"
                                            min="1"
                                            placeholder="1"
                                            className={`input input-bordered w-full ${
                                              meta.touched && meta.error ? 'input-error' : ''
                                            }`}
                                            onChange={e => {
                                              const value = Math.max(
                                                1,
                                                parseInt(e.target.value) || 1
                                              );
                                              field.onChange(e);
                                              setFieldValue(
                                                `members.${index}.weight`,
                                                value.toString()
                                              );
                                              dispatch({
                                                type: 'UPDATE_MEMBER',
                                                index,
                                                field: 'weight',
                                                value: value.toString(),
                                              });
                                            }}
                                          />
                                          {meta.touched && meta.error && (
                                            <div
                                              className="tooltip tooltip-bottom tooltip-open tooltip-error bottom-0 absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs"
                                              data-tip={meta.error}
                                            >
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
                                      className=" absolute top-3 right-5 btn btn-error text-white btn-sm"
                                      onClick={() => {
                                        remove(index);
                                        dispatch({
                                          type: 'REMOVE_MEMBER',
                                          index,
                                        });
                                      }}
                                    >
                                      <TrashIcon className="w-5 h-5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </>
                          );
                        }}
                      </FieldArray>
                    </div>
                    <button
                      type="button"
                      className="btn btn-gradient w-full"
                      onClick={() => addMemberRef.current()}
                    >
                      <PlusIcon className="w-5 h-5 mr-2" /> Add member
                    </button>
                    <TailwindModal
                      isOpen={isContactsOpen}
                      setOpen={setIsContactsOpen}
                      showContacts={true}
                      onSelect={(selectedAddress: string) => {
                        if (activeMemberIndex !== null) {
                          setFieldValue(`members.${activeMemberIndex}.address`, selectedAddress);
                          dispatch({
                            type: 'UPDATE_MEMBER',
                            index: activeMemberIndex,
                            field: 'address',
                            value: selectedAddress,
                          });
                          setActiveMemberIndex(null);
                        }
                      }}
                    />
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>

      <div className="flex space-x-3 mt-6 mx-auto w-full">
        <button onClick={prevStep} className="btn btn-neutral py-2.5 sm:py-3.5 w-1/2">
          Back: Group Details
        </button>
        <button
          type="submit"
          className="w-1/2 btn px-5 py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
          onClick={() => nextStep()}
          disabled={!isValidForm}
        >
          Next: Confirmation
        </button>
      </div>
    </section>
  );
}
