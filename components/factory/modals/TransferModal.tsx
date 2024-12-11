import { useEffect } from 'react';
import { ExtendedMetadataSDKType, truncateString } from '@/utils';
import { useDenomAuthorityMetadata, useFeeEstimation, useTx } from '@/hooks';
import { chainName } from '@/config';
import { osmosis } from '@liftedinit/manifestjs';
import { createPortal } from 'react-dom';
import Yup from '@/utils/yupExtensions';
import { Form, Formik, FormikValues } from 'formik';
import { TextInput } from '@/components';
import { useToast } from '@/contexts';

const TokenOwnershipSchema = Yup.object().shape({
  newAdmin: Yup.string().required('New admin address is required').manifestAddress(),
});

export default function TransferModal({
  openTransferDenomModal,
  setOpenTransferDenomModal,
  denom,
  address,
  modalId,
  isOpen,
  onClose,
  onSuccess,
}: {
  openTransferDenomModal: boolean;
  setOpenTransferDenomModal: (open: boolean) => void;
  denom: ExtendedMetadataSDKType | null;
  address: string;
  modalId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);
  const { setToastMessage } = useToast();

  const handleCloseModal = (formikReset?: () => void) => {
    setOpenTransferDenomModal(false);
    formikReset?.();
  };

  const { denomAuthority, isDenomAuthorityLoading } = useDenomAuthorityMetadata(denom?.base ?? '');
  const formData = {
    denom: denom?.base ?? '',
    currentAdmin: denomAuthority,
    newAdmin: '',
  };

  const { tx, isSigning, setIsSigning } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { changeAdmin } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

  const handleTransfer = async (values: FormikValues, resetForm: () => void) => {
    setIsSigning(true);
    try {
      const msg = changeAdmin({
        sender: address,
        denom: denom?.base ?? '',
        newAdmin: values.newAdmin,
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
      let errorMessage = 'An unknown error occurred while transferring ownership.';

      if (error instanceof Error) {
        if (error.message.includes('unauthorized account')) {
          errorMessage = 'Unauthorized account. Please check your account and try again.';
        }
      }

      setToastMessage({
        type: 'alert-error',
        title: 'Error transferring ownership',
        description: errorMessage,
        bgColor: '#e74c3c',
      });
      throw error;
    } finally {
      setIsSigning(false);
    }
  };

  const modalContent = (
    <dialog
      id={modalId}
      className={`modal ${openTransferDenomModal ? 'modal-open' : ''}`}
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
        display: openTransferDenomModal ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Formik
        initialValues={formData}
        validationSchema={TokenOwnershipSchema}
        onSubmit={(values, { resetForm }) => handleTransfer(values, resetForm)}
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
              Update administrator for{' '}
              <span className="font-light text-primary">
                {denom?.display?.startsWith('factory')
                  ? denom?.display?.split('/').pop()?.toUpperCase()
                  : truncateString(denom?.display ?? 'DENOM', 12)}
              </span>
            </h3>
            <div className="divider divider-horizontal -mt-4 -mb-0"></div>
            {isDenomAuthorityLoading ? (
              <div className="skeleton h-[17rem] max-h-72 w-full"></div>
            ) : (
              <>
                <Form className="py-4 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2"></div>
                  <TextInput
                    label="SUBDENOM"
                    name="subdenom"
                    value={denom?.base}
                    title={denom?.base}
                    disabled={true}
                    helperText="This field cannot be modified"
                  />
                  <TextInput
                    name="currentAdmin"
                    label="Current Admin"
                    value={denomAuthority?.admin ?? 'No admin available'}
                    disabled={true}
                    helperText="This field cannot be modified"
                  />
                  <TextInput name="newAdmin" label="New Admin" onChange={handleChange} />
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
                    {isSigning ? (
                      <span className="loading loading-dots"></span>
                    ) : (
                      'Transfer Ownership'
                    )}
                  </button>
                </div>
              </>
            )}
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
