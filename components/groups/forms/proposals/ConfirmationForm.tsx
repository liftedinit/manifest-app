import React from 'react';
import { useFeeEstimation } from '@/hooks/useFeeEstimation';
import { uploadJsonToIPFS } from '@/hooks/useIpfs';
import { useTx } from '@/hooks/useTx';
import { strangelove_ventures, cosmos, liftedinit } from '@chalabi/manifestjs';
import { Any } from '@chalabi/manifestjs/dist/codegen/google/protobuf/any';

import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { ProposalFormData } from '@/helpers/formReducer';
import { chainName } from '@/config';
import { MsgMultiSend, MsgSend } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';
import {
  MsgRemovePending,
  MsgRemoveValidator,
  MsgSetPower,
  MsgUpdateStakingParams,
} from '@chalabi/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import {
  MsgCreateGroupWithPolicy,
  MsgExec,
  MsgLeaveGroup,
  MsgSubmitProposal,
  MsgUpdateGroupAdmin,
  MsgUpdateGroupMembers,
  MsgUpdateGroupMetadata,
  MsgUpdateGroupPolicyAdmin,
  MsgVote,
  MsgWithdrawProposal,
} from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/tx';
import {
  MsgPayout,
  MsgBurnHeldBalance,
} from '@chalabi/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import {
  MsgSoftwareUpgrade,
  MsgCancelUpgrade,
} from '@chalabi/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';

export default function ConfirmationForm({
  policyAddress,
  nextStep,
  prevStep,
  formData,
  address,
}: Readonly<{
  policyAddress: string;
  nextStep: () => void;
  prevStep: () => void;
  formData: ProposalFormData;
  address: string;
}>) {
  type MessageTypeMap = {
    send: MsgSend;
    removeValidator: MsgRemoveValidator;
    removePending: MsgRemovePending;
    updateStakingParams: MsgUpdateStakingParams;
    setPower: MsgSetPower;

    payoutStakeholders: MsgPayout;
    updateGroupAdmin: MsgUpdateGroupAdmin;
    updateGroupMembers: MsgUpdateGroupMembers;
    updateGroupMetadata: MsgUpdateGroupMetadata;
    updateGroupPolicyAdmin: MsgUpdateGroupPolicyAdmin;
    createGroupWithPolicy: MsgCreateGroupWithPolicy;
    submitProposal: MsgSubmitProposal;
    vote: MsgVote;
    withdrawProposal: MsgWithdrawProposal;
    exec: MsgExec;
    leaveGroup: MsgLeaveGroup;
    multiSend: MsgMultiSend;
    softwareUpgrade: MsgSoftwareUpgrade;
    cancelUpgrade: MsgCancelUpgrade;
    customMessage: any;
  };

  const messageTypeToComposer: {
    [K in keyof MessageTypeMap]: (value: MessageTypeMap[K]) => any;
  } = {
    send: cosmos.bank.v1beta1.MessageComposer.encoded.send,
    removeValidator: strangelove_ventures.poa.v1.MessageComposer.encoded.removeValidator,
    removePending: strangelove_ventures.poa.v1.MessageComposer.encoded.removePending,
    updateStakingParams: strangelove_ventures.poa.v1.MessageComposer.encoded.updateStakingParams,
    setPower: strangelove_ventures.poa.v1.MessageComposer.encoded.setPower,

    payoutStakeholders: liftedinit.manifest.v1.MessageComposer.encoded.payout,
    updateGroupAdmin: cosmos.group.v1.MessageComposer.encoded.updateGroupAdmin,
    updateGroupMembers: cosmos.group.v1.MessageComposer.encoded.updateGroupMembers,
    updateGroupMetadata: cosmos.group.v1.MessageComposer.encoded.updateGroupMetadata,
    updateGroupPolicyAdmin: cosmos.group.v1.MessageComposer.encoded.updateGroupPolicyAdmin,
    createGroupWithPolicy: cosmos.group.v1.MessageComposer.encoded.createGroupWithPolicy,
    submitProposal: cosmos.group.v1.MessageComposer.encoded.submitProposal,
    vote: cosmos.group.v1.MessageComposer.encoded.vote,
    withdrawProposal: cosmos.group.v1.MessageComposer.encoded.withdrawProposal,
    customMessage: cosmos.bank.v1beta1.MessageComposer.encoded.send,
    exec: cosmos.group.v1.MessageComposer.encoded.exec,
    leaveGroup: cosmos.group.v1.MessageComposer.encoded.leaveGroup,
    multiSend: cosmos.bank.v1beta1.MessageComposer.encoded.multiSend,
    softwareUpgrade: cosmos.upgrade.v1beta1.MessageComposer.encoded.softwareUpgrade,
    cancelUpgrade: cosmos.upgrade.v1beta1.MessageComposer.encoded.cancelUpgrade,
  };
  const snakeToCamel = (str: string): string =>
    str.replace(/([-_][a-z])/gi, $1 => $1.toUpperCase().replace('-', '').replace('_', ''));

  const convertKeysToCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(v => convertKeysToCamelCase(v));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce(
        (acc, key) => {
          acc[snakeToCamel(key)] = convertKeysToCamelCase(obj[key]);
          return acc;
        },
        {} as Record<string, any>
      );
    }
    return obj;
  };

  const getMessageObject = (message: { type: keyof MessageTypeMap } & Record<string, any>): Any => {
    const composer = messageTypeToComposer[message.type];
    if (composer) {
      let messageData = JSON.parse(JSON.stringify(message));

      delete messageData.type;

      messageData = convertKeysToCamelCase(messageData);
      if (messageData.amount && !Array.isArray(messageData.amount)) {
        messageData.amount = [messageData.amount];
      }
      console.log({ messageData });
      const composedMessage = composer(messageData as MessageTypeMap[typeof message.type]);
      console.log({ composedMessage });
      if (!composedMessage || !composedMessage.value) {
        console.error('Composed message or its value is undefined:', composedMessage);
        throw new Error(`Failed to compose message for type: ${message.type}`);
      }

      // Verify composedMessage structure
      if (!composedMessage.typeUrl || typeof composedMessage.value !== 'object') {
        console.error('Invalid composedMessage structure:', composedMessage);
        throw new Error(`Invalid composedMessage structure for type: ${message.type}`);
      }

      try {
        const anyMessage = Any.fromPartial({
          typeUrl: composedMessage.typeUrl,
          value: composedMessage.value,
        });

        return anyMessage;
      } catch (error) {
        console.error('Error encoding message:', error);
        console.error('Message type:', message.type);
        console.error('Composed message:', composedMessage);
        throw error;
      }
    }
    throw new Error(`Unknown message type: ${message.type}`);
  };

  const proposalMetadata = {
    title: formData.metadata.title,
    authors: formData.metadata.authors,
    summary: formData.metadata.summary,
    details: formData.metadata.details,
    proposalForumURL: '',
    voteOptionContext: '',
  };

  const jsonString = JSON.stringify(proposalMetadata);

  const { tx, isSigning, setIsSigning } = useTx(chainName);

  const { estimateFee } = useFeeEstimation('manifest');

  const uploadMetaDataToIPFS = async () => {
    const CID = await uploadJsonToIPFS(jsonString);
    return CID;
  };

  const handleConfirm = async () => {
    setIsSigning(true);
    const CID = await uploadMetaDataToIPFS();

    const messages: Any[] = formData.messages.map(message => getMessageObject(message));
    console.log(formData.messages);
    console.log({ messages });
    const msg = cosmos.group.v1.MessageComposer.fromPartial.submitProposal({
      groupPolicyAddress: policyAddress,
      messages: messages,
      metadata: CID,
      proposers: [formData.proposers],
      title: formData.title,
      summary: formData.metadata.summary,
      exec: 0,
    });
    console.log({ msg });
    const fee = await estimateFee(address ?? '', [msg]);
    await tx([msg], {
      fee,
      onSuccess: () => {
        nextStep();
      },
    });
  };

  return (
    <section>
      <div className="w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
        <div className="flex justify-center p-4 rounded-[8px] mb-6 w-full dark:bg-[#FAFAFA1F] bg-[#A087FF1F] items-center">
          <h1 className="text-xl text-primary font-bold">{formData.title}</h1>
        </div>

        <div className="space-y-6">
          {/* Proposal Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-[#FFFFFF99]">
              Proposal Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Proposer</label>
                <TruncatedAddressWithCopy address={formData.proposers} slice={14} />
              </div>
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Summary</label>
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap dark:text-[#FFFFFF99]"
                  title={formData.metadata.summary}
                >
                  {formData.metadata.summary.length > 100
                    ? `${formData.metadata.summary.slice(0, 100)}...`
                    : formData.metadata.summary}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-32 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 dark:text-[#FFFFFF99]">Messages</h2>
            <div className="grid grid-cols-4 gap-4">
              {formData.messages.map((message, index) => (
                <div key={index} className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg">
                  <div className="text-sm dark:text-[#FFFFFF66]">Type</div>
                  <div className="dark:text-[#FFFFFF99] truncate" title={message.type}>
                    {message.type}
                  </div>
                  {/* Add more message details here if needed */}
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="max-h-50 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 dark:text-[#FFFFFF99]">Metadata</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg">
                <div className="text-sm dark:text-[#FFFFFF66]">Authors</div>
                <div className="dark:text-[#FFFFFF99]">{formData.metadata.authors}</div>
              </div>
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg">
                <div className="text-sm dark:text-[#FFFFFF66]">Title</div>
                <div className="dark:text-[#FFFFFF99]">{formData.metadata.title}</div>
              </div>
            </div>
            <div className="mt-4 dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg">
              <div className="text-sm dark:text-[#FFFFFF66]">Details</div>
              <div className="dark:text-[#FFFFFF99] max-h-20 overflow-y-auto">
                {formData.metadata.details}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-3 mt-6 mx-auto w-full">
        <button onClick={prevStep} className="btn btn-neutral w-1/2">
          Back: Metadata
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSigning || !address}
          className="w-1/2 btn btn-gradient text-white"
        >
          {isSigning ? (
            <span className="loading loading-dots loading-sm"></span>
          ) : (
            'Sign Transaction'
          )}
        </button>
      </div>
    </section>
  );
}
