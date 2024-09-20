import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput, TextArea } from '@/components/react/inputs';

import { useTx, useFeeEstimation } from '@/hooks';
import { chainName } from '@/config';
import { IPFSMetadata } from '@/hooks';
import { ThresholdDecisionPolicy } from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types';
import { cosmos } from '@chalabi/manifestjs';
import { Any } from '@chalabi/manifestjs/dist/codegen/google/protobuf/any';
import { ExtendedGroupType } from '@/hooks';

export function UpdateGroupModal({
  group,
  policyAddress,
  address,
}: {
  group: ExtendedGroupType;
  policyAddress: string;
  address: string;
}) {
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const [isSigning, setIsSigning] = useState(false);

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

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    setVotingUnit(newUnit);
    setWindowSeconds(convertToSeconds(windowInput, newUnit));
  };

  const handleWindowInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const hasStateChanged = (newValue: any, originalValue: any) => {
    return newValue !== null && newValue !== undefined && newValue !== originalValue;
  };

  const buildMessages = () => {
    const messages: Any[] = [];

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
          address: Yup.string().required('Address is required').manifestAddress(),
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
    <dialog id="update-group-modal" className="modal">
      <div className="modal-box bg-[#FFFFFF] dark:bg-[#1D192D] rounded-[24px] max-w-[842px] p-6">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 className="text-lg font-semibold mb-4">Update Group</h3>
        <Formik
          initialValues={{
            name: group?.ipfsMetadata?.title || '',
            authors: group?.ipfsMetadata?.authors || '',
            summary: group?.ipfsMetadata?.summary || '',
            forum: group?.ipfsMetadata?.proposalForumURL || '',
            description: group?.ipfsMetadata?.details || '',
            threshold: group?.policies?.[0]?.decision_policy?.threshold || '',
            windowInput: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleConfirm}
        >
          {({ setFieldValue, values }) => (
            <Form className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <TextInput
                  label="Authors"
                  name="authors"
                  placeholder={
                    Array.isArray(values.authors)
                      ? values.authors.join(', ')
                      : (values.authors ?? 'No authors available')
                  }
                  value={values.authors}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setAuthors(e.target.value);
                    setFieldValue('authors', e.target.value);
                  }}
                />
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
                <div className="flex gap-2">
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
                    className="flex-grow"
                  />
                  <select
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUnitChange(e)}
                    value={votingUnit}
                    title="votingUnit"
                    className="select select-bordered mt-8 w-1/3"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              <TextArea
                label="Description"
                name="description"
                placeholder={group?.ipfsMetadata?.details ?? 'No description available'}
                value={values.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setDescription(e.target.value);
                  setFieldValue('description', e.target.value);
                }}
                className="w-full"
              />
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-neutral"
                  onClick={() =>
                    (document.getElementById('update-group-modal') as HTMLDialogElement).close()
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSigning || buildMessages().length === 0}
                >
                  {isSigning ? <span className="loading loading-spinner"></span> : 'Update'}
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
