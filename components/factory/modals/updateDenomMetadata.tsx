import { TokenFormData } from '@/helpers/formReducer';
import { useFeeEstimation } from '@/hooks/useFeeEstimation';
import { useTx } from '@/hooks/useTx';
import { cosmos, osmosis } from '@liftedinit/manifestjs';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput, TextArea } from '@/components/react/inputs';
import { truncateString, ExtendedMetadataSDKType } from '@/utils';
import { useEffect } from 'react';
import env from '@/config/env';
import { createPortal } from 'react-dom';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MsgSetDenomMetadata } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';

const TokenDetailsSchema = (context: { subdenom: string }) =>
  Yup.object().shape({
    display: Yup.string()
      .required('Display is required')
      .noProfanity()
      .test('display-contains-subdenom', 'Display must contain subdenom', function (value) {
        const subdenom = context.subdenom;
        return !subdenom || value.toLowerCase().includes(subdenom.slice(1).toLowerCase());
      }),
    name: Yup.string().required('Name is required').noProfanity(),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters long')
      .noProfanity(),
    uri: Yup.string()
      .url('Must be a valid URL')
      .matches(/^https:\/\//i, 'URL must use HTTPS protocol')
      .matches(/\.(jpg|jpeg|png|gif)$/i, 'URL must point to an image file')
      .supportedImageUrl(),
  });

export function UpdateDenomMetadataModal({
  openUpdateDenomMetadataModal,
  setOpenUpdateDenomMetadataModal,
  denom,
  address,
  modalId,
  onSuccess,
  admin,
  isGroup,
}: {
  openUpdateDenomMetadataModal: boolean;
  setOpenUpdateDenomMetadataModal: (open: boolean) => void;
  denom: ExtendedMetadataSDKType | null;
  address: string;
  modalId: string;
  onSuccess: () => void;
  admin: string;
  isGroup?: boolean;
}) {
  const handleCloseModal = (formikReset?: () => void) => {
    setOpenUpdateDenomMetadataModal(false);
    formikReset?.();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openUpdateDenomMetadataModal) {
        handleCloseModal();
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
  const { tx, isSigning, setIsSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);
  const { setDenomMetadata } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const handleUpdate = async (values: TokenFormData, resetForm: () => void) => {
    setIsSigning(true);
    const symbol = values.display.toUpperCase();
    try {
      const msg = isGroup
        ? submitProposal({
            groupPolicyAddress: admin,
            messages: [
              Any.fromPartial({
                typeUrl: MsgSetDenomMetadata.typeUrl,
                value: MsgSetDenomMetadata.encode({
                  sender: admin,
                  metadata: {
                    description: values.description || formData.description,
                    denomUnits:
                      [
                        { denom: fullDenom, exponent: 0, aliases: [symbol] },
                        { denom: symbol, exponent: 6, aliases: [fullDenom] },
                      ] || formData.denomUnits,
                    base: fullDenom,
                    display: symbol,
                    name: values.name || formData.name,
                    symbol: symbol,
                    uri: values.uri || formData.uri,
                    uriHash: '',
                  },
                }).finish(),
              }),
            ],
            metadata: '',
            proposers: [address ?? ''],
            title: `Update ${symbol} metadata`,
            summary: `This proposal will update ${symbol}'s metadata.`,
            exec: 0,
          })
        : setDenomMetadata({
            sender: address,
            metadata: {
              description: values.description || formData.description,
              denomUnits:
                [
                  { denom: fullDenom, exponent: 0, aliases: [symbol] },
                  { denom: symbol, exponent: 6, aliases: [fullDenom] },
                ] || formData.denomUnits,
              base: fullDenom,
              display: symbol,
              name: values.name || formData.name,
              symbol: symbol,
              uri: values.uri || formData.uri,
              uriHash: '',
            },
          });

      const fee = await estimateFee(address, [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          onSuccess();
          handleCloseModal(resetForm);
        },
      });
    } catch (error) {
      console.error('Error during transaction setup:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const modalContent = (
    <dialog
      id={modalId}
      className={`modal ${openUpdateDenomMetadataModal ? 'modal-open' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        height: '100vh',
        width: '100vw',
        display: openUpdateDenomMetadataModal ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Formik
        initialValues={formData}
        validationSchema={() => TokenDetailsSchema({ subdenom: baseDenom })}
        onSubmit={(values, { resetForm }) => handleUpdate(values, resetForm)}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ isValid, dirty, values, handleChange, handleSubmit, resetForm }) => (
          <div className="modal-box max-w-4xl mx-auto p-6 bg-[#F4F4FF] dark:bg-[#1D192D] rounded-[24px] shadow-lg relative">
            <form method="dialog">
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]"
                onClick={() => handleCloseModal(() => resetForm())}
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
                <TextInput
                  label="SUBDENOM"
                  name="subdenom"
                  value={fullDenom}
                  title={fullDenom}
                  disabled={true}
                  helperText="This field cannot be modified"
                />
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
                onClick={() => handleCloseModal(() => resetForm())}
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
      <form
        method="dialog"
        className="modal-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      >
        <button onClick={() => handleCloseModal()}>close</button>
      </form>
    </dialog>
  );

  // Only render if we're in the browser
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
