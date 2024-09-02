import React, { useEffect, useState } from 'react';
import { IPFSMetadata } from '@/hooks/useQueries';
import { cosmos } from '@chalabi/manifestjs';
import { PiTrashLight, PiPlusCircleThin, PiInfoLight } from 'react-icons/pi';
import { useTx, useFeeEstimation } from '@/hooks';
import { chainName } from '@/config';
import { ThresholdDecisionPolicy } from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types';
import { Any } from '@chalabi/manifestjs/dist/codegen/google/protobuf/any';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { isValidAddress } from '@/utils';

import { TextInput, TextArea } from '@/components/react/inputs';

interface Member {
  address: string;
  metadata: string;
  weight: string;
  added_at: Date;
  isCoreMember: boolean;
  isActive: boolean;
}

interface Group {
  group: {
    id: string;
    admin: string;
    metadata: string;
    ipfsMetadata: IPFSMetadata | null;
    members: { group_id: string; member: Member }[];
    policies: any[]; // TODO: Define type
  };
  address: string;
}

export function UpdateGroupModal({
  group,
  modalId,
  address,
  policyAddress,
}: Group & { modalId: string; policyAddress: string }) {
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);

  const maybeIpfsMetadata = group?.ipfsMetadata;
  const maybeTitle = maybeIpfsMetadata?.title;
  const maybeAuthors = maybeIpfsMetadata?.authors;
  const maybeSummary = maybeIpfsMetadata?.summary;
  const maybeProposalForumURL = maybeIpfsMetadata?.proposalForumURL;
  const maybeDetails = maybeIpfsMetadata?.details;
  const maybePolicies = group?.policies?.[0];
  const maybeDecisionPolicy = maybePolicies?.decision_policy;
  const maybeThreshold = maybeDecisionPolicy?.threshold;
  const maybeVotingPeriod = maybeDecisionPolicy?.windows?.voting_period;
  const maybeMembers = group?.members;

  const {
    updateGroupAdmin,
    updateGroupMembers,
    updateGroupMetadata,
    updateGroupPolicyAdmin,
    updateGroupPolicyDecisionPolicy,
    updateGroupPolicyMetadata,
  } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const [name, setName] = useState(maybeTitle ?? '');
  const [authors, setAuthors] = useState(maybeAuthors ?? '');
  const [summary, setSummary] = useState(maybeSummary ?? '');
  const [forum, setForum] = useState(maybeProposalForumURL ?? '');
  const [description, setDescription] = useState(maybeDetails ?? '');
  const [threshold, setThreshold] = useState(maybeThreshold ?? '');
  const [windowInput, setWindowInput] = useState('');
  const [votingUnit, setVotingUnit] = useState('days');
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    setAuthors(maybeAuthors ?? '');
    setSummary(maybeSummary ?? '');
    setForum(maybeProposalForumURL ?? '');
    setDescription(maybeDetails ?? '');
    setThreshold(maybeThreshold ?? '');
  }, [group]);

  const convertToSeconds = (input: string, unit: string) => {
    const value = parseFloat(input);
    let seconds;
    switch (unit) {
      case 'hours':
        seconds = value * 3600;
        break;
      case 'days':
        seconds = value * 86400;
        break;
      case 'weeks':
        seconds = value * 604800;
        break;
      case 'months':
        seconds = value * 2592000;
        break;
      default:
        seconds = value;
    }
    return seconds;
  };

  const [windowSeconds, setWindowSeconds] = useState(() =>
    convertToSeconds(windowInput, votingUnit)
  );

  const handleUnitChange = (e: { target: { value: any } }) => {
    const newUnit = e.target.value;
    setVotingUnit(newUnit);
    setWindowSeconds(convertToSeconds(windowInput, newUnit));
  };

  const handleWindowInputChange = (e: { target: { value: any } }) => {
    const newValue = e.target.value;
    setWindowInput(newValue);
    setWindowSeconds(convertToSeconds(newValue, votingUnit));
  };

  const votingWindow = parseFloat(maybeVotingPeriod?.slice(0, -1));

  let formattedVotingWindow: number;
  switch (votingUnit) {
    case 'hours':
      formattedVotingWindow = votingWindow / 60 / 60;
      break;
    case 'days':
      formattedVotingWindow = votingWindow / 24 / 60 / 60;
      break;
    case 'weeks':
      formattedVotingWindow = votingWindow / 7 / 24 / 60 / 60;
      break;
    case 'months':
      formattedVotingWindow = votingWindow / 30 / 24 / 60 / 60;
      break;
    default:
      formattedVotingWindow = votingWindow;
  }

  const isAdmin = (address: string) => {
    const adminAddresses = [group.admin].filter(Boolean);
    return adminAddresses.includes(address);
  };

  const isPolicyAdmin = (address: string) => {
    const adminAddresses = [maybePolicies?.admin].filter(Boolean);
    return adminAddresses.includes(address);
  };

  const initializeMembers = () => {
    return (
      group.members?.map(member => ({
        group_id: member.group_id,
        member: {
          address: member.member.address,
          metadata: member.member.metadata,
          weight: member.member.weight,
          added_at: member.member.added_at,
        },
        isCoreMember: true,
        isActive: true,
        isAdmin: isAdmin(member.member.address),
        isPolicyAdmin: isPolicyAdmin(member.member.address),
      })) || []
    );
  };

  const [initialMembers] = useState(initializeMembers());

  const [members, setMembers] = useState(initializeMembers());

  useEffect(() => {
    setMembers(initializeMembers());
  }, [group]);

  const handleMemberRemoval = (index: number) => {
    const member = members[index];
    if (member?.isCoreMember) {
      const updatedMember = {
        ...member,
        isActive: !member?.isActive,
        member: { ...member?.member, weight: member?.isActive ? '0' : '1' },
      };
      setMembers(members.map((mem, idx) => (idx === index ? updatedMember : mem)));
    } else {
      setMembers(members.filter((_, idx) => idx !== index));
    }
  };

  const hasStateChanged = (newValue: any, originalValue: any) => {
    return newValue !== null && newValue !== undefined && newValue !== originalValue;
  };

  const buildMessages = () => {
    const messages: Any[] = [];

    // Update Group Admin
    const newAdmin = members?.find(member => member?.isAdmin)?.member?.address;
    if (hasStateChanged(newAdmin, group.admin)) {
      const msg = updateGroupAdmin({
        admin: group.admin,
        groupId: BigInt(maybeMembers?.[0]?.group_id),
        newAdmin: newAdmin ?? '',
      });
      messages.push(
        Any.fromPartial({
          typeUrl: cosmos.group.v1.MsgUpdateGroupAdmin.typeUrl,
          value: cosmos.group.v1.MsgUpdateGroupAdmin.encode(msg.value).finish(),
        })
      );
    }

    // Update Group Members
    const membersChanged = members.some(
      (member, index) =>
        hasStateChanged(member.member.address, group.members[index]?.member.address) ||
        hasStateChanged(member.member.metadata, group.members[index]?.member.metadata) ||
        hasStateChanged(member.member.weight, group.members[index]?.member.weight)
    );
    if (membersChanged) {
      const msg = updateGroupMembers({
        admin: group.admin,
        groupId: BigInt(maybeMembers?.[0]?.group_id),
        memberUpdates: members.map(member => ({
          address: member.member.address,
          metadata: member.member.metadata,
          weight: member.member.weight,
        })),
      });
      messages.push(
        Any.fromPartial({
          typeUrl: cosmos.group.v1.MsgUpdateGroupMembers.typeUrl,
          value: cosmos.group.v1.MsgUpdateGroupMembers.encode(msg.value).finish(),
        })
      );
    }

    // Update Group Metadata
    if (
      hasStateChanged(name, maybeTitle) ||
      hasStateChanged(authors, maybeAuthors) ||
      hasStateChanged(summary, maybeSummary) ||
      hasStateChanged(forum, maybeProposalForumURL) ||
      hasStateChanged(description, maybeDetails)
    ) {
      const newMetadata = JSON.stringify({
        title: name,
        authors: authors,
        summary: summary,
        proposalForumURL: forum,
        details: description,
      });
      const msgGroupMetadata = updateGroupMetadata({
        admin: group.admin,
        groupId: BigInt(maybeMembers?.[0]?.group_id),
        metadata: newMetadata,
      });
      messages.push(
        Any.fromPartial({
          typeUrl: cosmos.group.v1.MsgUpdateGroupMetadata.typeUrl,
          value: cosmos.group.v1.MsgUpdateGroupMetadata.encode(msgGroupMetadata.value).finish(),
        })
      );

      const msgPolicyMetadata = updateGroupPolicyMetadata({
        groupPolicyAddress: maybePolicies?.address,
        admin: group.admin,
        metadata: newMetadata,
      });
      messages.push(
        Any.fromPartial({
          typeUrl: cosmos.group.v1.MsgUpdateGroupPolicyMetadata.typeUrl,
          value: cosmos.group.v1.MsgUpdateGroupPolicyMetadata.encode(
            msgPolicyMetadata.value
          ).finish(),
        })
      );
    }

    // Update Group Policy Admin
    const newPolicyAdmin = members?.find(member => member?.isPolicyAdmin)?.member?.address;
    if (hasStateChanged(newPolicyAdmin, maybePolicies?.admin)) {
      const msg = updateGroupPolicyAdmin({
        groupPolicyAddress: maybePolicies?.address,
        admin: group.admin,
        newAdmin: newPolicyAdmin ?? '',
      });
      messages.push(
        Any.fromPartial({
          typeUrl: cosmos.group.v1.MsgUpdateGroupPolicyAdmin.typeUrl,
          value: cosmos.group.v1.MsgUpdateGroupPolicyAdmin.encode(msg.value).finish(),
        })
      );
    }

    // Update Group Policy Decision Policy
    if (
      hasStateChanged(threshold, maybeThreshold) ||
      hasStateChanged(windowSeconds, maybeVotingPeriod?.seconds)
    ) {
      const thresholdMsg = {
        threshold: threshold,
        windows: {
          votingPeriod: { seconds: BigInt(0), nanos: 0 },
          minExecutionPeriod: { seconds: BigInt(0), nanos: 0 },
        },
      };

      const threshholdPolicyFromPartial = ThresholdDecisionPolicy.fromPartial(thresholdMsg);
      const threshholdPolicy = ThresholdDecisionPolicy.encode(threshholdPolicyFromPartial).finish();

      const msg = updateGroupPolicyDecisionPolicy({
        groupPolicyAddress: maybePolicies?.address,
        admin: group.admin,
        decisionPolicy: {
          threshold: threshold,
          percentage: threshold,
          value: threshholdPolicy,
          typeUrl: cosmos.group.v1.ThresholdDecisionPolicy.typeUrl,
        },
      });
      messages.push(
        Any.fromPartial({
          typeUrl: cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicy.typeUrl,
          value: cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicy.encode(msg.value).finish(),
        })
      );
    }

    return messages;
  };

  const handleConfirm = async (values: any) => {
    setIsSigning(true);
    try {
      const encodedMessages = buildMessages();
      const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
      const msg = submitProposal({
        groupPolicyAddress: policyAddress,
        proposers: [address],
        metadata: '',
        messages: encodedMessages,
        exec: 0,
        title: 'Update Group',
        summary: 'Update Group',
      });

      let fee;
      try {
        fee = await estimateFee(address, [msg]);
      } catch (feeError) {
        setIsSigning(false);
        console.error('Error estimating fee:', feeError);
        throw new Error('Failed to estimate transaction fee. Please try again.');
      }
      await tx([msg], {
        fee,
        onSuccess: () => {
          setIsSigning(false);
        },
      });
      setIsSigning(false);
    } catch (error) {
      console.error('Error in handleConfirm:', error);
      setIsSigning(false);
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .max(24, 'Name must be at most 24 characters')
      .noProfanity('Profanity is not allowed')
      .required('Required'),
    authors: Yup.string().noProfanity('Profanity is not allowed').required('Required'),
    summary: Yup.string()
      .noProfanity('Profanity is not allowed')
      .required('Required')
      .min(10, 'Summary must be at least 10 characters')
      .max(500, 'Summary must not exceed 500 characters'),
    threshold: Yup.number()
      .required('Threshold is required')
      .min(1, 'Threshold must be at least 1')
      .required('Required'),
    windowInput: Yup.number()
      .required('Voting window is required')
      .min(1, 'Voting window must be at least 1')
      .required('Required'),
    forum: Yup.string()
      .url('Invalid URL')
      .noProfanity('Profanity is not allowed')
      .required('Required'),
    description: Yup.string()
      .noProfanity('Profanity is not allowed')
      .required('Required')
      .min(10, 'Summary must be at least 10 characters')
      .max(500, 'Summary must not exceed 500 characters'),
    members: Yup.array().of(
      Yup.object().shape({
        member: Yup.object().shape({
          address: Yup.string()
            .required('Address is required')
            .test('is-valid-address', 'Invalid address format', value =>
              isValidAddress(value || '')
            ),
          metadata: Yup.string().noProfanity('Profanity is not allowed').required('Required'),
          weight: Yup.number()
            .required('Weight is required')
            .min(0, 'Weight must be at least 0')
            .max(threshold, 'Weight may not exceed threshold')
            .required('Required'),
        }),
      })
    ),
  });

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box absolute max-w-6xl mx-auto rounded-lg md:ml-20 shadow-lg min-h-96">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-1 top-1">✕</button>
        </form>
        <h3 className="text-lg font-semibold ">Update Group</h3>
        <div className="divider divider-horizon -mt-0 "></div>
        <Formik
          initialValues={{
            name: group?.ipfsMetadata?.title || '',
            authors: group?.ipfsMetadata?.authors || '',
            summary: group?.ipfsMetadata?.summary || '',
            forum: group?.ipfsMetadata?.proposalForumURL || '',
            description: group?.ipfsMetadata?.details || '',
            threshold: group?.policies?.[0]?.decision_policy?.threshold || '',
            windowInput: '',
            members: initialMembers,
          }}
          validationSchema={validationSchema}
          onSubmit={handleConfirm}
        >
          {({ setFieldValue, values }) => (
            <Form className="flex flex-row gap-4 justify-between items-center">
              <div className="relative bg-base-300 rounded-md p-4 w-1/2 h-[480px]">
                <div className="grid gap-4">
                  <div>
                    <TextInput
                      label="Group Name"
                      name="name"
                      placeholder={group?.ipfsMetadata?.title ?? 'No title available'}
                      value={values.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setName(e.target.value);
                        setFieldValue('name', e.target.value);
                      }}
                      maxLength={24}
                    />
                  </div>
                  <div>
                    <TextInput
                      label="Authors"
                      name="authors"
                      placeholder={group?.ipfsMetadata?.authors ?? 'No authors available'}
                      value={values.authors}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setAuthors(e.target.value);
                        setFieldValue('authors', e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <TextInput
                      label="Summary"
                      name="summary"
                      placeholder={group?.ipfsMetadata?.summary ?? 'No summary available'}
                      value={values.summary}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSummary(e.target.value);
                        setFieldValue('summary', e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <TextInput
                      label="Threshold"
                      name="threshold"
                      type="number"
                      placeholder={maybeThreshold ?? 'No threshold available'}
                      value={values.threshold}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setThreshold(e.target.value);
                        setFieldValue('threshold', e.target.value);
                      }}
                      min={1}
                    />
                  </div>
                  <div>
                    <TextInput
                      label="Forum"
                      name="forum"
                      placeholder={maybeProposalForumURL ?? 'No forum URL available'}
                      value={values.forum}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setForum(e.target.value);
                        setFieldValue('forum', e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-row gap-3">
                      <TextInput
                        label="Voting Window"
                        name="windowInput"
                        type="number"
                        placeholder={formattedVotingWindow.toString()}
                        value={values.windowInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleWindowInputChange(e);
                          setFieldValue('windowInput', e.target.value);
                        }}
                        min={1}
                      />
                      <select
                        onChange={handleUnitChange}
                        value={votingUnit}
                        title="votingUnit"
                        className="select select-bordered w-6/12 p-2"
                      >
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <TextArea
                      label="Description"
                      name="description"
                      placeholder={group?.ipfsMetadata?.details ?? 'No description available'}
                      value={values.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setDescription(e.target.value);
                        setFieldValue('description', e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="relative bg-base-300 rounded-md p-4 w-1/2 h-[480px]">
                <div className="flex flex-row justify-between items-center mb-2 -mt-1">
                  <label className="text-sm font-medium">Members</label>
                  <button
                    type="button"
                    className="btn btn-xs btn-primary justify-center items-center"
                    aria-label="addMembers"
                    onClick={() => {
                      const newMember = {
                        group_id: values.members[0]?.group_id || '',
                        member: {
                          address: '',
                          metadata: '',
                          weight: '',
                          added_at: new Date(),
                        },
                        isCoreMember: false,
                        isActive: true,
                        isAdmin: false,
                        isPolicyAdmin: false,
                      };
                      setFieldValue('members', [...values.members, newMember]);
                    }}
                  >
                    +
                  </button>
                </div>
                <FieldArray name="members">
                  {() => (
                    <div className="grid gap-4 sm:grid-cols-2 max-h-[26rem] overflow-y-auto">
                      {values.members.map((member, index) => (
                        <div
                          key={index}
                          className={`flex relative flex-col gap-2 px-4 py-2 rounded-md transition-all duration-200 max-h-[12.4rem] ${
                            !member.isActive ? 'bg-base-100' : 'bg-base-200'
                          }`}
                        >
                          <div className="flex flex-row justify-between items-center">
                            <span className="text-light text-md"># {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (member.isCoreMember) {
                                  setFieldValue(`members[${index}].isActive`, !member.isActive);
                                  setFieldValue(
                                    `members[${index}].member.weight`,
                                    member.isActive ? '0' : '1'
                                  );
                                } else {
                                  setFieldValue(`members[${index}]`, undefined);
                                  setFieldValue(
                                    'members',
                                    values.members.filter((_, idx) => idx !== index)
                                  );
                                }
                              }}
                              className={`btn btn-sm ${
                                member.isActive
                                  ? 'text-red-500 hover:bg-red-500'
                                  : 'text-primary hover:bg-primary '
                              } hover:text-white bg-base-300`}
                            >
                              {member.isActive ? <PiTrashLight /> : <PiPlusCircleThin />}
                            </button>
                          </div>
                          <div className="flex flex-col gap-4 mb-2">
                            <TextInput
                              label="Metadata"
                              name={`members.${index}.member.metadata`}
                              disabled={!member.isActive}
                              value={member.member.metadata}
                              onChange={e => {
                                setFieldValue(`members.${index}.member.metadata`, e.target.value);
                              }}
                              className="input input-sm input-bordered w-full disabled:border-base-100"
                              placeholder={member.isCoreMember ? member.member.metadata : 'Name'}
                            />
                            <TextInput
                              label="Address"
                              name={`members.${index}.member.address`}
                              disabled={member.isCoreMember || !member.isActive}
                              value={member.member.address}
                              onChange={e => {
                                setFieldValue(`members.${index}.member.address`, e.target.value);
                              }}
                              className="input input-sm input-bordered w-full disabled:border-base-100"
                              placeholder={member.isCoreMember ? member.member.address : 'Address'}
                            />
                            <TextInput
                              label="Weight"
                              name={`members.${index}.member.weight`}
                              type="number"
                              value={member.member.weight}
                              disabled={!member.isActive}
                              onChange={e => {
                                setFieldValue(`members.${index}.member.weight`, e.target.value);
                              }}
                              className="input input-sm input-bordered w-full disabled:border-base-100"
                              placeholder={member.isCoreMember ? member.member.weight : 'Weight'}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldArray>
              </div>
            </Form>
          )}
        </Formik>
        <div className="modal-action w-full flex flex-row items-center justify-between mt-4">
          <button
            onClick={() => {
              const modal = document.getElementById(
                `update_group_${group?.id}`
              ) as HTMLDialogElement;
              modal?.close();
            }}
            className="btn btn-neutral w-[49.5%]"
          >
            Cancel
          </button>
          <button
            className="btn btn-primary w-[49%]"
            type="submit"
            disabled={isSigning || buildMessages().length === 0}
            onClick={handleConfirm}
          >
            {isSigning ? <span className="loading loading-spinner"></span> : 'Update'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
