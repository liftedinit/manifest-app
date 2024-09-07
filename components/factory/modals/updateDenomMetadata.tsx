import { useState } from 'react';
import { TokenFormData } from '@/helpers/formReducer';
import { useFeeEstimation } from '@/hooks/useFeeEstimation';
import { useTx } from '@/hooks/useTx';
import { osmosis } from '@chalabi/manifestjs';
import { chainName } from '@/config';
import { DenomUnit } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput, TextArea } from '@/components/react/inputs';
//TODO: validation doesnt occur on denom unit entries when creating or updating
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

export function UpdateDenomMetadataModal({
  denom,
  address,
  modalId,
  onSuccess,
}: {
  denom: any;
  address: string;
  modalId: string;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<TokenFormData>({
    name: denom.name,
    symbol: denom.symbol,
    description: denom.description,
    display: denom.display,
    base: denom.base,
    denomUnits: denom.denom_units,
    uri: denom.uri,
    uriHash: denom.uri_hash,
    subdenom: denom.base.split('/').pop() || '',
    exponent: denom?.denom_units[1]?.exponent?.toString() ?? '6',
    label: denom?.denom_units[1]?.denom ?? 'mfx',
  });

  const [isSigning, setIsSigning] = useState(false);
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { setDenomMetadata } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

  const handleUpdate = async () => {
    setIsSigning(true);
    try {
      const msg = setDenomMetadata({
        sender: address,
        metadata: {
          description: formData.description,
          denomUnits: formData.denomUnits,
          base: formData.base,
          display: formData.display,
          name: formData.name,
          symbol: formData.symbol,
          uri: formData.uri,
          uriHash: formData.uriHash,
        },
      });

      const fee = await estimateFee(address, [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          onSuccess();
          const modal = document.getElementById(modalId) as HTMLDialogElement;
          modal?.close();
        },
      });
    } catch (error) {
      console.error('Error during transaction setup:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const updateField = (field: keyof TokenFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateDenomUnit = (index: number, field: keyof DenomUnit, value: any) => {
    const updatedDenomUnits = [...formData.denomUnits];
    updatedDenomUnits[index] = { ...updatedDenomUnits[index], [field]: value };
    updateField('denomUnits', updatedDenomUnits);
  };

  const isFormValid = () => {
    return (
      formData.subdenom &&
      formData.display &&
      formData.name &&
      formData.description &&
      formData.symbol &&
      formData.denomUnits.length === 2 &&
      formData.denomUnits[1].denom &&
      [6, 9, 12, 18].includes(formData.denomUnits[1].exponent)
    );
  };

  const fullDenom = `factory/${address}/${formData.subdenom}`;

  return (
    <dialog id={modalId} className="modal z-[1000]">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg mb-4">Update Denom Metadata</h3>
        <div className="divider divider-horizon -mt-4 -mb-0 "></div>
        <Formik
          initialValues={formData}
          validationSchema={TokenDetailsSchema}
          onSubmit={handleUpdate}
        >
          {({ isValid, dirty, setFieldValue }) => (
            <Form className="py-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                      value={fullDenom}
                      disabled
                    />
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-grow">
                      <label className="block text-sm font-medium">
                        Additional Denom{' '}
                        <span className="text-xs text-gray-500">(Display denom)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Denom"
                        className="input input-bordered w-full mt-1"
                        value={formData.denomUnits[1]?.denom || ''}
                        onChange={e => updateDenomUnit(1, 'denom', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Exponent <span className="text-xs text-gray-500">(Decimals)</span>
                      </label>
                      <div className="dropdown dropdown-left mt-1 w-full">
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
                          className="dropdown-content menu p-2 -mt-2 mr-2 shadow bg-base-300 rounded-lg w-full"
                        >
                          {[6, 9, 12, 18].map(exp => (
                            <li key={exp}>
                              <a onClick={() => updateDenomUnit(1, 'exponent', exp)}>{exp}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn btn-neutral mr-2">Cancel</button>
                </form>
                <button
                  type="submit"
                  className="btn btn-primary max-w-[6rem] w-full"
                  disabled={isSigning || !isValid}
                  onClick={() => {
                    if (isFormValid()) {
                      handleUpdate();
                    }
                  }}
                >
                  {isSigning ? <span className="loading loading-spinner"></span> : 'Update'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </dialog>
  );
}
