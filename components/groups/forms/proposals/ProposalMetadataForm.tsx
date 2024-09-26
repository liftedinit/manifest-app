import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { ProposalFormData, ProposalAction } from '@/helpers/formReducer';
import { TextInput, TextArea } from '@/components/react/inputs';

const ProposalSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(50, 'Title must not exceed 50 characters')
    .noProfanity('Profanity is not allowed'),
  authors: Yup.string()
    .required('Authors are required')
    .max(200, 'Authors must not exceed 200 characters')
    .noProfanity('Profanity is not allowed'),
  summary: Yup.string()
    .required('Summary is required')
    .min(10, 'Summary must be at least 10 characters')
    .max(500, 'Summary must not exceed 500 characters')
    .noProfanity('Profanity is not allowed'),
  details: Yup.string()
    .required('Details are required')
    .min(10, 'Details must be at least 10 characters')
    .max(500, 'Summary must not exceed 500 characters')
    .noProfanity('Profanity is not allowed'),
});

export default function ProposalMetadataForm({
  nextStep,
  prevStep,
  formData,
  dispatch,
}: Readonly<{
  nextStep: () => void;
  prevStep: () => void;
  formData: ProposalFormData;
  dispatch: React.Dispatch<ProposalAction>;
}>) {
  const handleChange = (field: keyof ProposalFormData['metadata'], value: any) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'metadata',
      value: {
        ...formData.metadata,
        [field]: value,
      },
    });
  };
  const [isValid, setIsValid] = useState(false);

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
          <div className="w-full">
            <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:text-[#FFFFFF99] dark:border-[#FFFFFF99] border-b-[black] pb-4">
              Proposal Metadata
            </h1>
            <Formik
              initialValues={formData.metadata}
              validationSchema={ProposalSchema}
              onSubmit={nextStep}
              validateOnChange={true}
            >
              {({ setFieldValue, isValid }) => {
                setIsValid(isValid);

                return (
                  <Form className="min-h-[330px] flex flex-col gap-4">
                    <TextInput
                      label="Title"
                      name="title"
                      placeholder="Type here"
                      value={formData.metadata.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange('title', e.target.value);
                        setFieldValue('title', e.target.value);
                      }}
                    />
                    <TextInput
                      label="Authors"
                      name="authors"
                      placeholder="Type here"
                      value={formData.metadata.authors}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange('authors', e.target.value);
                        setFieldValue('authors', e.target.value);
                      }}
                    />
                    <TextArea
                      label="Summary"
                      name="summary"
                      placeholder="Short Description"
                      value={formData.metadata.summary}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        handleChange('summary', e.target.value);
                        setFieldValue('summary', e.target.value);
                      }}
                    />
                    <TextArea
                      label="Details"
                      name="details"
                      placeholder="Long Description"
                      value={formData.metadata.details}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        handleChange('details', e.target.value);
                        setFieldValue('details', e.target.value);
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
          <span className="hidden sm:inline">Prev: Messages</span>
          <span className="sm:hidden">Prev: TXs</span>
        </button>
        <button
          onClick={nextStep}
          disabled={
            !isValid ||
            !formData.metadata.title ||
            !formData.metadata.authors ||
            !formData.metadata.summary ||
            !formData.metadata.details
          }
          className="w-1/2 btn py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
        >
          Next: Confirmation
        </button>
      </div>
    </section>
  );
}
