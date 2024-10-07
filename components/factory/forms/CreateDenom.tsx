import React, { useState, useEffect } from 'react';
import { Formik, Form, useFormikContext } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TokenAction, TokenFormData } from '@/helpers/formReducer';
import Link from 'next/link';
import { TextInput } from '@/components/react/inputs';
import { useTx, useFeeEstimation } from '@/hooks';
import { osmosis } from '@chalabi/manifestjs';
import { useSimulateDenomCreation } from '@/utils/transactionUtils';

// Add this new component
const FormObserver: React.FC<{
  setIsValid: (isValid: boolean) => void;
  setIsDirty: (isDirty: boolean) => void;
}> = ({ setIsValid, setIsDirty }) => {
  const { isValid, dirty } = useFormikContext();

  useEffect(() => {
    setIsValid(isValid);
    setIsDirty(dirty);
  }, [isValid, dirty, setIsValid, setIsDirty]);

  return null;
};

export default function CreateDenom({
  nextStep,
  formData,
  dispatch,
  address,
}: Readonly<{
  nextStep: () => void;
  formData: TokenFormData;
  dispatch: React.Dispatch<TokenAction>;
  address: string;
}>) {
  const { simulateDenomCreation } = useSimulateDenomCreation();
  const DenomSchema = Yup.object().shape({
    subdenom: Yup.string()
      .required('Subdenom is required')
      .matches(
        /^[afpnum][a-zA-Z0-9]+$/,
        'Subdenom must start with a, f, p, n, u, or m followed by letters and numbers'
      )
      .min(4, 'Subdenom must be at least 4 characters')
      .max(44, 'Subdenom must not exceed 44 characters')
      .noProfanity('Profanity is not allowed')
      .simulateDenomCreation(
        () => simulateDenomCreation(formData.subdenom),
        `The denom ${formData.subdenom} already exists`
      ),
  });

  const { createDenom } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const [isSigning, setIsSigning] = useState(false);
  const { tx } = useTx('manifest');
  const { estimateFee } = useFeeEstimation('manifest');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (values: TokenFormData) => {
    setIsSigning(true);
    try {
      const msg = createDenom({
        sender: address ?? '',
        subdenom: values.subdenom,
      });

      const fee = await estimateFee(address ?? '', [msg]);
      const result = await tx([msg], {
        fee,
        onSuccess: () => {
          nextStep();
        },
        returnError: true,
      });
      if (result && result.error) {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error during transaction setup:', error);
    } finally {
      setIsSigning(false);
    }
  };

  // Define the token exponents array
  const tokenExponents = [
    { exponent: -18, subdenom: 'atto', letter: 'a', description: 'Smallest unit, 10⁻¹⁸' },
    { exponent: -15, subdenom: 'femto', letter: 'f', description: '10⁻¹⁵' },
    { exponent: -12, subdenom: 'pico', letter: 'p', description: '10⁻¹²' },
    { exponent: -9, subdenom: 'nano', letter: 'n', description: '10⁻⁹' },
    { exponent: -6, subdenom: 'micro', letter: 'u', description: '10⁻⁶' },
    { exponent: -3, subdenom: 'milli', letter: 'm', description: '10⁻³' },
  ];

  const [isFormValid, setIsFormValid] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  return (
    <section>
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-6 sm:p-8 rounded-2xl shadow-lg">
          <div className="w-full">
            <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:text-[#FFFFFF99] dark:border-[#FFFFFF99] border-b-[black] pb-4">
              Create Denom
            </h1>
            <Formik
              initialValues={formData}
              validationSchema={DenomSchema}
              onSubmit={handleConfirm}
            >
              {({ setFieldValue }) => (
                <Form className="flex flex-col gap-3">
                  <FormObserver setIsValid={setIsFormValid} setIsDirty={setIsFormDirty} />
                  <TextInput
                    label="Token Sub Denom"
                    name="subdenom"
                    placeholder="utoken"
                    helperText="Use a subdenom starting with a prefix (e.g., 'utoken')"
                    value={formData.subdenom}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      dispatch({
                        type: 'UPDATE_FIELD',
                        field: 'subdenom',
                        value: e.target.value,
                      });
                      setFieldValue('subdenom', e.target.value);
                    }}
                  />

                  {/* Token Exponents Section */}
                  <div className="mt-4">
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
                              <span className="text-2xl font-bold text-primary">{item.letter}</span>
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
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <div className="flex space-x-3 mt-6 mx-auto w-full">
        <Link href="/factory" legacyBehavior>
          <button className="btn btn-neutral py-2.5 sm:py-3.5 w-1/2">
            <span className="hidden sm:inline">Back: Factory Page</span>
            <span className="sm:hidden">Back</span>
          </button>
        </Link>
        <button
          type="submit"
          className="w-1/2 btn btn-gradient text-white py-2.5 sm:py-3.5 disabled:opacity-50"
          onClick={() => handleConfirm(formData)}
          disabled={!isFormValid || !isFormDirty || !formData.subdenom || isSigning}
        >
          {isSigning ? (
            <span className="loading loading-dots loading-sm"></span>
          ) : (
            'Next: Token Metadata'
          )}
        </button>
      </div>
    </section>
  );
}
