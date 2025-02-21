import React, { useState, useEffect } from 'react';
import { Formik, Form, useFormikContext } from 'formik';
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

import { isValidManifestAddress, secondsToHumanReadable } from '@/utils/string';
import { TrashIcon, PlusIcon } from '@/components/icons';
import { MdContacts } from 'react-icons/md';
import { TailwindModal } from '@/components/react/modal';
import { Dialog } from '@headlessui/react';
import { SignModal } from '@/components/react';

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
  const { tx, isSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);

  let maybeMetadata = null;
  try {
    maybeMetadata = group.metadata ? JSON.parse(group.metadata) : null;
  } catch (e) {
    // console.warn('Failed to parse group metadata:', e);
  }

  const maybeTitle = maybeMetadata?.title ?? '';
  const maybeAuthors = maybeMetadata?.authors ?? '';

  const maybeDetails = maybeMetadata?.details ?? '';
  const maybePolicies = group?.policies?.[0];
  const maybeDecisionPolicy = maybePolicies?.decision_policy;
  const maybeThreshold = (maybeDecisionPolicy as ThresholdDecisionPolicySDKType)?.threshold ?? '';
  const maybeVotingPeriod = (maybeDecisionPolicy as ThresholdDecisionPolicySDKType)?.windows
    ?.voting_period;
  const maybeMembers = group?.members;

  const { updateGroupMetadata, updateGroupPolicyDecisionPolicy, updateGroupPolicyMetadata } =
    cosmos.group.v1.MessageComposer.withTypeUrl;

  const [name, setName] = useState(maybeTitle);
  const [authors, setAuthors] = useState(
    maybeAuthors ? (Array.isArray(maybeAuthors) ? maybeAuthors : [maybeAuthors]) : []
  );
  const [description, setDescription] = useState(maybeDetails);
  const [threshold, setThreshold] = useState(maybeThreshold !== '' ? maybeThreshold : '1');
  const [votingPeriod, setVotingPeriod] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [activeAuthorIndex, setActiveAuthorIndex] = useState<number | null>(null);

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
      hasStateChanged(authors.join(','), maybeAuthors) ||
      hasStateChanged(description, maybeDetails)
    ) {
      const newMetadata = JSON.stringify({
        title: name,
        authors: authors.join(','),
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
    try {
      const encodedMessages = buildMessages();
      if (encodedMessages.length === 0) {
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
        console.error('Error estimating fee:', feeError);
        throw new Error('Failed to estimate transaction fee. Please try again.');
      }
      await tx(
        [msg],
        {
          fee,
          onSuccess: () => {
            onUpdate();
          },
        },
        'update-group-modal'
      );
    } catch (error) {
      console.error('Error in handleConfirm:', error);
    }
  };

  const validationSchema = Yup.object()
    .shape({
      name: Yup.string()
        .max(50, 'Name must be at most 50 characters')
        .noProfanity('Profanity is not allowed'),
      authors: Yup.array()
        .of(
          Yup.string().test(
            'author-validation',
            'Invalid author name or address',
            function (value) {
              if (value?.startsWith('manifest')) {
                return isValidManifestAddress(value);
              }
              return Yup.string()
                .max(50, 'Author name must not exceed 50 characters')
                .noProfanity('Profanity is not allowed')
                .isValidSync(value);
            }
          )
        )
        .min(1, 'At least one author is required'),
      description: Yup.string()
        .min(20, 'Description must be at least 20 characters')
        .max(1000, 'Description must not exceed 1000 characters')
        .noProfanity('Profanity is not allowed'),
      threshold: Yup.number().min(1, 'Threshold must be at least 1').optional(),
      votingPeriod: Yup.object()
        .shape({
          days: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
          hours: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
          minutes: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
          seconds: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
        })
        .test(
          'min-total-time',
          () => `Voting period must be at least ${secondsToHumanReadable(env.minimumVotingPeriod)}`,
          function (value) {
            // Only validate if voting period is being updated
            if (!value || Object.values(value).every(v => v === 0)) return true;

            const { days, hours, minutes, seconds } = value;
            const totalSeconds =
              (Number(days) || 0) * 86400 +
              (Number(hours) || 0) * 3600 +
              (Number(minutes) || 0) * 60 +
              (Number(seconds) || 0);
            return totalSeconds >= env.minimumVotingPeriod;
          }
        ),
    })
    .test(
      'metadata-total-length',
      'Total metadata length must not exceed 100000 characters',
      function (values) {
        const metadata = JSON.stringify({
          title: values.name ?? '',
          authors: values.authors ?? '',
          details: values.description ?? '',
        });
        return metadata.length <= 10000;
      }
    );

  const hasAnyChanges = (values: any) => {
    // Check metadata changes
    const hasMetadataChanges =
      values.name !== maybeTitle ||
      values.authors !== maybeAuthors ||
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

  return (
    <Dialog
      open={showUpdateModal}
      onClose={() => setShowUpdateModal(false)}
      className={`modal modal-open fixed flex p-0 m-0 z-1`}
      style={{
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div
        className="modal-box max-w-2xl bg-secondary rounded-[24px]"
        onClick={e => e.stopPropagation()}
      >
        <form method="dialog">
          <button
            onClick={() => setShowUpdateModal(false)}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
        </form>
        <Formik
          initialValues={{
            name,
            authors,
            description,
            threshold,
            votingPeriod,
          }}
          validationSchema={validationSchema}
          onSubmit={handleConfirm}
          enableReinitialize
        >
          {({ values, isValid, touched }) => (
            <Form className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4">
                <GroupDetailsFormFields
                  dispatch={({ field, value }) => {
                    switch (field) {
                      case 'title':
                        setName(value);
                        break;
                      case 'authors':
                        setAuthors(value);
                        break;
                      case 'description':
                        setDescription(value);
                        break;
                    }
                  }}
                  setIsContactsOpen={setIsContactsOpen}
                  setActiveAuthorIndex={setActiveAuthorIndex}
                />

                <GroupPolicyFormFields
                  dispatch={({
                    field,
                    value,
                  }: {
                    field: 'votingPeriod' | 'votingThreshold';
                    value: any;
                  }) => {
                    switch (field) {
                      case 'votingPeriod':
                        setVotingPeriod(value);
                        break;
                      case 'votingThreshold':
                        setThreshold(value.toString());
                        break;
                    }
                  }}
                />
              </div>

              <TailwindModal
                isOpen={isContactsOpen}
                setOpen={setIsContactsOpen}
                showContacts={true}
                currentAddress={address}
                onSelect={(selectedAddress: string) => {
                  if (activeAuthorIndex !== null) {
                    const newAuthors = [...authors];
                    newAuthors[activeAuthorIndex] = selectedAddress;
                    setAuthors(newAuthors);
                  }
                }}
              />

              <div className="mt-4 gap-6 flex justify-center w-full">
                <button
                  type="button"
                  className="btn w-[calc(50%-8px)] btn-md focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A]"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  aria-label={'upgrade-group-btn'}
                  className="btn btn-md w-[calc(50%-8px)] btn-gradient text-white"
                  disabled={isSigning || !isValid || !hasAnyChanges(values) || !touched}
                >
                  {isSigning ? <span className="loading loading-dots loading-md"></span> : 'Update'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      <SignModal id="update-group-modal" />
    </Dialog>
  );
}

function GroupPolicyFormFields({
  dispatch,
}: {
  dispatch: ({ field, value }: { field: 'votingPeriod' | 'votingThreshold'; value: any }) => void;
}) {
  const { values, setFieldValue } = useFormikContext<{
    votingPeriod: { days: number; hours: number; minutes: number; seconds: number };
    votingThreshold: number | string;
  }>();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm mb-1 font-medium dark:text-[#FFFFFF99]">
          Voting Period
        </label>
        <div className="grid grid-cols-4 gap-2">
          {['days', 'hours', 'minutes', 'seconds'].map(unit => (
            <NumberInput
              key={unit}
              name={`votingPeriod.${unit}`}
              placeholder={unit.charAt(0).toUpperCase() + unit.slice(1)}
              label={unit.charAt(0).toUpperCase() + unit.slice(1)}
              value={values.votingPeriod[unit as keyof typeof values.votingPeriod]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = Math.max(0, parseInt(e.target.value) || 0);
                setFieldValue(`votingPeriod.${unit}`, val);
                dispatch({
                  field: 'votingPeriod',
                  value: { ...values.votingPeriod, [unit]: val },
                });
              }}
              min={0}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium dark:text-[#FFFFFF99]">
          Qualified Majority
        </label>
        <NumberInput
          aria-label={'Qualified Majority'}
          name="votingThreshold"
          placeholder="e.g., 1"
          value={values.votingThreshold}
          onChange={e => {
            const val = Math.max(1, parseInt(e.target.value) || 1);
            setFieldValue('votingThreshold', val);
            dispatch({ field: 'votingThreshold', value: val });
          }}
          min={1}
        />
      </div>
    </div>
  );
}

function GroupDetailsFormFields({
  dispatch,
  setIsContactsOpen,
  setActiveAuthorIndex,
}: {
  dispatch: ({ field, value }: { field: 'title' | 'authors' | 'description'; value: any }) => void;
  setIsContactsOpen: (open: boolean) => void;
  setActiveAuthorIndex: (index: number | null) => void;
}) {
  const { values, setFieldValue } = useFormikContext<{
    name: string;
    authors: string[];
    description: string;
  }>();

  return (
    <div className="flex flex-col gap-4">
      <TextInput
        label="Group Title"
        name="name"
        placeholder="Title"
        value={values.name}
        onChange={e => {
          setFieldValue('name', e.target.value);
          dispatch({ field: 'title', value: e.target.value });
        }}
      />

      <TextArea
        label="Description"
        name="description"
        placeholder="Description"
        value={values.description}
        onChange={e => {
          setFieldValue('description', e.target.value);
          dispatch({ field: 'description', value: e.target.value });
        }}
      />

      <div className="form-control w-full">
        {values.authors.map((author, index) => (
          <div key={index} className="flex mb-2">
            <TextInput
              label={index === 0 ? 'Author name or address' : ''}
              name={`authors.${index}`}
              value={author}
              onChange={e => {
                const newAuthors = [...values.authors];
                newAuthors[index] = e.target.value;
                setFieldValue('authors', newAuthors);
                dispatch({ field: 'authors', value: newAuthors });
              }}
              rightElement={
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAuthorIndex(index);
                      setIsContactsOpen(true);
                    }}
                    className="btn btn-primary btn-sm text-white"
                  >
                    <MdContacts className="w-5 h-5" />
                  </button>
                  {values.authors.length > 1 && index !== 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newAuthors = values.authors.filter((_, i) => i !== index);
                        setFieldValue('authors', newAuthors);
                        dispatch({ field: 'authors', value: newAuthors });
                      }}
                      className="btn btn-error btn-sm text-white"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              }
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const newAuthors = [...values.authors, ''];
            setFieldValue('authors', newAuthors);
            dispatch({ field: 'authors', value: newAuthors });
          }}
          className="btn btn-gradient text-white w-full mt-2"
        >
          <PlusIcon className="mr-2" /> Add Author
        </button>
      </div>
    </div>
  );
}
