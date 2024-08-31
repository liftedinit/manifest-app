import { chainName } from '@/config';
import { useFeeEstimation, useTx } from '@/hooks';
import { cosmos, strangelove_ventures } from '@chalabi/manifestjs';
import { Any } from '@chalabi/manifestjs/dist/codegen/google/protobuf/any';
import { MsgUpdateParams } from '@chalabi/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import React, { useState, useEffect } from 'react';
import { PiWarning } from 'react-icons/pi';

interface UpdateModalProps {
  modalId: string;
  admin: string;
  userAddress: string | undefined;
  allowExit: boolean | undefined;
}

export function UpdateAdminModal({
  modalId,
  admin,
  userAddress,
  allowExit,
}: Readonly<UpdateModalProps>) {
  const [newAdmin, setNewAdmin] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);

  const { estimateFee } = useFeeEstimation(chainName);
  const { tx } = useTx(chainName);
  const { updateParams } = strangelove_ventures.poa.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  useEffect(() => {
    const isValid = /^manifest1[a-zA-Z0-9]{38}$/.test(newAdmin);
    setIsValidAddress(isValid);
  }, [newAdmin]);

  const handleUpdate = async () => {
    if (!isValidAddress) return;

    const msgUpdateAdmin = updateParams({
      sender: admin ?? '',
      params: {
        admins: [newAdmin],
        allowValidatorSelfExit: allowExit ?? false,
      },
    });

    const anyMessage = Any.fromPartial({
      typeUrl: msgUpdateAdmin.typeUrl,
      value: MsgUpdateParams.encode(msgUpdateAdmin.value).finish(),
    });

    const groupProposalMsg = submitProposal({
      groupPolicyAddress: admin,
      messages: [anyMessage],
      metadata: '',
      proposers: [userAddress ?? ''],
      title: `Update PoA Admin`,
      summary: `This proposal will update the administrator of the PoA module to ${newAdmin}`,
      exec: 0,
    });

    const fee = await estimateFee(userAddress ?? '', [groupProposalMsg]);
    await tx([groupProposalMsg], {
      fee,
      onSuccess: () => {},
    });
  };

  return (
    <dialog id={modalId} className="modal">
      <form method="dialog" className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h3 className="font-bold text-lg">Update Admin</h3>
        <div className="divider divider-horizon -mt-0 -mb-0"></div>
        <div className="py-4 flex flex-col gap-4">
          <div className="p-4 border-l-[6px] border-base-300">
            <div className="flex flex-row gap-2 items-center mb-2">
              <PiWarning className="text-yellow-200" />
              <span className="text-sm text-yellow-200">Warning</span>
            </div>
            <p className="text-md font-thin">
              Currently, the admin is set to a group policy address. While the admin can be any
              manifest1 address, it is recommended to set the new admin to another group policy
              address.
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <label className="text-md font-thin">Admin Address</label>
            <input
              type="text"
              placeholder="manifest123..."
              className={`input input-bordered input-md w-full ${
                newAdmin && !isValidAddress ? 'input-error' : ''
              }`}
              value={newAdmin}
              onChange={e => setNewAdmin(e.target.value)}
            />
            {newAdmin && !isValidAddress && (
              <p className="text-error text-sm">Please enter a valid manifest1 address</p>
            )}
          </div>
        </div>
        <div className="modal-action">
          <button
            type="button"
            className="btn w-full btn-primary"
            onClick={handleUpdate}
            disabled={!isValidAddress || !newAdmin}
          >
            Update
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
