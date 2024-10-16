import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { ProposalFormData, ProposalAction } from '@/helpers/formReducer';
import { PiAddressBook } from 'react-icons/pi';
import { TextInput, TextArea } from '@/components/react/inputs';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ProposalSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(50, 'Title must not exceed 50 characters')
    .noProfanity('Profanity is not allowed'),
  proposers: Yup.string().manifestAddress().required('Required'),
  summary: Yup.string()
    .required('Summary is required')
    .min(10, 'Summary must be at least 10 characters')
    .max(500, 'Summary must not exceed 500 characters')
    .noProfanity('Profanity is not allowed'),
});

export default function ProposalDetails({
  nextStep,
  formData,
  dispatch,
  address,
}: Readonly<{
  nextStep: () => void;
  formData: ProposalFormData;
  dispatch: React.Dispatch<ProposalAction>;
  address: string;
}>) {
  const router = useRouter();
  const policyAddress = router.query.policyAddress as string;

  const updateField = (field: keyof ProposalFormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  return (
    <section className="">
      <Formik
        initialValues={formData}
        validationSchema={ProposalSchema}
        onSubmit={nextStep}
        validateOnChange={true}
      >
        {({ isValid, setFieldValue, handleChange }) => (
          <>
            <div className="lg:flex mx-auto">
              <div className="flex items-center mx-auto w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
                <div className="w-full">
                  <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:text-[#FFFFFF99] dark:border-[#FFFFFF99] border-b-[black] pb-4">
                    Proposal details
                  </h1>
                  <Form className="min-h-[330px] flex flex-col gap-4">
                    <TextInput
                      label="Proposal Title"
                      name="title"
                      placeholder="Title"
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        updateField('title', e.target.value);
                        handleChange(e);
                      }}
                    />
                    <TextInput
                      label="Proposer"
                      name="proposers"
                      placeholder="List of authors"
                      value={formData.proposers}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        updateField('proposers', e.target.value);
                        handleChange(e);
                      }}
                      rightElement={
                        <button
                          type="button"
                          aria-label="address-btn"
                          onClick={() => {
                            setFieldValue('proposers', address);
                            updateField('proposers', address);
                          }}
                          className="btn btn-primary btn-sm text-white"
                        >
                          <PiAddressBook className="w-5 h-5" />
                        </button>
                      }
                    />
                    <TextArea
                      label="Summary"
                      name="summary"
                      placeholder="Short Description"
                      value={formData.summary}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        updateField('summary', e.target.value);
                        handleChange(e);
                      }}
                    />
                  </Form>
                </div>
              </div>
            </div>
            <div className="flex space-x-3  mt-6 mx-auto w-full">
              <Link href={`/groups?policyAddress=${policyAddress}`} legacyBehavior>
                <button className="btn btn-neutral py-2.5 sm:py-3.5 w-1/2">
                  <span className="hidden sm:inline">Back: Proposals Page</span>
                  <span className="sm:hidden">Back: Proposals</span>
                </button>
              </Link>
              <button
                type="submit"
                className="w-1/2 btn  py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
                onClick={nextStep}
                disabled={!isValid}
              >
                Next: Proposal Messages
              </button>
            </div>
          </>
        )}
      </Formik>
    </section>
  );
}
