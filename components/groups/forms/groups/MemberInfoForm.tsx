import { Action, FormData } from '@/helpers/formReducer';
import React, { useState, useEffect } from 'react';
import { PiAddressBook } from 'react-icons/pi';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { TextInput, NumberInput } from '@/components/react/inputs';
import { isValidAddress } from '@/utils/string';

const MemberSchema = Yup.object().shape({
  address: Yup.string()
    .test('is-valid-address', 'Invalid address format', isValidAddress)
    .required('Required'),
  name: Yup.string().required('Required'),
  weight: Yup.number().min(1, 'Must be at least 1').required('Required'),
});

const MemberInfoSchema = Yup.object().shape({
  members: Yup.array().of(MemberSchema).min(1, 'At least one member is required'),
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
  const [numberOfMembers, setNumberOfMembers] = useState(formData.members.length);
  console.log('formData', formData);
  const updateMembers = () => {
    const currentLength = formData.members.length;
    if (numberOfMembers > currentLength) {
      for (let i = 0; i < numberOfMembers - currentLength; i++) {
        dispatch({
          type: 'ADD_MEMBER',
          member: { address: '', name: '', weight: '' },
        });
      }
    } else if (numberOfMembers < currentLength) {
      const updatedMembers = formData.members.slice(0, numberOfMembers);
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'members',
        value: updatedMembers,
      });
    }
  };

  useEffect(() => {
    updateMembers();
  }, [numberOfMembers]);

  const handleNumberChange = (event: { target: { value: string } }) => {
    const newCount = parseInt(event.target.value, 10);
    if (!isNaN(newCount) && newCount >= 0) {
      setNumberOfMembers(newCount);
    }
  };

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
                  Member Info
                </h1>
                <div className="flex">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setNumberOfMembers(Math.max(0, numberOfMembers - 1))}
                  >
                    -
                  </button>
                  <input
                    aria-label={'member-count'}
                    className="input input-bordered mx-2 text-center input-sm w-[40px]"
                    value={numberOfMembers}
                    onChange={handleNumberChange}
                    min="0"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => setNumberOfMembers(numberOfMembers + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <Formik
                initialValues={{ members: formData.members }}
                validationSchema={MemberInfoSchema}
                onSubmit={nextStep}
                validateOnMount={true}
                validateOnChange={true}
                validateOnBlur={true}
              >
                {({ values, isValid, dirty, setFieldValue }) => (
                  <Form className="min-h-[330px]">
                    <div className="overflow-y-scroll max-h-[550px] min-h-[330px]">
                      <FieldArray name="members">
                        {() => (
                          <>
                            {values.members.map((member, index) => (
                              <div key={index} className="grid grid-cols-3 gap-4 mb-4 p-1">
                                <div className="relative">
                                  <TextInput
                                    name={`members.${index}.address`}
                                    label="Address"
                                    placeholder="manifest1..."
                                    value={member.address}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      setFieldValue(`members.${index}.address`, e.target.value);
                                      dispatch({
                                        type: 'UPDATE_MEMBER',
                                        index,
                                        field: 'address',
                                        value: e.target.value,
                                      });
                                    }}
                                    className={`input input-bordered w-full ${
                                      index === 0 ? 'rounded-tr-none rounded-br-none' : ''
                                    }`}
                                  />
                                  {index === 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFieldValue(`members.${index}.address`, address);
                                        dispatch({
                                          type: 'UPDATE_MEMBER',
                                          index,
                                          field: 'address',
                                          value: address,
                                        });
                                      }}
                                      aria-label="Paste address"
                                      className="btn btn-primary rounded-tr-lg rounded-br-lg rounded-bl-none rounded-tl-none"
                                    >
                                      <PiAddressBook className="w-6 h-6" />
                                    </button>
                                  )}
                                </div>
                                <TextInput
                                  name={`members.${index}.name`}
                                  label="Name"
                                  placeholder="Alice"
                                  value={member.name}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setFieldValue(`members.${index}.name`, e.target.value);
                                    dispatch({
                                      type: 'UPDATE_MEMBER',
                                      index,
                                      field: 'name',
                                      value: e.target.value,
                                    });
                                  }}
                                  className="input input-bordered w-full"
                                />
                                <NumberInput
                                  name={`members.${index}.weight`}
                                  label="Weight"
                                  placeholder="1"
                                  value={member.weight}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = Math.max(1, parseInt(e.target.value) || 1);
                                    setFieldValue(`members.${index}.weight`, value);
                                    dispatch({
                                      type: 'UPDATE_MEMBER',
                                      index,
                                      field: 'weight',
                                      value: value.toString(),
                                    });
                                  }}
                                  min={1}
                                  className="input input-bordered w-full"
                                />
                              </div>
                            ))}
                          </>
                        )}
                      </FieldArray>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={!isValid || numberOfMembers === 0}
                      onClick={() => {
                        nextStep();
                      }}
                    >
                      Next: Group Policy
                    </button>
                  </Form>
                )}
              </Formik>

              <div className="flex space-x-3 ga-4 mt-6">
                <button
                  onClick={prevStep}
                  className="text-center btn btn-neutral items-center w-1/2 py-2.5 sm:py-3.5 text-sm font-medium focus:outline-none rounded-lg border"
                >
                  Prev: Group Policy
                </button>
                <a className="text-center items-center w-1/2 py-2.5 sm:py-3.5 text-sm font-medium"></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
