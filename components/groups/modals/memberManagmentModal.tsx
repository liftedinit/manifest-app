import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field, FieldProps } from 'formik';

import * as Yup from 'yup';
import { cosmos } from '@liftedinit/manifestjs';
import { useTx, useFeeEstimation } from '@/hooks';
import { chainName } from '@/config';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MemberSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { CopyIcon, TrashIcon } from '@/components/icons';
import { MdContacts } from 'react-icons/md';
import { TailwindModal } from '@/components/react/modal';

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
  const { tx, isSigning, setIsSigning } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);

  const validationSchema = Yup.object().shape({
    members: Yup.array().of(
      Yup.object().shape({
        address: Yup.string().required('Address is required').manifestAddress(),
        metadata: Yup.string()
          .noProfanity('Profanity is not allowed')
          .required('Required')
          .max(25, 'Maximum 25 characters'),
        weight: Yup.number().required('Weight is required').min(0, 'Weight must be at least 0'),
      })
    ),
  });

  const [members, setMembers] = useState<ExtendedMember[]>(() =>
    initialMembers.map(member => ({
      ...member,
      isNew: false,
      markedForDeletion: false,
      weight: member.weight || '1',
    }))
  );

  useEffect(() => {
    setMembers(
      initialMembers.map(member => ({
        ...member,
        isNew: false,
        markedForDeletion: false,
        weight: member.weight || '1',
      }))
    );
  }, [initialMembers]);

  const handleMemberToggleDeletion = (index: number) => {
    setMembers(
      members
        .map((member, idx) =>
          idx === index
            ? member.isNew
              ? undefined
              : { ...member, markedForDeletion: !member.markedForDeletion }
            : member
        )
        .filter(Boolean) as ExtendedMember[]
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

  const buildMessages = (formMembers: ExtendedMember[]) => {
    const messages: Any[] = [];
    const { updateGroupMembers } = cosmos.group.v1.MessageComposer.withTypeUrl;

    const memberUpdates = formMembers
      .filter(member => {
        const hasRequiredFields = member.address && member.metadata;
        return hasRequiredFields || member.markedForDeletion || !member.isNew;
      })
      .map(member => ({
        address: member.address,
        metadata: member.metadata,
        weight: member.markedForDeletion ? '0' : member.weight || '1',
      }));

    console.log('Member updates:', memberUpdates);

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

  const handleConfirm = async (values: { members: ExtendedMember[] }) => {
    setIsSigning(true);

    try {
      const encodedMessages = buildMessages(values.members);
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
    } catch (error) {
      console.error('Error submitting proposal:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleContactButtonClick = (index: number) => {
    setActiveIndex(index);
    setIsContactsOpen(true);
  };

  const submitFormRef = useRef<(() => void) | null>(null);

  return (
    <dialog id="member-management-modal" className="modal z-[150]">
      <div className="flex flex-col items-center w-full h-full">
        <div className="modal-box dark:bg-[#1D192D] bg-[#FFFFFF] rounded-[24px] max-w-[39rem] p-6 dark:text-white text-black">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <div className="flex justify-between items-center my-8">
            <h3 className="text-2xl font-semibold">Members</h3>
            <button
              type="button"
              className="btn btn-gradient w-[140px] h-[52px] text-white rounded-[12px] btn-sm"
              onClick={handleAddMember}
            >
              New member
            </button>
          </div>

          <Formik
            initialValues={{ members }}
            validationSchema={validationSchema}
            onSubmit={handleConfirm}
            enableReinitialize
          >
            {({ values, errors, touched, isValid, setFieldValue, handleSubmit }) => {
              submitFormRef.current = handleSubmit;
              return (
                <>
                  <div className="z-[9999]">
                    <TailwindModal
                      isOpen={isContactsOpen}
                      setOpen={setIsContactsOpen}
                      showContacts={true}
                      showMemberManagementModal={true}
                      onSelect={(selectedAddress: string) => {
                        if (activeIndex !== null) {
                          const fieldName = `members.${activeIndex}.address`;
                          setFieldValue(fieldName, selectedAddress);
                        }
                        setIsContactsOpen(false);
                      }}
                      currentAddress={address}
                    />
                  </div>
                  <Form>
                    <div className="flex items-center mb-4 px-4 text-sm text-gray-400">
                      <div className="w-[10%] ml-3">#</div>
                      <div className="w-[35%] ml-11">Name</div>
                      <div className="w-[45%]">Address</div>
                      <div className="w-[10%]"></div>
                    </div>
                    <div className="space-y-4 max-h-[420px] overflow-y-auto">
                      {values.members.map((member, index) => (
                        <div
                          key={index}
                          className={`flex items-center dark:bg-[#2D2A3E] bg-[#0000000A] rounded-[12px] p-3 ${
                            member.markedForDeletion ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="w-[10%] text-center">{index + 1}</div>
                          {/* Name Field with Daisy UI Tooltip */}
                          <div className="w-[35%] ml-12 pr-6 relative">
                            <Field name={`members.${index}.metadata`}>
                              {({ field, meta }: FieldProps) => (
                                <div>
                                  <input
                                    {...field}
                                    type="text"
                                    className={`input input-sm focus:outline-none input-ghost  bg-transparent w-full max-w-xs  ${
                                      meta.touched && meta.error ? 'input-error' : ''
                                    }`}
                                    placeholder="member name"
                                    disabled={member.markedForDeletion}
                                  />
                                  {meta.touched && meta.error && (
                                    <div
                                      className="tooltip tooltip-bottom tooltip-open tooltip-primary dark:text-white text-white text-xs mt-1 absolute left-1/2 transform translate-y-7 -translate-x-4 z-50"
                                      data-tip={meta.error}
                                    >
                                      {/* Invisible element to anchor the tooltip */}
                                      <div className="w-0 h-0"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Field>
                          </div>
                          {/* Address Field with Daisy UI Tooltip */}
                          <div className="w-[45%] flex items-center relative">
                            <Field name={`members.${index}.address`}>
                              {({ field, meta }: FieldProps) => (
                                <div className="flex-grow relative">
                                  <input
                                    {...field}
                                    type="text"
                                    className={`input input-sm focus:outline-none disabled:bg-transparent disabled:border-none bg-transparent input-ghost w-full ${
                                      meta.touched && meta.error ? 'input-error' : ''
                                    }`}
                                    placeholder="manifest1..."
                                    disabled={!member.isNew || member.markedForDeletion}
                                  />
                                  {member.isNew && !member.markedForDeletion && (
                                    <button
                                      type="button"
                                      aria-label="contacts-btn"
                                      onClick={() => {
                                        handleContactButtonClick(index);
                                        (
                                          document.getElementById(
                                            'member-management-modal'
                                          ) as HTMLDialogElement
                                        ).close();
                                      }}
                                      className="btn btn-primary btn-xs text-white absolute right-2 top-1"
                                    >
                                      <MdContacts className="w-4 h-4" />
                                    </button>
                                  )}
                                  {meta.touched && meta.error && (
                                    <div
                                      className="tooltip tooltip-bottom tooltip-open tooltip-primary dark:text-white text-white text-xs mt-1 absolute left-1/2 transform translate-y-7 -translate-x-4 z-50"
                                      data-tip={meta.error}
                                    >
                                      <div className="w-0 h-0"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Field>
                            <button
                              onClick={e => {
                                e.preventDefault();
                                navigator.clipboard.writeText(member.address);
                              }}
                              className="btn btn-ghost hover:bg-transparent btn-sm ml-2"
                            >
                              <CopyIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="w-[10%] flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleMemberToggleDeletion(index)}
                              className={`btn btn-primary btn-square rounded-[12px] btn-sm `}
                            >
                              <TrashIcon className="text-white w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Form>
                </>
              );
            }}
          </Formik>
        </div>

        <div className="mt-4 flex justify-center w-full">
          <button
            type="button"
            className="btn btn-ghost dark:text-white text-white"
            onClick={() =>
              (document.getElementById('member-management-modal') as HTMLDialogElement).close()
            }
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-gradient ml-4 text-white"
            onClick={() => submitFormRef.current?.()}
            disabled={isSigning}
          >
            {isSigning ? 'Signing...' : 'Save Changes'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
