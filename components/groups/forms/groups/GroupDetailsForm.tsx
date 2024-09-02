import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Action, FormData } from '@/helpers/formReducer';
import Link from 'next/link';
import { PiAddressBook } from 'react-icons/pi';
import { TextInput, TextArea } from '@/components/react/inputs';

const GroupSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(50, 'Title must not exceed 50 characters'),
  authors: Yup.string()
    .required('Authors are required')
    .max(200, 'Authors must not exceed 200 characters')
    .noProfanity('Profanity is not allowed'),
  summary: Yup.string()
    .required('Summary is required')
    .min(10, 'Summary must be at least 10 characters')
    .max(500, 'Summary must not exceed 500 characters')
    .noProfanity('Profanity is not allowed'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .noProfanity('Profanity is not allowed'),
  forumLink: Yup.string().url('Invalid URL format'),
});

export default function GroupDetails({
  nextStep,
  formData,
  dispatch,
  address,
}: Readonly<{
  nextStep: () => void;
  formData: FormData;
  dispatch: React.Dispatch<Action>;
  address: string;
}>) {
  const updateField = (field: keyof FormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:mb-6 leading-tight">
              Group details
            </h1>
            <Formik
              initialValues={formData}
              validationSchema={GroupSchema}
              onSubmit={nextStep}
              validateOnChange={true}
            >
              {({ isValid, dirty, setFieldValue }) => (
                <Form className="min-h-[330px]">
                  <div className="grid gap-5 my-6 sm:grid-cols-2">
                    <TextInput
                      label="Group Title"
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
                        label="Authors"
                        name="authors"
                        placeholder="List of authors or address"
                        value={formData.authors}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          updateField('authors', e.target.value);
                          setFieldValue('authors', e.target.value);
                        }}
                        className="rounded-tr-none rounded-br-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFieldValue('authors', address);
                          updateField('authors', address);
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
                    <TextArea
                      label="Description"
                      name="description"
                      placeholder="Long Bio"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        updateField('description', e.target.value);
                        setFieldValue('description', e.target.value);
                      }}
                    />
                    <TextInput
                      label="Forum Link"
                      name="forumLink"
                      placeholder="Link to forum"
                      value={formData.forumLink}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        updateField('forumLink', e.target.value);
                        setFieldValue('forumLink', e.target.value);
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-4 btn px-5 py-2.5 sm:py-3.5 btn-primary"
                    disabled={!isValid}
                  >
                    Next: Group Policy
                  </button>
                </Form>
              )}
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
