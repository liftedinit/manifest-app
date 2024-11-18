import React from 'react';
import { useFeeEstimation } from '@/hooks/useFeeEstimation';
import { uploadJsonToIPFS } from '@/hooks/useIpfs';
import { useTx } from '@/hooks/useTx';
import { strangelove_ventures, cosmos, liftedinit, osmosis } from '@liftedinit/manifestjs';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';

import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { ProposalFormData } from '@/helpers/formReducer';
import { chainName } from '@/config';
import { MsgMultiSend, MsgSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';
import {
  MsgRemovePending,
  MsgRemoveValidator,
  MsgSetPower,
} from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import {
  MsgUpdateGroupAdmin,
  MsgUpdateGroupMembers,
  MsgUpdateGroupMetadata,
  MsgUpdateGroupPolicyAdmin,
  MsgUpdateGroupPolicyMetadata,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import {
  MsgPayout,
  MsgBurnHeldBalance,
} from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import {
  MsgSoftwareUpgrade,
  MsgCancelUpgrade,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';
import {
  MsgBurn,
  MsgChangeAdmin,
  MsgCreateDenom,
  MsgMint,
  MsgSetDenomMetadata,
} from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';

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
    // Bank
    send: MsgSend;
    multiSend: MsgMultiSend;

    // Manifest
    payoutStakeholders: MsgPayout;
    burnHeldBalance: MsgBurnHeldBalance;

    // POA
    removeValidator: MsgRemoveValidator;
    removePending: MsgRemovePending;
    setPower: MsgSetPower;

    // Group
    updateGroupAdmin: MsgUpdateGroupAdmin;
    updateGroupMembers: MsgUpdateGroupMembers;
    updateGroupMetadata: MsgUpdateGroupMetadata;
    updateGroupPolicyAdmin: MsgUpdateGroupPolicyAdmin;
    updateGroupPolicyMetadata: MsgUpdateGroupPolicyMetadata;

    // Token Factory
    createDenom: MsgCreateDenom;
    mintToken: MsgMint;
    burnToken: MsgBurn;
    setDenomMetadata: MsgSetDenomMetadata;
    changeAdmin: MsgChangeAdmin;

    // Upgrade
    softwareUpgrade: MsgSoftwareUpgrade;
    cancelUpgrade: MsgCancelUpgrade;

    customMessage: any;
  };

  const messageTypeToComposer: {
    [K in keyof MessageTypeMap]: (value: MessageTypeMap[K]) => any;
  } = {
    // Bank
    send: cosmos.bank.v1beta1.MessageComposer.encoded.send,
    multiSend: cosmos.bank.v1beta1.MessageComposer.encoded.multiSend,

    // Manifest
    payoutStakeholders: liftedinit.manifest.v1.MessageComposer.encoded.payout,
    burnHeldBalance: liftedinit.manifest.v1.MessageComposer.encoded.burnHeldBalance,

    // POA
    removeValidator: strangelove_ventures.poa.v1.MessageComposer.encoded.removeValidator,
    removePending: strangelove_ventures.poa.v1.MessageComposer.encoded.removePending,
    setPower: strangelove_ventures.poa.v1.MessageComposer.encoded.setPower,

    // Group
    updateGroupAdmin: cosmos.group.v1.MessageComposer.encoded.updateGroupAdmin,
    updateGroupMembers: cosmos.group.v1.MessageComposer.encoded.updateGroupMembers,
    updateGroupMetadata: cosmos.group.v1.MessageComposer.encoded.updateGroupMetadata,
    updateGroupPolicyAdmin: cosmos.group.v1.MessageComposer.encoded.updateGroupPolicyAdmin,
    updateGroupPolicyMetadata: cosmos.group.v1.MessageComposer.encoded.updateGroupPolicyMetadata,

    // Token Factory
    createDenom: osmosis.tokenfactory.v1beta1.MessageComposer.encoded.createDenom,
    mintToken: osmosis.tokenfactory.v1beta1.MessageComposer.encoded.mint,
    burnToken: osmosis.tokenfactory.v1beta1.MessageComposer.encoded.burn,
    setDenomMetadata: osmosis.tokenfactory.v1beta1.MessageComposer.encoded.setDenomMetadata,
    changeAdmin: osmosis.tokenfactory.v1beta1.MessageComposer.encoded.changeAdmin,

    // Upgrade
    softwareUpgrade: cosmos.upgrade.v1beta1.MessageComposer.encoded.softwareUpgrade,
    cancelUpgrade: cosmos.upgrade.v1beta1.MessageComposer.encoded.cancelUpgrade,

    customMessage: cosmos.bank.v1beta1.MessageComposer.encoded.send,
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

      // We need to handle complex message data structures here
      if (message.type === 'payoutStakeholders') {
        messageData.payout_pairs = [
          {
            address: messageData.address,
            coin: messageData.amount,
          },
        ];
        delete messageData.address;
        delete messageData.amount;
      } else if (message.type === 'burnHeldBalance') {
        messageData.burn_coins = [messageData.amount];
        delete messageData.amount;
      }

      messageData = convertKeysToCamelCase(messageData);
      if (messageData.amount && !Array.isArray(messageData.amount)) {
        messageData.amount = [messageData.amount];
      }

      const composedMessage = composer(messageData as MessageTypeMap[typeof message.type]);
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
    const msg = cosmos.group.v1.MessageComposer.fromPartial.submitProposal({
      groupPolicyAddress: policyAddress,
      messages: messages,
      metadata: CID,
      proposers: [formData.proposers],
      title: formData.title,
      summary: formData.metadata.summary,
      exec: 0, // Setting to 0 for now
    });
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
