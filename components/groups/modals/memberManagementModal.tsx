import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field, FieldProps } from 'formik';
import { createPortal } from 'react-dom';

import * as Yup from 'yup';
import { cosmos } from '@liftedinit/manifestjs';
import { useTx, useFeeEstimation } from '@/hooks';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MemberSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { CopyIcon, TrashIcon } from '@/components/icons';
import { MdContacts } from 'react-icons/md';
import { TailwindModal } from '@/components/react/modal';
import env from '@/config/env';

interface ExtendedMember extends MemberSDKType {
  isNew: boolean;
  markedForDeletion: boolean;
}

interface MemberManagementModalProps {
  modalId: string;
  members: MemberSDKType[];
  groupId: string;
  groupAdmin: string;
  policyAddress: string;
  address: string;
  onUpdate: () => void;
  setShowMemberManagementModal: (show: boolean) => void;
  showMemberManagementModal: boolean;
}

export function MemberManagementModal({
  modalId,
  members: initialMembers,
  groupId,
  groupAdmin,
  policyAddress,
  address,
  onUpdate,
  setShowMemberManagementModal,
  showMemberManagementModal,
}: MemberManagementModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMemberManagementModal) {
        setShowMemberManagementModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showMemberManagementModal]);
  const { tx, isSigning, setIsSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);

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

  const modalContent = (
    <dialog
      id={modalId}
      className={`modal ${showMemberManagementModal ? 'modal-open' : ''}`}
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
        display: showMemberManagementModal ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="modal-box relative max-w-3xl flex flex-col rounded-[24px] shadow-lg dark:bg-[#1D192D] bg-[#FFFFFF] transition-all duration-300 p-6">
        <button
          onClick={() => setShowMemberManagementModal(false)}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>

        <div className="flex justify-between items-center my-8">
          <h3 className="text-2xl font-semibold">Members</h3>
          <button
            type="button"
            className="btn btn-gradient xs:max-3xl:w-[140px] xxs:w-auto h-[52px] text-white rounded-[12px] btn-sm"
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
          {({ values, isValid, setFieldValue, handleSubmit, touched }) => {
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
                      (document.getElementById(modalId) as HTMLDialogElement)?.close();
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
                  <div className="space-y-4 max-h-[22rem] overflow-y-auto">
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
                                        document.getElementById(modalId) as HTMLDialogElement
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
                              navigator.clipboard.writeText(member.address).catch(error => {
                                console.error('Failed to copy address:', error);
                              });
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
                  <div className="mt-4 gap-6 flex justify-center w-full">
                    <button
                      type="button"
                      className="btn w-[calc(50%-8px)] btn-md focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A]"
                      onClick={() => setShowMemberManagementModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-md w-[calc(50%-8px)] btn-gradient  text-white"
                      onClick={() => submitFormRef.current?.()}
                      disabled={isSigning || !isValid || !touched}
                    >
                      {isSigning ? 'Signing...' : 'Save'}
                    </button>
                  </div>
                </Form>
              </>
            );
          }}
        </Formik>
      </div>
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
        onClick={() => setShowMemberManagementModal(false)}
      >
        <button>close</button>
      </form>
    </dialog>
  );

  // Only render if we're in the browser
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
