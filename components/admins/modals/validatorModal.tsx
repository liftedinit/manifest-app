import React, { useState, useEffect } from 'react';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { ExtendedValidatorSDKType } from '../components';
import ProfileAvatar from '@/utils/identicon';
import { BsThreeDots } from 'react-icons/bs';
import { DescriptionModal } from './descriptionModal';
import { chainName } from '@/config';
import { useTx, useFeeEstimation } from '@/hooks';
import { strangelove_ventures } from '@chalabi/manifestjs';
import { useChain } from '@cosmos-kit/react';
import { cosmos } from '@chalabi/manifestjs';
import { Any } from '@chalabi/manifestjs/dist/codegen/google/protobuf/any';
import { MsgSetPower } from '@chalabi/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { calculateIsUnsafe } from '@/utils/maths';

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
  const [isSigning, setIsSigning] = useState(false);
  const { tx } = useTx(chainName);
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
        {({ isValid }) => {
          return (
            <div className="modal-box">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={handleClose}
                type="button"
              >
                ✕
              </button>
              <h3 className="font-bold text-lg">Validator Details</h3>
              <div className="divider divider-horizon -mt-0"></div>
              <div className="flex flex-col justify-start items-start gap-2 px-4 mb-2">
                <span className="text-sm capitalize text-gray-400 truncate">VALIDATOR</span>
                <div className="flex flex-row justify-start items-center gap-4">
                  {validator.logo_url !== '' && (
                    <img className="h-10 w-10 rounded-full" src={validator.logo_url} alt="" />
                  )}
                  {validator.logo_url === '' && (
                    <ProfileAvatar walletAddress={validator.operator_address} size={64} />
                  )}
                  <span className="text-2xl">{validator.description.moniker}</span>
                </div>
              </div>

              <div className="p-4 flex flex-col rounded-md w-full  justify-start items-start gap-6">
                <div className="flex flex-col w-full px-4 py-2 bg-base-300 rounded-md gap-2">
                  <span className="text-sm text-gray-400">SECURITY CONTACT</span>
                  <span className="text-md rounded-md">
                    {isEmail(validator.description.security_contact)
                      ? validator.description.security_contact
                      : 'No Security Contact'}
                  </span>
                </div>
                <div className="flex flex-col w-full px-4 py-2 gap-2 bg-base-300 rounded-md">
                  <span className="text-sm text-gray-400">POWER</span>
                  <div className="flex flex-col gap-2 rounded-md">
                    <div className="flex flex-row gap-2 justify-between items-center">
                      <Field
                        name="power"
                        type="number"
                        placeholder={validator.consensus_power?.toString() ?? 'Inactive'}
                        className="input input-bordered input-xs w-2/3"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setPowerInput(e.target.value);
                        }}
                      />
                      <button
                        type="submit"
                        className="btn btn-xs btn-primary w-1/3"
                        disabled={!isValid}
                        onClick={() => {
                          handleUpdate({ power: power });
                        }}
                      >
                        {isSigning ? 'Signing...' : 'Update'}
                      </button>
                    </div>
                    <ErrorMessage name="power" component="div" className="text-error text-xs" />
                    {isUnsafe && Number(power) > 0 && (
                      <div className="text-warning text-xs">
                        Warning: This power update may be unsafe
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col w-full px-4 py-2 gap-2 bg-base-300 rounded-md">
                  <span className="text-sm text-gray-400">OPERATOR ADDRESS</span>
                  <span className="text-md rounded-md">
                    <TruncatedAddressWithCopy address={validator.operator_address} slice={42} />
                  </span>
                </div>
                <div className="flex flex-col w-full px-4 py-2 gap-2 bg-base-300 rounded-md">
                  <div className="flex flex-row justify-between items-center relative">
                    <span className="text-sm text-gray-400">DETAILS</span>
                    {validator.description.details.length > 50 && (
                      <button
                        className="btn btn-sm btn-ghost hover:bg-transparent absolute -right-2 -top-2"
                        onClick={handleDescription}
                      >
                        <BsThreeDots />
                      </button>
                    )}
                  </div>

                  <span className="text-md rounded-md" aria-label="details">
                    {validator.description.details
                      ? validator.description.details.substring(0, 50) +
                        (validator.description.details.length > 50 ? '...' : '')
                      : 'No Details'}
                  </span>
                </div>
              </div>
            </div>
          );
        }}
      </Formik>
      <DescriptionModal
        type="validator"
        modalId="validator-description-modal"
        details={validator.description.details ?? 'No Details'}
      />
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
