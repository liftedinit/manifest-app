import { Dialog } from '@headlessui/react';
import { cosmos } from '@liftedinit/manifestjs';
import {
  ThresholdDecisionPolicy,
  ThresholdDecisionPolicySDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { FieldArray, Form, Formik, useFormikContext } from 'formik';
import React, { useState } from 'react';
import { MdContacts } from 'react-icons/md';

import { PlusIcon, TrashIcon } from '@/components/icons';
import { SignModal, TailwindModal } from '@/components/react';
import { NumberInput, TextArea, TextInput } from '@/components/react/inputs';
import env from '@/config/env';
import { ExtendedGroupType, useFeeEstimation, useTx } from '@/hooks';
import { duration, group as groupSchema } from '@/schemas';
import { secondsToHumanReadable } from '@/utils/string';
import Yup from '@/utils/yupExtensions';

const updateFormSchema = groupSchema.metadataSchema
  .shape({
    threshold: Yup.number().min(1, 'Threshold must be at least 1').required().default(1),
    votingPeriod: duration.schema
      .required()
      .test(
        'min-total-time',
        () => `Voting period must be at least ${secondsToHumanReadable(env.minimumVotingPeriod)}`,
        value => duration.toSeconds(value) >= env.minimumVotingPeriod
      )
      .default(() => duration.fromSeconds(env.minimumVotingPeriod)),
  })
  .test(
    'metadata-total-length',
    'Total metadata length must not exceed 100000 characters',
    function (values) {
      const metadata = JSON.stringify({
        title: values.title ?? '',
        authors: values.authors ?? '',
        details: values.details ?? '',
      });
      return metadata.length <= 100_000;
    }
  );

export type UpdateFormValues = Yup.InferType<typeof updateFormSchema>;

/**
 * Default values for the update group form, when the group metadata could not be validated.
 */
const defaultValues: UpdateFormValues = {
  title: 'Unknown Group Title',
  authors: [''],
  details: 'Unknown Group Details',
  threshold: 1,
  votingPeriod: duration.fromSeconds(env.minimumVotingPeriod),
};

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

  let maybeMetadata: groupSchema.GroupMetadata;
  try {
    maybeMetadata = groupSchema.metadataFromJson(group.metadata);
  } catch (e) {
    console.error('Failed to parse group metadata:', e);
    maybeMetadata = defaultValues;
  }

  const title = maybeMetadata.title;
  const initialAuthors = maybeMetadata.authors;
  const details = maybeMetadata.details;

  const maybePolicies = group?.policies?.[0];
  const maybeDecisionPolicy = maybePolicies?.decision_policy;
  const maybeThreshold = (maybeDecisionPolicy as ThresholdDecisionPolicySDKType)?.threshold ?? '';
  const maybeVotingPeriod = (maybeDecisionPolicy as ThresholdDecisionPolicySDKType)?.windows
    ?.voting_period;
  const maybeMembers = group?.members;

  const { updateGroupMetadata, updateGroupPolicyDecisionPolicy, updateGroupPolicyMetadata } =
    cosmos.group.v1.MessageComposer.withTypeUrl;

  const threshold = Number(maybeThreshold || 1);

  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [activeAuthorIndex, setActiveAuthorIndex] = useState<number | null>(null);

  // Initialize voting period state from existing data if available
  const votingPeriod = duration.fromSdk(maybeVotingPeriod ?? { seconds: 0n, nanos: 0 });
  const buildMessages = (values: UpdateFormValues) => {
    const messages: Any[] = [];

    // Update Group Metadata
    const authorsDiff = values.authors
      .filter(a => !initialAuthors.includes(a))
      .concat(initialAuthors.filter(a => !values.authors.includes(a)));
    if (title !== values.title || authorsDiff.length > 0 || details !== values.details) {
      const newMetadata = JSON.stringify({
        title: values.title,
        authors: values.authors,
        details: values.details,
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
    if (values.threshold !== threshold || duration.compare(values.votingPeriod, votingPeriod)) {
      const thresholdMsg = {
        threshold: (values.threshold || 1).toString(),
        windows: {
          votingPeriod: duration.toSdk(values.votingPeriod),
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

  async function handleConfirm(values: UpdateFormValues) {
    try {
      const encodedMessages = buildMessages(values);
      if (encodedMessages.length === 0) {
        console.warn('No changes detected.');
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

      const fee = await estimateFee(address, [msg]);
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
  }

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

        <UpdateGroupForm
          initialValues={{
            title,
            authors: [...initialAuthors],
            details,
            threshold,
            votingPeriod: { ...votingPeriod },
          }}
          onSubmit={handleConfirm}
          setShowUpdateModal={setShowUpdateModal}
          address={address}
          isSigning={isSigning}
          isContactsOpen={isContactsOpen}
          activeAuthorIndex={activeAuthorIndex}
          setIsContactsOpen={setIsContactsOpen}
          setActiveAuthorIndex={setActiveAuthorIndex}
        />
      </div>

      <SignModal id="update-group-modal" />
    </Dialog>
  );
}

interface UpdateGroupFormProps {
  initialValues: UpdateFormValues;
  onSubmit: (values: UpdateFormValues) => Promise<void>;

  isContactsOpen: boolean;
  setIsContactsOpen: React.Dispatch<boolean>;

  activeAuthorIndex: number | null;
  setActiveAuthorIndex: React.Dispatch<number | null>;

  setShowUpdateModal: React.Dispatch<boolean>;

  address: string;

  isSigning: boolean;
}

/**
 * The update group form itself. Exported for tests.
 *
 * TODO: refactor this to have only the fields it really needs.
 */
export const UpdateGroupForm: React.FC<UpdateGroupFormProps> = ({
  initialValues,
  onSubmit,
  setIsContactsOpen,
  setActiveAuthorIndex,
  setShowUpdateModal,
  isSigning,
  isContactsOpen,
  address,
  activeAuthorIndex,
}) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={updateFormSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ isValid, dirty, setFieldValue, handleSubmit }) => (
        <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <GroupDetailsFormFields
              setIsContactsOpen={setIsContactsOpen}
              setActiveAuthorIndex={setActiveAuthorIndex}
            />

            <GroupPolicyFormFields />
          </div>

          <TailwindModal
            isOpen={isContactsOpen}
            setOpen={setIsContactsOpen}
            showContacts={true}
            currentAddress={address}
            onSelect={async (selectedAddress: string) => {
              if (activeAuthorIndex !== null) {
                await setFieldValue(`authors.${activeAuthorIndex}`, selectedAddress, true);
                setActiveAuthorIndex(null);
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
              disabled={isSigning || !isValid || !dirty}
              data-testid="update-btn"
            >
              {isSigning ? <span className="loading loading-dots loading-md"></span> : 'Update'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

function GroupPolicyFormFields() {
  const { values, handleChange, touched, errors } = useFormikContext<UpdateFormValues>();

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
              data-testid={`voting-period-${unit}`}
              placeholder={unit.charAt(0).toUpperCase() + unit.slice(1)}
              label={unit.charAt(0).toUpperCase() + unit.slice(1)}
              onChange={handleChange}
              min={0}
              max={unit === 'days' ? 365 : unit === 'hours' ? 23 : 59}
            />
          ))}
        </div>
        {touched.votingPeriod && typeof errors.votingPeriod == 'string' ? (
          <label className="label">
            <span className="label-text-alt text-error">{errors.votingPeriod}</span>
          </label>
        ) : null}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium dark:text-[#FFFFFF99]">
          Qualified Majority
        </label>
        <NumberInput
          aria-label={'Qualified Majority'}
          name="threshold"
          placeholder="e.g., 1"
          value={values.threshold}
          onChange={handleChange}
          min={1}
        />
      </div>
    </div>
  );
}

function GroupDetailsFormFields({
  setIsContactsOpen,
  setActiveAuthorIndex,
}: {
  setIsContactsOpen: React.Dispatch<boolean>;
  setActiveAuthorIndex: React.Dispatch<number | null>;
}) {
  const { values, handleChange } = useFormikContext<UpdateFormValues>();

  return (
    <div className="flex flex-col gap-4">
      <TextInput
        label="Group Title"
        name="title"
        placeholder="Title"
        value={values.title}
        onChange={handleChange}
      />

      <TextArea
        label="Description"
        name="details"
        placeholder="Description"
        value={values.details}
        onChange={handleChange}
      />

      <FieldArray
        name="authors"
        render={arrayHelpers => {
          return (
            <div className="form-control w-full">
              {values.authors.map((_, index) => (
                <div key={index} className="flex mb-2">
                  <TextInput
                    data-testid={`author-${index}`}
                    label={index === 0 ? 'Author name or address' : ''}
                    name={`authors.${index}`}
                    onChange={handleChange}
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
                            onClick={() => arrayHelpers.remove(index)}
                            className="btn btn-error btn-sm text-white"
                            data-testid={`remove-author-btn-${index}`}
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
                onClick={() => arrayHelpers.push('')}
                className="btn btn-gradient text-white w-full mt-2"
                data-testid="add-author-btn"
              >
                <PlusIcon className="mr-2" /> Add Author
              </button>
            </div>
          );
        }}
      />
    </div>
  );
}
