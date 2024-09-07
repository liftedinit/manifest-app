import { TokenAction, TokenFormData } from '@/helpers/formReducer';
import { useTx, useFeeEstimation } from '@/hooks';
import { osmosis } from '@chalabi/manifestjs';
import Link from 'next/link';
import { useState } from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput } from '@/components/react/inputs';

const DenomSchema = Yup.object().shape({
  subdenom: Yup.string()
    .required('Subdenom is required')
    .matches(
      /^[uaqg][a-zA-Z0-9]+$/,
      'Subdenom must start with u, a, q, or g, followed by letters and numbers'
    )
    .min(4, 'Subdenom must be at least 4 characters')
    .max(44, 'Subdenom must not exceed 44 characters'),
});

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
  const { createDenom } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const [isSigning, setIsSigning] = useState(false);
  const { tx } = useTx('manifest');
  const { estimateFee } = useFeeEstimation('manifest');

  const handleConfirm = async (values: TokenFormData) => {
    setIsSigning(true);
    try {
      const msg = createDenom({
        sender: address ?? '',
        subdenom: values.subdenom,
      });

      const fee = await estimateFee(address ?? '', [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          nextStep();
        },
      });
    } catch (error) {
      console.error('Error during transaction setup:', error);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:mb-6 leding-tight ">
              Create Denom
            </h1>
            <Formik
              initialValues={formData}
              validationSchema={DenomSchema}
              onSubmit={handleConfirm}
            >
              {({ isValid, dirty, setFieldValue }) => (
                <Form className="min-h-[330px]">
                  <div className="grid gap-5 my-6 sm:grid-cols-2">
                    <TextInput
                      label="Token Sub Denom"
                      name="subdenom"
                      placeholder="udenom"
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
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    We recommend starting with &apos;u&apos; (e.g., &apos;utoken&apos;)
                  </p>
                  <button
                    type="submit"
                    className="w-full mt-4 btn px-5 py-2.5 sm:py-3.5 btn-primary"
                    disabled={!isValid || !dirty || isSigning}
                  >
                    {isSigning ? (
                      <span className="loading loading-dots loading-sm"></span>
                    ) : (
                      'Next: Token Metadata'
                    )}
                  </button>
                </Form>
              )}
            </Formik>
            <div className="flex space-x-3 ga-4 mt-6">
              <Link href={'/factory'} legacyBehavior>
                <button className=" btn btn-neutral py-2.5 sm:py-3.5 w-1/2 ">
                  Back: Factory Page
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
