import { TokenAction, TokenFormData } from '@/helpers/formReducer';
import { DenomUnit } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { Formik, Form, Field } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput, TextArea } from '@/components/react/inputs';

const TokenDetailsSchema = Yup.object().shape({
  subdenom: Yup.string().required('Subdenom is required'),
  display: Yup.string().required('Display is required').noProfanity(),
  name: Yup.string().required('Name is required').noProfanity(),
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
        denom: Yup.string(),
        exponent: Yup.number(),
        aliases: Yup.array().of(Yup.string()),
      })
    )
    .test('valid-denom-units', 'Invalid denom units', function (denomUnits) {
      if (!denomUnits || denomUnits.length < 2) return false;

      // Validate the second denom unit (index 1)
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
    <section className="max-w-4xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-4">Token Metadata</h1>
      <Formik
        initialValues={formData}
        initialTouched={{
          subdenom: true,
          denomUnits: [{ denom: true, exponent: true }],
        }}
        validationSchema={TokenDetailsSchema}
        onSubmit={() => {}}
      >
        {({ isValid, dirty, setFieldValue }) => (
          <Form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Subdenom"
                name="subdenom"
                disabled={true}
                value={formData.subdenom}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateField('subdenom', e.target.value);
                  setFieldValue('subdenom', e.target.value);
                }}
              />
              <TextInput
                label="Display"
                name="display"
                value={formData.display}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateField('display', e.target.value);
                  setFieldValue('display', e.target.value);
                }}
              />
              <TextInput
                label="Name"
                name="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateField('name', e.target.value);
                  setFieldValue('name', e.target.value);
                }}
              />
              <TextInput
                label="Symbol"
                name="symbol"
                value={formData.symbol}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateField('symbol', e.target.value);
                  setFieldValue('symbol', e.target.value);
                }}
              />
            </div>

            <TextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                updateField('description', e.target.value);
                setFieldValue('description', e.target.value);
              }}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="URI"
                name="uri"
                value={formData.uri}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateField('uri', e.target.value);
                  setFieldValue('uri', e.target.value);
                }}
              />
              <TextInput
                label="URI Hash"
                name="uriHash"
                value={formData.uriHash}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateField('uriHash', e.target.value);
                  setFieldValue('uriHash', e.target.value);
                }}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Denom Units</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium">
                    Base Denom <span className="text-xs text-gray-500">(Cannot be changed)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full mt-1"
                    value={fullDenom.slice(0, 20) + '...' + fullDenom.slice(40, 100)}
                    disabled
                  />
                </div>
                <div className="flex space-x-2">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium">
                      Additional Denom{' '}
                      <span className="text-xs text-gray-500">(Display denom)</span>
                    </label>
                    <Field
                      name="denomUnits[1].denom"
                      type="text"
                      placeholder="Denom"
                      className="input input-bordered w-full mt-1"
                      value={formData.denomUnits[1]?.denom || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        updateDenomUnit(1, 'denom', e.target.value);
                        setFieldValue('denomUnits[1].denom', e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Exponent <span className="text-xs text-gray-500">(Decimals)</span>
                    </label>
                    <div className="dropdown mt-1 w-full">
                      <label
                        tabIndex={0}
                        className="btn m-0 w-full input input-bordered flex justify-between items-center"
                      >
                        {formData.denomUnits[1]?.exponent || 6}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow -mt-12 bg-base-100 rounded-box w-40 -ml-4"
                      >
                        {[6, 9, 12, 18].map(exp => (
                          <li key={exp}>
                            <a
                              onClick={() => {
                                updateDenomUnit(1, 'exponent', exp);
                                setFieldValue('denomUnits[1].exponent', exp);
                              }}
                            >
                              {exp}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <button type="button" onClick={prevStep} className="btn btn-neutral flex-1">
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary flex-1"
                disabled={!isValid}
              >
                Next: Confirmation
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
}
