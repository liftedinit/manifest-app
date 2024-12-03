import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { Action, FormData } from '@/helpers/formReducer';
import Link from 'next/link';

import { TextInput, TextArea } from '@/components/react/inputs';
import { TrashIcon, PlusIcon } from '@/components/icons';
import { isValidManifestAddress } from '@/utils/string';
import { MdContacts } from 'react-icons/md';
import { TailwindModal } from '@/components/react/modal';

const GroupSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(50, 'Title must not exceed 50 characters')
    .noProfanity(),
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

  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .noProfanity('Profanity is not allowed'),
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
  const [isValidForm, setIsValidForm] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [activeAuthorIndex, setActiveAuthorIndex] = useState<number | null>(null);

  const authors = Array.isArray(formData.authors)
    ? formData.authors
    : [formData.authors].filter(Boolean);

  const updateField = (field: keyof FormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
          <div className="w-full">
            <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:text-[#FFFFFF99] dark:border-[#FFFFFF99] border-b-[black] pb-4">
              Group details
            </h1>
            <Formik
              initialValues={{
                ...formData,
                authors: authors.length > 0 ? authors : [''],
              }}
              validationSchema={GroupSchema}
              onSubmit={nextStep}
            >
              {({ isValid, setFieldValue, handleChange, values }) => {
                setIsValidForm(isValid);

                return (
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
                    />

                    {/* Authors section */}
                    <div className="form-control w-full">
                      <div className="max-h-[30vh] overflow-y-auto px-1">
                        {values.authors.map((author, index) => (
                          <div key={index} className="flex mb-2 items-center">
                            <TextInput
                              label="Author name or address"
                              name={`authors[${index}]`}
                              placeholder="Author name or address"
                              value={author}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const newAuthors = [...values.authors];
                                newAuthors[index] = e.target.value;
                                setFieldValue('authors', newAuthors);
                                updateField('authors', newAuthors);
                              }}
                              className="flex-grow"
                              rightElement={
                                values.authors.length > 1 && index !== 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newAuthors = values.authors.filter(
                                        (_, i) => i !== index
                                      );
                                      setFieldValue('authors', newAuthors);
                                      updateField('authors', newAuthors);
                                    }}
                                    className="btn btn-error btn-sm text-white"
                                  >
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                                ) : (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveAuthorIndex(index);
                                        setIsContactsOpen(true);
                                      }}
                                      className="btn btn-primary btn-sm text-white"
                                    >
                                      <MdContacts className="w-5 h-5" />
                                    </button>
                                  </div>
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newAuthors = [...values.authors, ''];
                          setFieldValue('authors', newAuthors);
                          updateField('authors', newAuthors);
                        }}
                        className="btn btn-gradient text-white w-full mt-2"
                      >
                        <PlusIcon className="mr-2" /> Add Author
                      </button>
                    </div>
                    <TailwindModal
                      isOpen={isContactsOpen}
                      setOpen={setIsContactsOpen}
                      showContacts={true}
                      currentAddress={address}
                      onSelect={(selectedAddress: string) => {
                        if (activeAuthorIndex !== null) {
                          const newAuthors = [...authors];
                          newAuthors[activeAuthorIndex] = selectedAddress;
                          setFieldValue('authors', newAuthors);
                          updateField('authors', newAuthors);
                          setActiveAuthorIndex(null);
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

      <div className="flex gap-6  mt-6 mx-auto w-full">
        <Link href="/groups" legacyBehavior>
          <button className="btn btn-neutral dark:text-white text-black py-2.5 sm:py-3.5 w-[calc(50%-12px)]">
            <span className="hidden sm:inline">Back: Groups Page</span>
            <span className="sm:hidden">Back: Groups</span>
          </button>
        </Link>
        <button
          type="submit"
          className="w-[calc(50%-12px)] btn px-5 py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
          onClick={nextStep}
          disabled={
            !isValidForm ||
            !formData.authors ||
            formData.authors.length === 0 ||
            (Array.isArray(formData.authors) &&
              formData.authors.some(author => author.trim() === ''))
          }
        >
          Next: Group Policy
        </button>
      </div>
    </section>
  );
}
