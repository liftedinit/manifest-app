import React from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { Action, FormData } from '@/helpers/formReducer';
import Link from 'next/link';
import { PiAddressBook } from 'react-icons/pi';
import { TextInput, TextArea } from '@/components/react/inputs';

import { TrashIcon, PlusIcon } from '@/components/icons';

export function isValidManifestAddress(value: string): boolean {
  return /^manifest[a-zA-Z0-9]{32,}$/.test(value);
}

const GroupSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(50, 'Title must not exceed 50 characters'),
  authors: Yup.lazy(val =>
    Array.isArray(val)
      ? Yup.array()
          .of(
            Yup.string().test(
              'author-validation',
              'Invalid author name or address',
              function (value) {
                if (value?.startsWith('manifest')) {
                  return isValidManifestAddress(value);
                }
                return Yup.string()
                  .max(50, 'Author name must not exceed 50 characters')
                  .noProfanity('Profanity is not allowed')
                  .isValidSync(value);
              }
            )
          )
          .min(1, 'At least one author is required')
      : Yup.string().test(
          'single-author-validation',
          'Invalid author name or address',
          function (value) {
            if (value?.startsWith('manifest')) {
              return isValidManifestAddress(value);
            }
            return Yup.string()
              .max(50, 'Author name must not exceed 50 characters')
              .noProfanity('Profanity is not allowed')
              .isValidSync(value);
          }
        )
  ),
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
  const authors = Array.isArray(formData.authors) ? formData.authors : [formData.authors];

  const addAuthor = () => {
    dispatch({ type: 'ADD_AUTHOR' });
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      dispatch({ type: 'REMOVE_AUTHOR', index });
    }
  };

  const updateAuthor = (index: number, value: string) => {
    dispatch({ type: 'UPDATE_AUTHOR', index, value });
  };

  const updateField = (field: keyof FormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  return (
    <>
      <section className=" ">
        <div className="lg:flex mx-auto">
          <div className="flex items-center mx-auto md:w-[800px] dark:bg-[#FFFFFF0F] bg-[#FFFFFF] p-[24px] rounded-[24px] ">
            <div className="w-full">
              <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:border-[#ffffff8e] border-b-[black] pb-4">
                Group details
              </h1>
              <Formik
                initialValues={formData}
                validationSchema={GroupSchema}
                onSubmit={nextStep}
                validateOnChange={true}
                validateOnBlur={true}
                enableReinitialize
              >
                {({ isValid, setFieldValue, handleChange, handleBlur }) => (
                  <Form className="min-h-[330px] flex flex-col gap-4">
                    <TextInput
                      label="Group Title"
                      name="title"
                      placeholder="Title"
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        updateField('title', e.target.value);
                        handleChange(e);
                      }}
                      onBlur={handleBlur}
                    />

                    <TextArea
                      label="Description"
                      name="description"
                      placeholder="Long Bio"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        updateField('description', e.target.value);
                        handleChange(e);
                      }}
                      onBlur={handleBlur}
                    />

                    {/* Authors section */}
                    <div className="form-control w-full">
                      <div className="max-h-[180px] overflow-y-auto px-1">
                        {authors.map((author, index) => (
                          <div key={index} className="flex mb-2 items-center">
                            <TextInput
                              label="Author name or address"
                              name={`authors[${index}]`}
                              placeholder="Author name or address"
                              value={author}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                updateAuthor(index, e.target.value);
                                handleChange(e);
                              }}
                              onBlur={handleBlur}
                              className="flex-grow"
                              rightElement={
                                authors.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => removeAuthor(index)}
                                    className="btn btn-error btn-sm text-white"
                                  >
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateField('authors', [address]);
                                      setFieldValue('authors', [address]);
                                    }}
                                    className="btn btn-primary btn-sm text-white"
                                  >
                                    <PiAddressBook className="w-5 h-5" />
                                  </button>
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addAuthor}
                        className="btn btn-gradient text-white w-full mt-2"
                      >
                        <PlusIcon className="mr-2" /> Add Author
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
        <div className="flex space-x-3 px-4 mt-6 mx-auto max-w-3xl">
          <Link href="/groups" legacyBehavior>
            <button className="btn btn-neutral py-2.5 sm:py-3.5 w-1/2">
              <span className="hidden sm:inline">Back: Groups Page</span>
              <span className="sm:hidden">Back: Groups</span>
            </button>
          </Link>
          <button
            type="submit"
            className="w-1/2 btn px-5 py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
            onClick={nextStep}
            disabled={
              !formData.title ||
              !formData.description ||
              authors.length === 0 ||
              authors.some(author => !author || author.trim() === '')
            }
          >
            Next: Group Policy
          </button>
        </div>
      </section>
    </>
  );
}
