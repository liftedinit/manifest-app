import { Dialog } from '@headlessui/react';
import { cosmos, osmosis } from '@liftedinit/manifestjs';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MsgChangeAdmin } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import { Form, Formik, FormikValues } from 'formik';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { TextInput } from '@/components';
import { SignModal } from '@/components/react';
import env from '@/config/env';
import { useToast } from '@/contexts';
import { useDenomAuthorityMetadata, useFeeEstimation, useTx } from '@/hooks';
import { ExtendedMetadataSDKType, truncateString } from '@/utils';
import Yup from '@/utils/yupExtensions';

const TokenOwnershipSchema = Yup.object().shape({
  newAdmin: Yup.string().required('New admin address is required').manifestAddress(),
});

export default function TransferModal({
  denom,
  address,
  isOpen,
  onClose,
  onSuccess,
  admin,
  isGroup,
}: {
  denom: ExtendedMetadataSDKType | null;
  address: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  admin: string;
  isGroup?: boolean;
}) {
  const { setToastMessage } = useToast();

  const handleCloseModal = (formikReset?: () => void) => {
    formikReset?.();
    onClose();
  };

  const { denomAuthority, isDenomAuthorityLoading } = useDenomAuthorityMetadata(denom?.base ?? '');

  const formData = {
    subdenom: denom?.base || '',
    currentAdmin: denomAuthority?.admin || '',
    newAdmin: '',
  };

  const { tx, isSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);
  const { changeAdmin } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const handleTransfer = async (values: FormikValues, resetForm: () => void) => {
    try {
      const msg = isGroup
        ? submitProposal({
            groupPolicyAddress: admin,
            messages: [
              Any.fromPartial({
                typeUrl: MsgChangeAdmin.typeUrl,
                value: MsgChangeAdmin.encode(
                  changeAdmin({
                    sender: admin,
                    denom: denom?.base ?? '',
                    newAdmin: values.newAdmin,
                  }).value
                ).finish(),
              }),
            ],
            metadata: '',
            proposers: [address ?? ''],
            title: `Transfer ${denom?.display} ownership`,
            summary: `This proposal will transfer ownership of ${denom?.display} to ${values.newAdmin}`,
            exec: 0,
          })
        : changeAdmin({
            sender: address,
            denom: denom?.base ?? '',
            newAdmin: values.newAdmin,
          });

      await tx([msg], {
        fee: () => estimateFee(address, [msg]),
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
    }
  };

  const modalContent = (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className={`modal modal-open fixed flex p-0 m-0`}
      style={{
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <Formik
        initialValues={formData}
        validationSchema={TokenOwnershipSchema}
        onSubmit={(values, { resetForm }) => handleTransfer(values, resetForm)}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
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
                    value={values.subdenom}
                    onChange={handleChange}
                    disabled={true}
                    helperText="This field cannot be modified"
                  />
                  <TextInput
                    name="currentAdmin"
                    label="Current Admin"
                    value={values.currentAdmin}
                    onChange={handleChange}
                    disabled={true}
                    helperText="This field cannot be modified"
                  />
                  <TextInput
                    name="newAdmin"
                    label="New Admin"
                    value={values.newAdmin}
                    onChange={handleChange}
                    placeholder="Enter new admin address"
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

      <SignModal />
    </Dialog>
  );

  // Only render if we're in the browser
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
