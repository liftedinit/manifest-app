import React from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { ProposalFormData, ProposalAction } from '@/helpers/formReducer';
import Link from 'next/link';
import { PiAddressBook } from 'react-icons/pi';
import { TextInput, TextArea } from '@/components/react/inputs';
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
  const updateField = (field: keyof ProposalFormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };
  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:mb-6 leading-tight">
              Proposal
            </h1>
            <Formik
              initialValues={formData}
              validationSchema={ProposalSchema}
              onSubmit={nextStep}
              validateOnChange={true}
            >
              {({ isValid, dirty, errors, setFieldValue }) => {
                return (
                  <Form className="min-h-[330px]">
                    <div className="grid gap-5 my-6 sm:grid-cols-2">
                      <TextInput
                        label="Proposal Title"
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          updateField('title', e.target.value);
                          setFieldValue('title', e.target.value);
                        }}
                      />
                      <div className="flex flex-row items-center justify-start">
                        <TextInput
                          label="Proposer"
                          name="proposers"
                          placeholder="List of authors"
                          value={formData.proposers}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            updateField('proposers', e.target.value);
                            setFieldValue('proposers', e.target.value);
                          }}
                          className="rounded-tr-none rounded-br-none"
                        />
                        <button
                          type="button"
                          aria-label="address-btn"
                          onClick={() => {
                            setFieldValue('proposers', address);
                            updateField('proposers', address);
                          }}
                          className="btn btn-primary rounded-tr-lg rounded-br-lg rounded-bl-none rounded-tl-none"
                        >
                          <PiAddressBook className="w-6 h-6" />
                        </button>
                      </div>
                      <TextArea
                        label="Summary"
                        name="summary"
                        placeholder="Short Bio"
                        value={formData.summary}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          updateField('summary', e.target.value);
                          setFieldValue('summary', e.target.value);
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full mt-4 btn px-5 py-2.5 sm:py-3.5 btn-primary"
                      disabled={!isValid || !dirty}
                      onClick={() => {
                        nextStep();
                      }}
                    >
                      Next: Proposal Messages
                    </button>
                  </Form>
                );
              }}
            </Formik>
            <div className="flex space-x-3 ga-4 mt-6">
              <Link href="/groups" legacyBehavior>
                <button className="btn btn-neutral py-2.5 sm:py-3.5 w-1/2">
                  <span className="hidden sm:inline">Back: Groups Page</span>
                  <span className="sm:hidden">Back: Groups</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
