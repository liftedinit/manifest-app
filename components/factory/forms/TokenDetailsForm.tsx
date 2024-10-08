import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TokenAction, TokenFormData } from '@/helpers/formReducer';
import { DenomUnit } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { TextInput, TextArea } from '@/components/react/inputs';
import { PlusIcon, TrashIcon } from '@/components/icons';
import { ArrowRightIcon } from '@/components/icons';

const TokenDetailsSchema = Yup.object().shape({
  subdenom: Yup.string().required('Subdenom is required'),
  display: Yup.string().required('Display is required').noProfanity(),

  symbol: Yup.string().required('Symbol is required').noProfanity(),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters long')
    .noProfanity(),
  uri: Yup.string().url('Must be a valid URL'),
  uriHash: Yup.string(),
  denomUnits: Yup.array()
    .of(
      Yup.object().shape({
        denom: Yup.string().required('Denom is required'),
        exponent: Yup.number().required('Exponent is required'),
        aliases: Yup.array().of(Yup.string()),
      })
    )
    .test('valid-denom-units', 'Invalid denom units', function (denomUnits) {
      if (!denomUnits || denomUnits.length < 2) return false;

      const additionalDenom = denomUnits[1];
      if (!additionalDenom.denom) {
        return this.createError({
          path: 'denomUnits[1].denom',
          message: 'Additional denom is required',
        });
      }
      if (![6, 9, 12, 18].includes(additionalDenom.exponent || 0)) {
        return this.createError({
          path: 'denomUnits[1].exponent',
          message: 'Exponent must be 6, 9, 12, or 18',
        });
      }

      return true;
    }),
});

const tokenExponents = [
  { exponent: -18, subdenom: 'atto', letter: 'a', description: '10⁻¹⁸' },
  { exponent: -15, subdenom: 'femto', letter: 'f', description: '10⁻¹⁵' },
  { exponent: -12, subdenom: 'pico', letter: 'p', description: '10⁻¹²' },
  { exponent: -9, subdenom: 'nano', letter: 'n', description: '10⁻⁹' },
  { exponent: -6, subdenom: 'micro', letter: 'u', description: '10⁻⁶' },
  { exponent: -3, subdenom: 'milli', letter: 'm', description: '10⁻³' },
];

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
  const [isValidForm, setIsValidForm] = useState(false);
  console.log(formData, isValidForm);
  const updateField = (field: keyof TokenFormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const updateDenomUnit = (index: number, field: keyof DenomUnit, value: any) => {
    const updatedDenomUnits = [...formData.denomUnits];
    updatedDenomUnits[index] = { ...updatedDenomUnits[index], [field]: value };
    updateField('denomUnits', updatedDenomUnits);
  };

  const fullDenom = `factory/${address}/${formData.subdenom}`;

  // Ensure there are always two denom units
  if (formData.denomUnits.length === 0) {
    updateField('denomUnits', [
      { denom: fullDenom, exponent: 0, aliases: [] },
      { denom: '', exponent: 6, aliases: [] },
    ]);
  } else if (formData.denomUnits.length === 1) {
    updateField('denomUnits', [...formData.denomUnits, { denom: '', exponent: 6, aliases: [] }]);
  }

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
          <div className="w-full">
            <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:text-[#FFFFFF99] dark:border-[#FFFFFF99] border-b-[black] pb-4">
              Token Metadata
            </h1>
            <Formik
              initialValues={formData}
              validationSchema={TokenDetailsSchema}
              onSubmit={nextStep}
            >
              {({ isValid, setFieldValue, handleChange, values }) => {
                setIsValidForm(isValid);
                return (
                  <Form className="min-h-[330px] flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextInput
                        label="Subdenom"
                        name="subdenom"
                        disabled={true}
                        value={formData.subdenom}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          updateField('subdenom', e.target.value);
                          handleChange(e);
                        }}
                      />
                      <TextInput
                        label="Display"
                        name="display"
                        value={formData.display}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          updateField('display', e.target.value);
                          handleChange(e);
                        }}
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
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextInput
                        label="URI"
                        name="uri"
                        value={formData.uri}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          updateField('uri', e.target.value);
                          handleChange(e);
                        }}
                      />

                      <TextInput
                        label="Symbol"
                        name="symbol"
                        value={formData.symbol}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          updateField('symbol', e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Denom Units</span>
                      </label>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <TextInput
                            label="Additional Denom"
                            name="denomUnits[1].denom"
                            value={formData.denomUnits[1]?.denom || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              updateDenomUnit(1, 'denom', e.target.value);
                              handleChange(e);
                            }}
                          />
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Exponent</span>
                            </label>
                            <div className="dropdown w-full dropdown-end cursor-pointer">
                              <label
                                tabIndex={0}
                                className="btn min-w-[120px] dark:text-[#FFFFFF99] text-[#161616] border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full flex items-center justify-between"
                              >
                                {formData.denomUnits[1]?.exponent || 'Select'}
                                <ArrowRightIcon className="text-xs dark:text-[#FFFFFF99] text-[#161616] -rotate-90" />
                              </label>
                              <ul
                                tabIndex={0}
                                className="dropdown-content z-[1] menu p-2 mt-2 shadow bg-base-300 rounded-box w-full max-h-60 overflow-y-auto"
                              >
                                {tokenExponents.map(({ exponent, letter }) => (
                                  <li key={exponent}>
                                    <a
                                      onClick={() => {
                                        updateDenomUnit(1, 'exponent', exponent);
                                        setFieldValue('denomUnits[1].exponent', exponent);
                                      }}
                                      className="flex justify-between items-center"
                                    >
                                      <span>{exponent}</span>
                                      <span className="text-xs opacity-70">
                                        {letter && `(${letter})`}
                                      </span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <TextInput
                          label="Base Denom"
                          name="denomUnits[0].denom"
                          value={fullDenom}
                          disabled={true}
                        />
                      </div>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
      <div className="flex space-x-3 mt-6 mx-auto w-full">
        <button onClick={prevStep} className="btn btn-neutral py-2.5 sm:py-3.5 w-1/2">
          Previous
        </button>
        <button
          type="submit"
          onClick={nextStep}
          className="w-1/2 btn px-5 py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
          disabled={!isValidForm}
        >
          Next: Confirmation
        </button>
      </div>
    </section>
  );
}
