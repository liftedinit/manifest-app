import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { PiTrashLight, PiPlusCircleThin, PiCopy } from 'react-icons/pi';
import Yup from '@/utils/yupExtensions';
import { cosmos } from '@chalabi/manifestjs';
import { useTx, useFeeEstimation } from '@/hooks';
import { chainName } from '@/config';
import { Any } from '@chalabi/manifestjs/dist/codegen/google/protobuf/any';
import { MemberSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types';

interface ExtendedMember extends MemberSDKType {
  isNew: boolean;
  markedForDeletion: boolean;
}

interface MemberManagementModalProps {
  members: MemberSDKType[];
  groupId: string;
  groupAdmin: string;
  policyAddress: string;
  address: string;
  onUpdate: () => void;
}

export function MemberManagementModal({
  members: initialMembers,
  groupId,
  groupAdmin,
  policyAddress,
  address,
  onUpdate,
}: MemberManagementModalProps) {
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const [isSigning, setIsSigning] = useState(false);

  const validationSchema = Yup.object().shape({
    members: Yup.array().of(
      Yup.object().shape({
        address: Yup.string().required('Address is required').manifestAddress(),
        metadata: Yup.string().noProfanity('Profanity is not allowed').required('Required'),
        weight: Yup.number()
          .required('Weight is required')
          .min(0, 'Weight must be at least 0')
          .required('Required'),
      })
    ),
  });

  const [members, setMembers] = useState<ExtendedMember[]>(() =>
    initialMembers.map(member => ({
      ...member,
      isNew: false,
      markedForDeletion: false,
    }))
  );

  useEffect(() => {
    setMembers(
      initialMembers.map(member => ({
        ...member,
        isNew: false,
        markedForDeletion: false,
      }))
    );
  }, [initialMembers]);

  const handleMemberToggleDeletion = (index: number) => {
    setMembers(
      members.map((member, idx) =>
        idx === index ? { ...member, markedForDeletion: !member.markedForDeletion } : member
      )
    );
  };

  const handleAddMember = () => {
    setMembers([
      ...members,
      {
        address: '',
        metadata: '',
        weight: '1',
        isNew: true,
        markedForDeletion: false,
      } as ExtendedMember,
    ]);
  };

  const buildMessages = () => {
    const messages: Any[] = [];
    const { updateGroupMembers } = cosmos.group.v1.MessageComposer.withTypeUrl;

    const memberUpdates = members
      .filter(member => !member.markedForDeletion || member.isNew)
      .map(member => ({
        address: member.address,
        metadata: member.metadata,
        weight: member.markedForDeletion ? '0' : member.weight,
      }));

    const msg = updateGroupMembers({
      admin: groupAdmin,
      groupId: BigInt(groupId),
      memberUpdates,
    });
    messages.push(
      Any.fromPartial({
        typeUrl: cosmos.group.v1.MsgUpdateGroupMembers.typeUrl,
        value: cosmos.group.v1.MsgUpdateGroupMembers.encode(msg.value).finish(),
      })
    );

    return messages;
  };

  const handleConfirm = async () => {
    setIsSigning(true);

    const encodedMessages = buildMessages();
    const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
    const msg = submitProposal({
      groupPolicyAddress: policyAddress,
      proposers: [address],
      metadata: '',
      messages: encodedMessages,
      exec: 0,
      title: 'Update Group Members',
      summary: 'Update Group Members',
    });

    const fee = await estimateFee(address, [msg]);
    await tx([msg], {
      fee,
      onSuccess: () => {
        setIsSigning(false);
        onUpdate();
      },
    });
  };

  return (
    <dialog id="member-management-modal" className="modal">
      <div className="modal-box bg-[#1D192D] rounded-[24px] max-w-[842px] p-6 text-white">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 className="text-2xl font-semibold mb-6">Members</h3>
        <Formik
          initialValues={{ members }}
          validationSchema={validationSchema}
          onSubmit={handleConfirm}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="flex justify-between items-center mb-4">
                <div className="grid grid-cols-12 w-full text-sm text-gray-400">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Name</div>
                  <div className="col-span-6">Address</div>
                  <div className="col-span-1"></div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm rounded-full px-4"
                  onClick={handleAddMember}
                >
                  New member
                </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {members.map((member, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-12 items-center bg-[#2D2A3E] rounded-lg p-3 ${member.markedForDeletion ? 'opacity-50' : ''}`}
                  >
                    <div className="col-span-1">{index + 1}</div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={member.metadata}
                        onChange={e => {
                          const newMembers = [...members];
                          newMembers[index].metadata = e.target.value;
                          setMembers(newMembers);
                        }}
                        className="input input-sm input-ghost w-full max-w-xs"
                        placeholder="Unknown type"
                        disabled={member.markedForDeletion}
                      />
                    </div>
                    <div className="col-span-6 flex items-center">
                      <input
                        type="text"
                        value={member.address}
                        onChange={e => {
                          if (member.isNew) {
                            const newMembers = [...members];
                            newMembers[index].address = e.target.value;
                            setMembers(newMembers);
                          }
                        }}
                        className="input input-sm input-ghost w-full"
                        placeholder="manifest1..."
                        disabled={!member.isNew || member.markedForDeletion}
                      />
                      <button className="btn btn-ghost btn-sm ml-2">
                        <PiCopy />
                      </button>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleMemberToggleDeletion(index)}
                        className={`btn btn-ghost btn-sm ${member.markedForDeletion ? 'text-success' : 'text-error'}`}
                      >
                        <PiTrashLight size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    (
                      document.getElementById('member-management-modal') as HTMLDialogElement
                    ).close()
                  }
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSigning}>
                  {isSigning ? 'Signing...' : 'Save Changes'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
