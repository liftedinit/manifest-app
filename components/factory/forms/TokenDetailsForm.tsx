import React from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TokenAction, TokenFormData } from '@/helpers/formReducer';
import { TextInput, TextArea } from '@/components/react/inputs';

export default function TokenDetails({
  nextStep,
  prevStep,
  formData,
  dispatch,
  address,
}: Readonly<{
  nextStep: () => void;
  prevStep: () => void;
  formData: TokenFormData;
  dispatch: React.Dispatch<TokenAction>;
  address: string;
}>) {
  const TokenDetailsSchema = Yup.object().shape({
    display: Yup.string()
      .required('Display is required')
      .noProfanity()
      .test('display-contains-subdenom', 'Display must contain subdenom', function (value) {
        const subdenom = this.parent.subdenom;
        return !subdenom || value.toLowerCase().includes(subdenom.slice(1).toLowerCase());
      }),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters long')
      .noProfanity(),
    name: Yup.string().required('Name is required').noProfanity(),
    uri: Yup.string()
      .url('Must be a valid URL')
      .matches(/^https:\/\//i, 'URL must use HTTPS protocol')
      .matches(/\.(jpg|jpeg|png|gif)$/i, 'URL must point to an image file'),
  });

  const updateField = (field: keyof TokenFormData, value: TokenFormData[keyof TokenFormData]) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const effectiveAddress =
    formData.isGroup && formData.groupPolicyAddress ? formData.groupPolicyAddress : address;

  const fullDenom = `factory/${effectiveAddress}/${formData.subdenom}`;

  // Automatically set denom units
  React.useEffect(() => {
    const denomUnits = [
      { denom: fullDenom, exponent: 0, aliases: [] },
      { denom: formData.subdenom.slice(1), exponent: 6, aliases: [] },
    ];
    updateField('denomUnits', denomUnits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.subdenom, address]);

  return (
    <section>
      <div className="lg:flex mx-auto w-full flex-col items-center justify-between">
        <Formik
          initialValues={formData}
          validationSchema={TokenDetailsSchema}
          onSubmit={nextStep}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ isValid, handleChange, handleSubmit }) => (
            <>
              <div className="flex items-center mx-auto w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-6 sm:p-8 rounded-2xl shadow-lg">
                <div className="w-full">
                  <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:text-[#FFFFFF99] dark:border-[#FFFFFF99] border-b-[black] pb-4">
                    Token Metadata
                  </h1>
                  <Form className="min-h-[330px] flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput
                        label="Subdenom"
                        name="subdenom"
                        disabled={true}
                        value={formData.subdenom}
                        aria-label="Token subdenom"
                      />
                      <TextInput
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          updateField('name', e.target.value);
                          handleChange(e);
                        }}
                        aria-label="Token name"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput
                        label="Ticker"
                        name="display"
                        value={formData.display}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value;
                          updateField('display', value);
                          updateField('symbol', value.toUpperCase());
                          handleChange(e);
                        }}
                        aria-label="Token ticker"
                      />
                      <TextInput
                        label="Logo URL"
                        name="uri"
                        value={formData.uri}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          updateField('uri', e.target.value);
                          handleChange(e);
                        }}
                        aria-label="Token logo URL"
                      />
                    </div>
                    <TextArea
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        updateField('description', e.target.value);
                        handleChange(e);
                      }}
                      aria-label="Token description"
                    />
                  </Form>
                </div>
              </div>
              <div className="flex gap-6  mt-6 mx-auto w-full">
                <button
                  onClick={prevStep}
                  className="btn btn-neutral dark:text-white text-black py-2.5 sm:py-3.5 w-[calc(50%-12px)]"
                >
                  Previous
                </button>
                <button
                  className="w-[calc(50%-12px)] btn px-5 py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
                  onClick={() => handleSubmit()}
                  disabled={!isValid}
                >
                  Next: Group Policy
                </button>
              </div>
            </>
          )}
        </Formik>
      </div>
    </section>
  );
}
