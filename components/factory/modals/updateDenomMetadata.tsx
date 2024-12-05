import { TokenFormData } from '@/helpers/formReducer';
import { useFeeEstimation } from '@/hooks/useFeeEstimation';
import { useTx } from '@/hooks/useTx';
import { osmosis } from '@liftedinit/manifestjs';
import { chainName } from '@/config';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput, TextArea } from '@/components/react/inputs';
import { truncateString, ExtendedMetadataSDKType } from '@/utils';
import { useEffect } from 'react';

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
  openUpdateDenomMetadataModal,
  setOpenUpdateDenomMetadataModal,
  denom,
  address,
  modalId,
  onSuccess,
}: {
  openUpdateDenomMetadataModal: boolean;
  setOpenUpdateDenomMetadataModal: (open: boolean) => void;
  denom: ExtendedMetadataSDKType | null;
  address: string;
  modalId: string;
  onSuccess: () => void;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openUpdateDenomMetadataModal) {
        setOpenUpdateDenomMetadataModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [openUpdateDenomMetadataModal]);
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
          base: fullDenom,
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
    <dialog
      id={modalId}
      className={`modal ${openUpdateDenomMetadataModal ? 'modal-open' : ''}`}
      onClose={() => setOpenUpdateDenomMetadataModal(false)}
    >
      <Formik
        initialValues={formData}
        validationSchema={TokenDetailsSchema}
        onSubmit={handleUpdate}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ isValid, dirty, values, handleChange, handleSubmit }) => (
          <div className="modal-box max-w-4xl mx-auto p-6 bg-[#F4F4FF] dark:bg-[#1D192D] rounded-[24px] shadow-lg">
            <form method="dialog">
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]"
                onClick={() => setOpenUpdateDenomMetadataModal(false)}
              >
                ✕
              </button>
            </form>
            <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">
              Update Metadata for{' '}
              <span className="font-light text-primary">
                {denom?.display?.startsWith('factory')
                  ? denom?.display?.split('/').pop()?.toUpperCase()
                  : truncateString(denom?.display ?? 'DENOM', 12)}
              </span>
            </h3>
            <div className="divider divider-horizontal -mt-4 -mb-0"></div>

            <Form className="py-4 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <TextInput label="SUBDENOM" name="subdemom" value={fullDenom} disabled={true} />
                <TextInput
                  label="NAME"
                  name="name"
                  value={values.name}
                  placeholder={denom?.name}
                  onChange={handleChange}
                />
                <TextInput
                  label="LOGO URL"
                  name="uri"
                  value={values.uri}
                  placeholder={denom?.uri}
                  onChange={handleChange}
                />
                <TextInput
                  label="TICKER"
                  name="display"
                  value={values.display}
                  placeholder={denom?.display}
                  onChange={handleChange}
                />
              </div>

              <TextArea
                label="DESCRIPTION"
                name="description"
                value={values.description}
                placeholder={denom?.description}
                onChange={handleChange}
              />
            </Form>
            <div className="mt-4 flex flex-row justify-center gap-2 w-full">
              <button
                type="button"
                className="btn w-1/2  focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A] dark:text-white text-black"
                onClick={() => setOpenUpdateDenomMetadataModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn w-1/2 btn-gradient text-white"
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
        <button onClick={() => setOpenUpdateDenomMetadataModal(false)}>close</button>
      </form>
    </dialog>
  );
}
