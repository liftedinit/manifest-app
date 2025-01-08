import React from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TokenAction, TokenFormData } from '@/helpers/formReducer';
import Link from 'next/link';
import { TextInput } from '@/components/react/inputs';
import { useSimulateDenomCreation } from '@/utils';

export default function CreateDenom({
  nextStep,
  formData,
  dispatch,
}: Readonly<{
  nextStep: () => void;
  formData: TokenFormData;
  dispatch: React.Dispatch<TokenAction>;
}>) {
  const [isSimulating, setIsSimulating] = React.useState(false);
  const { simulateDenomCreation } = useSimulateDenomCreation();

  const DenomSchema = Yup.object().shape({
    subdenom: Yup.string()
      .required('Subdenom is required')
      .min(4, 'Subdenom must be at least 4 characters')
      .max(44, 'Subdenom must not exceed 44 characters')
      .noProfanity('Profanity is not allowed')
      .simulateDenomCreation(async () => {
        setIsSimulating(true);
        try {
          return await simulateDenomCreation(formData.subdenom);
        } finally {
          setIsSimulating(false);
        }
      }, `The denom ${formData.subdenom} already exists`),
  });

  return (
    <section>
      <div className="lg:flex mx-auto w-full flex-col items-center justify-between">
        <Formik
          initialValues={formData}
          validationSchema={DenomSchema}
          onSubmit={nextStep}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ setFieldValue, isValid, isSubmitting, isValidating, handleSubmit }) => (
            <>
              <div className="flex items-center mx-auto w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-6 sm:p-8 rounded-2xl shadow-lg">
                <div className="w-full">
                  <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:text-[#FFFFFF99] dark:border-[#FFFFFF99] border-b-[black] pb-4">
                    Create Denom
                  </h1>

                  <Form className="flex flex-col gap-3">
                    <TextInput
                      label="Token Sub Denom"
                      name="subdenom"
                      placeholder="token"
                      value={formData.subdenom}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        dispatch({
                          type: 'UPDATE_FIELD',
                          field: 'subdenom',
                          value: e.target.value,
                        });
                        setFieldValue('subdenom', e.target.value);
                      }}
                      rightElement={
                        isSimulating && (
                          <div className="flex items-center gap-2">
                            <span className="loading loading-spinner loading-sm" />
                            <span className="text-sm text-gray-500">checking availability...</span>
                          </div>
                        )
                      }
                    />

                    {/* Token Exponents Section */}
                    {/* <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Token Exponents</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Use these exponents, subdenoms, and letter representations when creating new
                        tokens
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {tokenExponents.map(item => (
                          <div
                            key={item.exponent}
                            className="dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] hover:bg-[#F5F5F5] dark:hover:bg-[#FFFFFF1A] transition-colors rounded-lg shadow p-4"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-lg font-semibold">
                                {item.exponent >= 0 ? '+' : ''}
                                {item.exponent}
                              </h3>
                              {item.letter && (
                                <span className="text-2xl font-bold text-primary">
                                  {item.letter}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Subdenom: {item.subdenom}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div> */}
                  </Form>
                  {/* Buttons placed outside the form but inside Formik's render props */}
                </div>
              </div>
              <div className="flex gap-6  mt-6 mx-auto w-full">
                <Link href="/factory" legacyBehavior>
                  <button className="btn btn-neutral dark:text-white text-black py-2.5 sm:py-3.5 w-[calc(50%-12px)]">
                    <span className="hidden sm:inline">Back: Factory Page</span>
                    <span className="sm:hidden">Back</span>
                  </button>
                </Link>
                <button
                  className="w-[calc(50%-12px)] btn px-5 py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
                  onClick={() => handleSubmit()}
                  type="submit"
                  disabled={!isValid || isSubmitting || isValidating}
                >
                  Next: Token Metadata
                </button>
              </div>
            </>
          )}
        </Formik>
      </div>
    </section>
  );
}
