import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput, TextArea, NumberInput } from '@/components/react/inputs';

import { useTx, useFeeEstimation, ExtendedGroupType } from '@/hooks';
import {
  ThresholdDecisionPolicy,
  ThresholdDecisionPolicySDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { cosmos } from '@liftedinit/manifestjs';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import env from '@/config/env';
import { createPortal } from 'react-dom';

export function UpdateGroupModal({
  group,
  policyAddress,
  address,
  onUpdate,
  showUpdateModal,
  setShowUpdateModal,
}: {
  group: ExtendedGroupType;
  policyAddress: string;
  address: string;
  onUpdate: () => void;
  showUpdateModal: boolean;
  setShowUpdateModal: (show: boolean) => void;
}) {
  const { tx, isSigning, setIsSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);

  const maybeIpfsMetadata = group?.ipfsMetadata;
  const maybeTitle = maybeIpfsMetadata?.title ?? '';
  const maybeAuthors = maybeIpfsMetadata?.authors ?? '';
  const maybeSummary = maybeIpfsMetadata?.summary ?? '';
  const maybeProposalForumURL = maybeIpfsMetadata?.proposalForumURL ?? '';
  const maybeDetails = maybeIpfsMetadata?.details ?? '';
  const maybePolicies = group?.policies?.[0];
  const maybeDecisionPolicy = maybePolicies?.decision_policy;
  const maybeThreshold = (maybeDecisionPolicy as ThresholdDecisionPolicySDKType)?.threshold ?? '';
  const maybeVotingPeriod = (maybeDecisionPolicy as ThresholdDecisionPolicySDKType)?.windows
    ?.voting_period;
  const maybeMembers = group?.members;

  const { updateGroupMetadata, updateGroupPolicyDecisionPolicy, updateGroupPolicyMetadata } =
    cosmos.group.v1.MessageComposer.withTypeUrl;

  const [name, setName] = useState(maybeTitle);
  const [authors, setAuthors] = useState(maybeAuthors);
  const [summary, setSummary] = useState(maybeSummary);
  const [forum, setForum] = useState(maybeProposalForumURL);
  const [description, setDescription] = useState(maybeDetails);
  const [threshold, setThreshold] = useState(maybeThreshold);
  const [votingPeriod, setVotingPeriod] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Initialize voting period state from existing data if available
  useEffect(() => {
    const initialVotingPeriodSeconds = maybeVotingPeriod ? Number(maybeVotingPeriod.seconds) : 0;
    const secondsToDHMS = (totalSeconds: number) => {
      const days = Math.floor(totalSeconds / (3600 * 24)) || 0;
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600) || 0;
      const minutes = Math.floor((totalSeconds % 3600) / 60) || 0;
      const seconds = totalSeconds % 60 || 0;
      return { days, hours, minutes, seconds };
    };
    const initialVotingPeriod = secondsToDHMS(initialVotingPeriodSeconds);
    setVotingPeriod(initialVotingPeriod);
  }, [maybeVotingPeriod]);

  // Update windowSeconds whenever votingPeriod changes
  const [windowSeconds, setWindowSeconds] = useState(0);
  useEffect(() => {
    const totalSeconds =
      (Number(votingPeriod.days) || 0) * 86400 +
      (Number(votingPeriod.hours) || 0) * 3600 +
      (Number(votingPeriod.minutes) || 0) * 60 +
      (Number(votingPeriod.seconds) || 0);
    setWindowSeconds(totalSeconds);
  }, [votingPeriod]);

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
    const numericThreshold = Number(threshold) || 0;
    const originalThreshold = Number(maybeThreshold) || 0;
    const originalVotingPeriodSeconds = Number(maybeVotingPeriod?.seconds) || 0;

    if (
      hasStateChanged(numericThreshold, originalThreshold) ||
      hasStateChanged(windowSeconds, originalVotingPeriodSeconds)
    ) {
      const thresholdMsg = {
        threshold: numericThreshold.toString(),
        windows: {
          votingPeriod: { seconds: BigInt(windowSeconds || 0), nanos: 0 },
          minExecutionPeriod: { seconds: BigInt(0), nanos: 0 },
        },
      };

      const thresholdPolicyFromPartial = ThresholdDecisionPolicy.fromPartial(thresholdMsg);
      const thresholdPolicy = ThresholdDecisionPolicy.encode(thresholdPolicyFromPartial).finish();

      const msg = updateGroupPolicyDecisionPolicy({
        groupPolicyAddress: maybePolicies?.address,
        admin: group.admin,
        decisionPolicy: {
          value: thresholdPolicy,
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
      if (encodedMessages.length === 0) {
        setIsSigning(false);
        alert('No changes detected.');
        return;
      }
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
          onUpdate();
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
      .when(['threshold', 'votingPeriod'], {
        is: (threshold: number, votingPeriod: any) => {
          // Convert both values to numbers for comparison
          const hasThresholdChange = Number(threshold) !== Number(maybeThreshold);
          const totalSeconds =
            (Number(votingPeriod?.days) || 0) * 86400 +
            (Number(votingPeriod?.hours) || 0) * 3600 +
            (Number(votingPeriod?.minutes) || 0) * 60 +
            (Number(votingPeriod?.seconds) || 0);
          const originalSeconds = Number(maybeVotingPeriod?.seconds) || 0;
          const hasVotingPeriodChange = totalSeconds !== originalSeconds;

          return hasThresholdChange || hasVotingPeriodChange;
        },
        then: schema => schema.optional(),
        otherwise: schema =>
          schema.when(['authors', 'summary', 'forum', 'description'], {
            is: (authors: string, summary: string, forum: string, description: string) =>
              !authors && !summary && !forum && !description,
            then: schema => schema.required('At least one metadata field is required'),
            otherwise: schema => schema.optional(),
          }),
      }),
    authors: Yup.string().noProfanity('Profanity is not allowed').optional(),
    summary: Yup.string()
      .noProfanity('Profanity is not allowed')
      .min(10, 'Summary must be at least 10 characters')
      .max(500, 'Summary must not exceed 500 characters')
      .optional(),
    threshold: Yup.number().min(1, 'Threshold must be at least 1').optional(),
    votingPeriod: Yup.object()
      .shape({
        days: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
        hours: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
        minutes: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
        seconds: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
      })
      .test('min-total-time', 'Voting period must be at least 30 minutes', function (value) {
        // Only validate if voting period is being updated
        if (!value || Object.values(value).every(v => v === 0)) return true;

        const { days, hours, minutes, seconds } = value;
        const totalSeconds =
          (Number(days) || 0) * 86400 +
          (Number(hours) || 0) * 3600 +
          (Number(minutes) || 0) * 60 +
          (Number(seconds) || 0);
        return totalSeconds >= 1800;
      }),
    forum: Yup.string().url('Invalid URL').noProfanity('Profanity is not allowed').optional(),
    description: Yup.string()
      .noProfanity('Profanity is not allowed')
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must not exceed 500 characters')
      .optional(),
  });

  const hasAnyChanges = (values: any) => {
    // Check metadata changes
    const hasMetadataChanges =
      values.name !== maybeTitle ||
      values.authors !== maybeAuthors ||
      values.summary !== maybeSummary ||
      values.forum !== maybeProposalForumURL ||
      values.description !== maybeDetails;

    // Check policy changes
    const hasThresholdChange = values.threshold !== maybeThreshold;

    // Check voting period changes
    const totalSeconds =
      (Number(values.votingPeriod.days) || 0) * 86400 +
      (Number(values.votingPeriod.hours) || 0) * 3600 +
      (Number(values.votingPeriod.minutes) || 0) * 60 +
      (Number(values.votingPeriod.seconds) || 0);
    const originalSeconds = Number(maybeVotingPeriod?.seconds) || 0;
    const hasVotingPeriodChange = totalSeconds !== originalSeconds;

    return hasMetadataChanges || hasThresholdChange || hasVotingPeriodChange;
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showUpdateModal) {
        e.stopPropagation();
        setShowUpdateModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showUpdateModal, setShowUpdateModal]);

  const modalContent = (
    <dialog
      id="update-group-modal"
      className={`modal ${showUpdateModal ? 'modal-open' : ''}`}
      aria-modal="true"
      role="dialog"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        width: '100vw',
        height: '100vh',
        display: showUpdateModal ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Formik
        initialValues={{
          name: name,
          authors: authors,
          summary: summary,
          forum: forum,
          description: description,
          threshold: threshold,
          votingPeriod: votingPeriod,
        }}
        validationSchema={validationSchema}
        onSubmit={handleConfirm}
        enableReinitialize
      >
        {({ setFieldValue, values, isValid, dirty, errors, touched }) => (
          <>
            <div
              className="flex flex-col items-center justify-center w-full h-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-box dark:bg-[#1D192D] bg-[#FFFFFF] rounded-[24px] max-w-4xl p-6 dark:text-white text-black relative">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-semibold mb-4">Update Group</h3>

                <Form className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      label="Group Name"
                      name="name"
                      placeholder="Group Name"
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
                      placeholder="Authors"
                      value={values.authors}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setAuthors(e.target.value);
                        setFieldValue('authors', e.target.value);
                      }}
                    />
                    <TextInput
                      label="Summary"
                      name="summary"
                      placeholder="Summary"
                      value={values.summary}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSummary(e.target.value);
                        setFieldValue('summary', e.target.value);
                      }}
                    />
                    <TextInput
                      label="Forum URL"
                      name="forum"
                      placeholder="Forum URL"
                      value={values.forum}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setForum(e.target.value);
                        setFieldValue('forum', e.target.value);
                      }}
                    />
                    <TextArea
                      label="Description"
                      name="description"
                      placeholder="Description"
                      value={values.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setDescription(e.target.value);
                        setFieldValue('description', e.target.value);
                      }}
                      className="w-full md:col-span-2"
                    />
                    <NumberInput
                      label="Threshold"
                      name="threshold"
                      placeholder="Threshold"
                      value={values.threshold}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = Math.max(1, parseInt(e.target.value) || 1);
                        setThreshold(value.toString());
                        setFieldValue('threshold', value);
                      }}
                      min={1}
                    />
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-1 font-medium text-[#00000099] dark:text-[#FFFFFF99]">
                        Voting Period
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        <NumberInput
                          name="votingPeriod.days"
                          placeholder="Days"
                          label="Days"
                          value={values.votingPeriod.days}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setVotingPeriod(prev => ({ ...prev, days: value }));
                            setFieldValue('votingPeriod.days', value);
                          }}
                          min={0}
                        />
                        <NumberInput
                          name="votingPeriod.hours"
                          placeholder="Hours"
                          label="Hours"
                          value={values.votingPeriod.hours}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setVotingPeriod(prev => ({ ...prev, hours: value }));
                            setFieldValue('votingPeriod.hours', value);
                          }}
                          min={0}
                        />
                        <NumberInput
                          name="votingPeriod.minutes"
                          placeholder="Minutes"
                          label="Minutes"
                          value={values.votingPeriod.minutes}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setVotingPeriod(prev => ({ ...prev, minutes: value }));
                            setFieldValue('votingPeriod.minutes', value);
                          }}
                          min={0}
                        />
                        <NumberInput
                          name="votingPeriod.seconds"
                          placeholder="Seconds"
                          label="Seconds"
                          value={values.votingPeriod.seconds}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setVotingPeriod(prev => ({ ...prev, seconds: value }));
                            setFieldValue('votingPeriod.seconds', value);
                          }}
                          min={0}
                        />
                      </div>
                      {/* Display validation error below the voting period inputs */}
                      {errors.votingPeriod && typeof errors.votingPeriod === 'string' && (
                        <div className="text-red-500 text-sm mt-1">{errors.votingPeriod}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 gap-6 flex justify-center w-full">
                    <button
                      type="button"
                      className="btn w-[calc(50%-8px)] btn-md focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A]"
                      onClick={() =>
                        (document.getElementById('update-group-modal') as HTMLDialogElement).close()
                      }
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-md w-[calc(50%-8px)] btn-gradient  text-white"
                      onClick={() => handleConfirm(values)}
                      disabled={isSigning || !isValid || !hasAnyChanges(values)}
                    >
                      {isSigning ? 'Signing...' : 'Update'}
                    </button>
                  </div>
                </Form>
              </div>
              {/* Action buttons */}
            </div>
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              style={{ zIndex: -1 }}
              onClick={() => setShowUpdateModal(false)}
              aria-hidden="true"
            />
          </>
        )}
      </Formik>
    </dialog>
  );

  // Only render if we're in the browser and modal is shown
  if (typeof document !== 'undefined' && showUpdateModal) {
    return createPortal(modalContent, document.body);
  }

  return null;
}
