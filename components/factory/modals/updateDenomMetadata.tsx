import { useState } from 'react';
import { TokenFormData } from '@/helpers/formReducer';
import { useFeeEstimation } from '@/hooks/useFeeEstimation';
import { useTx } from '@/hooks/useTx';
import { osmosis } from '@liftedinit/manifestjs';
import { chainName } from '@/config';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput, TextArea } from '@/components/react/inputs';
import { truncateString } from '@/utils';

const TokenDetailsSchema = Yup.object().shape({
  display: Yup.string().required('Display is required').noProfanity(),
  name: Yup.string().required('Name is required').noProfanity(),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters long')
    .noProfanity(),
  uri: Yup.string().url('Must be a valid URL'),
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
  const baseDenom = denom?.base?.split('/').pop() || '';
  const fullDenom = `factory/${address}/${baseDenom}`;
  const symbol = baseDenom.slice(1).toUpperCase();
  const formData = {
    name: denom?.name || '',
    symbol: denom?.display || '',
    description: denom?.description || '',
    display: denom?.display || '',
    base: fullDenom || '',
    denomUnits: denom?.denom_units || [
      { denom: fullDenom, exponent: 0, aliases: [symbol] },
      { denom: symbol, exponent: 6, aliases: [fullDenom] },
    ],
    uri: denom?.uri || '',
    uriHash: denom?.uri_hash || '',
    subdenom: baseDenom,
    exponent: '6',
    label: fullDenom,
  };
  const { tx, isSigning, setIsSigning } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { setDenomMetadata } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

  const handleUpdate = async (values: TokenFormData) => {
    setIsSigning(true);
    const symbol = values.display.toUpperCase();
    try {
      const msg = setDenomMetadata({
        sender: address,
        metadata: {
          description: values.description,
          denomUnits: [
            { denom: fullDenom, exponent: 0, aliases: [symbol] },
            { denom: values.display, exponent: 6, aliases: [fullDenom] },
          ],
          base: fullDenom, // Use the full denom as the base
          display: symbol,
          name: values.name,
          symbol: symbol,
          uri: values.uri,
          uriHash: '', // Leave this empty if you don't have a URI hash
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

  return (
    <dialog id={modalId} className="modal">
      <Formik
        initialValues={formData}
        validationSchema={TokenDetailsSchema}
        onSubmit={handleUpdate}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ isValid, dirty, values, handleChange, handleSubmit }) => (
          <div className="flex flex-col items-center w-full h-full">
            <div className="modal-box max-w-4xl mx-auto p-6 bg-[#F4F4FF] dark:bg-[#1D192D] rounded-[24px] shadow-lg">
              <form method="dialog">
                <button
                  type="button"
                  className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]"
                  onClick={() => {
                    const modal = document.getElementById(modalId) as HTMLDialogElement;
                    modal?.close();
                  }}
                >
                  ✕
                </button>
              </form>
              <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">
                Update Metadata for{' '}
                <span className="font-light text-primary">
                  {truncateString(denom?.display ?? 'DENOM', 30).toUpperCase()}
                </span>
              </h3>
              <div className="divider divider-horizontal -mt-4 -mb-0"></div>

              <Form className="py-4 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextInput label="SUBDENOM" name="subdemom" value={fullDenom} disabled={true} />
                  <TextInput label="NAME" name="name" value={values.name} onChange={handleChange} />
                  <TextInput
                    label="LOGO URL"
                    name="uri"
                    value={values.uri}
                    onChange={handleChange}
                  />
                  <TextInput
                    label="TICKER"
                    name="display"
                    value={values.display}
                    onChange={handleChange}
                  />
                </div>

                <TextArea
                  label="DESCRIPTION"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                />
              </Form>
            </div>
            {/* Action buttons */}
            <div className="mt-4 flex justify-center w-full">
              <button
                type="button"
                className="btn btn-secondary dark:text-white text-black"
                onClick={() => {
                  const modal = document.getElementById(modalId) as HTMLDialogElement;
                  modal?.close();
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-gradient ml-4 text-white"
                onClick={() => handleSubmit()}
                disabled={isSigning || !isValid || !dirty}
              >
                {isSigning ? <span className="loading loading-dots"></span> : 'Update'}
              </button>
            </div>
          </div>
        )}
      </Formik>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
