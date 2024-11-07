import React, { useState, useEffect } from 'react';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { ExtendedValidatorSDKType } from '../components';
import ProfileAvatar from '@/utils/identicon';
import { BsThreeDots } from 'react-icons/bs';
import { DescriptionModal } from './descriptionModal';
import { chainName } from '@/config';
import { useTx, useFeeEstimation } from '@/hooks';
import { strangelove_ventures } from '@liftedinit/manifestjs';
import { useChain } from '@cosmos-kit/react';
import { cosmos } from '@liftedinit/manifestjs';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MsgSetPower } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import { Formik, Form, Field, ErrorMessage, FieldProps } from 'formik';
import * as Yup from 'yup';
import { calculateIsUnsafe } from '@/utils/maths';
import { TextInput } from '@/components/react';

const PowerUpdateSchema = Yup.object().shape({
  power: Yup.number()
    .typeError('Power must be a number')
    .required('Power is required')
    .min(0, 'Power must be a non-negative number')
    .integer('Power must be an integer'),
});

export function ValidatorDetailsModal({
  validator,
  modalId,
  admin,
  totalvp,
  validatorVPArray,
}: Readonly<{
  validator: ExtendedValidatorSDKType | null;
  modalId: string;
  admin: string;
  totalvp: string;
  validatorVPArray: { vp: bigint; moniker: string }[];
}>) {
  const [power, setPowerInput] = useState(validator?.consensus_power?.toString() || '');

  const { tx, isSigning, setIsSigning } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { address: userAddress } = useChain(chainName);

  const { setPower } = strangelove_ventures.poa.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const isUnsafe = React.useMemo(() => {
    return calculateIsUnsafe(power, validator?.consensus_power?.toString() || '', totalvp);
  }, [power, validator?.consensus_power, totalvp]);

  if (!validator) return null;

  const isEmail = (contact: string | undefined): boolean => {
    if (!contact) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(contact);
  };

  const handleDescription = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const modal = document.getElementById(`validator-description-modal`) as HTMLDialogElement;
    modal?.showModal();
  };

  const handleUpdate = async (values: { power: string }) => {
    setIsSigning(true);
    const msgSetPower = setPower({
      sender: admin ?? '',
      validatorAddress: validator.operator_address,
      power: BigInt(values.power),
      unsafe: isUnsafe,
    });

    const anyMessage = Any.fromPartial({
      typeUrl: msgSetPower.typeUrl,
      value: MsgSetPower.encode(msgSetPower.value).finish(),
    });

    const groupProposalMsg = submitProposal({
      groupPolicyAddress: admin,
      messages: [anyMessage],
      metadata: '',
      proposers: [userAddress ?? ''],
      title: `Update the Voting Power of ${validator.description.moniker}`,
      summary: `This proposal will update the voting power of ${validator.description.moniker} to ${values.power}`,
      exec: 0,
    });

    const fee = await estimateFee(userAddress ?? '', [groupProposalMsg]);
    await tx([groupProposalMsg], {
      fee,
      onSuccess: () => {
        setIsSigning(false);
      },
    });
    setIsSigning(false);
  };

  const handleClose = () => {
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    modal?.close();
  };

  return (
    <dialog id={modalId} className="modal">
      <Formik
        initialValues={{ power: power, totalvp, validatorVPArray }}
        validationSchema={PowerUpdateSchema}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({ isValid, errors, touched }) => {
          return (
            <div className="modal-box relative max-w-4xl min-h-96 flex flex-col md:flex-row md:ml-20 -mt-12 rounded-[24px] shadow-lg dark:bg-[#1D192D] bg-[#FFFFFF] transition-all duration-300">
              <button
                className="btn btn-sm btn-circle text-black dark:text-white btn-ghost absolute right-2 top-2"
                onClick={handleClose}
                type="button"
              >
                ✕
              </button>
              <div className="flex flex-col flex-grow w-full p-6 space-y-6">
                <h3 className="text-2xl font-bold text-black dark:text-white">Validator Details</h3>
                <div className="flex flex-col justify-start items-start gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">VALIDATOR</span>
                  <div className="flex flex-row justify-start items-center gap-4">
                    {validator?.logo_url !== '' ? (
                      <img className="h-16 w-16 rounded-full" src={validator.logo_url} alt="" />
                    ) : (
                      <ProfileAvatar walletAddress={validator?.operator_address} size={64} />
                    )}
                    <span className="text-2xl font-bold text-black dark:text-white">
                      {validator?.description.moniker}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="dark:bg-[#FFFFFF0F] bg-[#0000000A] rounded-[12px] p-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      SECURITY CONTACT
                    </span>
                    <p className="text-md text-black dark:text-white mt-2">
                      {isEmail(validator?.description.security_contact)
                        ? validator?.description.security_contact
                        : 'No Security Contact'}
                    </p>
                  </div>
                  <div className="dark:bg-[#FFFFFF0F] bg-[#0000000A] rounded-[12px] p-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">POWER</span>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex flex-row gap-2 justify-between items-center">
                        <div className="relative w-2/3">
                          <Field name="power">
                            {({ field, meta }: FieldProps) => (
                              <div className="relative">
                                <TextInput
                                  showError={false}
                                  {...field}
                                  type="number"
                                  placeholder={validator?.consensus_power?.toString() ?? 'Inactive'}
                                  className={`input input-bordered w-full ${
                                    meta.touched && meta.error ? 'input-error' : ''
                                  }`}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    field.onChange(e);
                                    setPowerInput(e.target.value);
                                  }}
                                />
                                {meta.touched && meta.error && (
                                  <div
                                    className="tooltip tooltip-bottom tooltip-open tooltip-error bottom-0 absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs"
                                    data-tip={meta.error}
                                  >
                                    <div className="w-0 h-0"></div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Field>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-gradient w-1/3"
                          disabled={!isValid || isSigning}
                          onClick={() => {
                            handleUpdate({ power: power });
                          }}
                        >
                          {isSigning ? (
                            <span className="loading loading-dots loading-sm"></span>
                          ) : (
                            'Update'
                          )}
                        </button>
                      </div>
                      {isUnsafe && Number(power) > 0 && (
                        <div className="text-warning text-xs">
                          Warning: This power update may be unsafe
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="dark:bg-[#FFFFFF0F] bg-[#0000000A] rounded-[12px] p-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      OPERATOR ADDRESS
                    </span>
                    <p className="text-md mt-2">
                      <TruncatedAddressWithCopy address={validator?.operator_address} slice={42} />
                    </p>
                  </div>
                  <div className="dark:bg-[#FFFFFF0F] bg-[#0000000A] rounded-[12px] p-4">
                    <div className="flex flex-row justify-between items-center relative">
                      <span className="text-sm text-gray-500 dark:text-gray-400">DETAILS</span>
                      {validator?.description.details.length > 50 && (
                        <button
                          className="btn btn-sm btn-ghost hover:bg-transparent absolute -right-2 -top-2"
                          onClick={handleDescription}
                        >
                          <BsThreeDots />
                        </button>
                      )}
                    </div>
                    <p className="text-md mt-2 text-black dark:text-white" aria-label="details">
                      {validator?.description.details
                        ? validator.description.details.substring(0, 50) +
                          (validator.description.details.length > 50 ? '...' : '')
                        : 'No Details'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Formik>
      <DescriptionModal
        type="validator"
        modalId="validator-description-modal"
        details={validator?.description.details ?? 'No Details'}
      />
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
