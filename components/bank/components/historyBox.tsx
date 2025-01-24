import React, { useState } from 'react';
import TxInfoModal from '../modals/txInfo';
import { formatVote, shiftDigits, TransactionAmount, TxMessage } from '@/utils';
import {
  AdminsIcon,
  ArrowUpIcon,
  BurnIcon,
  FactoryIcon,
  formatAmount,
  formatDenom,
  GroupsIcon,
  MintIcon,
  QuestionIcon,
  TransferIcon,
  ReceiveIcon,
  SendIcon,
} from '@/components';
import { useTokenFactoryDenomsMetadata } from '@/hooks';
import { MsgSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';
import { MsgTransfer } from '@liftedinit/manifestjs/dist/codegen/ibc/applications/transfer/v1/tx';
import {
  MsgBurn,
  MsgChangeAdmin,
  MsgCreateDenom,
  MsgMint,
  MsgSetDenomMetadata,
} from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import {
  MsgBurnHeldBalance,
  MsgPayout,
} from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import {
  MsgCreateGroupWithPolicy,
  MsgExec,
  MsgSubmitProposal,
  MsgUpdateGroupMembers,
  MsgUpdateGroupMetadata,
  MsgUpdateGroupPolicyDecisionPolicy,
  MsgUpdateGroupPolicyMetadata,
  MsgVote,
  MsgLeaveGroup,
  MsgWithdrawProposal,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import {
  MsgCancelUpgrade,
  MsgSoftwareUpgrade,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';
import {
  MsgRemovePending,
  MsgRemoveValidator,
  MsgSetPower,
  MsgCreateValidator,
} from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';

export interface TransactionGroup {
  tx_hash: string;
  block_number: number;
  formatted_date: string;
  fee?: TransactionAmount;
  memo?: string;
}

function createSenderReceiverHandler({
  iconSender,
  iconReceiver,
  colorSender,
  colorReceiver,
  signSender,
  signReceiver,
  successSender,
  failSender,
  successReceiver,
  failReceiver,
}: {
  iconSender: any;
  iconReceiver?: any;
  colorSender: string;
  colorReceiver?: string;
  signSender?: string | ((tx: TxMessage, metadata?: MetadataSDKType[]) => string);
  signReceiver?: string | ((tx: TxMessage, metadata?: MetadataSDKType[]) => string);
  successSender: string | ((tx: TxMessage, address: string) => string);
  failSender: string | ((tx: TxMessage, address: string) => string);
  successReceiver: string | ((tx: TxMessage, address: string) => string);
  failReceiver?: string | ((tx: TxMessage, address: string) => string);
}) {
  return (tx: TxMessage, address: string, metadata?: MetadataSDKType[]) => {
    const isSender = tx.sender === address;
    const hasError = !!tx.error;

    iconSender = iconSender ?? QuestionIcon;
    iconReceiver = iconReceiver ?? iconSender ?? QuestionIcon;
    colorSender = colorSender ?? 'text-gray-500';
    colorReceiver = colorReceiver ?? colorSender ?? 'text-gray-500';

    const resolveMessage = (msg: string | ((tx: TxMessage, address: string) => string)) =>
      typeof msg === 'function' ? msg(tx, address) : msg;

    const resolveSign = (
      sign: string | ((tx: TxMessage, metadata?: MetadataSDKType[]) => string)
    ) => (typeof sign === 'function' ? sign(tx, metadata) : sign);

    const successSenderMsg = resolveMessage(successSender);
    const failSenderMsg = resolveMessage(failSender);
    const successReceiverMsg = resolveMessage(successReceiver);
    const failReceiverMsg = resolveMessage(failReceiver ?? 'Anomaly detected');

    const signSenderMsg = resolveSign(signSender ?? '');
    const signReceiverMsg = resolveSign(signReceiver ?? '');

    return {
      icon: isSender ? iconSender : iconReceiver,
      color: isSender ? colorSender : colorReceiver,
      sign: isSender ? signSenderMsg : signReceiverMsg,
      message: hasError
        ? isSender
          ? failSenderMsg
          : failReceiverMsg
        : isSender
          ? successSenderMsg
          : successReceiverMsg,
    };
  };
}

const defaultHandler = {
  icon: QuestionIcon,
  color: 'text-gray-500',
  sign: '',
  message: 'Unknown transaction type',
};

const transactionRenderData = {
  [MsgSend.typeUrl]: createSenderReceiverHandler({
    iconSender: SendIcon,
    iconReceiver: ReceiveIcon,
    colorSender: 'text-red-500',
    colorReceiver: 'text-green-500',
    signSender: (tx, metadata) =>
      `-${formatLargeNumber(formatAmount(tx.metadata.amount[0].amount, tx.metadata.amount[0].denom, metadata))} ${formatDenom(tx.metadata.amount[0].denom)}`,
    signReceiver: (tx, metadata) =>
      `+${formatLargeNumber(formatAmount(tx.metadata.amount[0].amount, tx.metadata.amount[0].denom, metadata))} ${formatDenom(tx.metadata.amount[0].denom)}`,
    successSender: tx =>
      `You sent ${formatDenom(tx.metadata.amount[0].denom)} to ${tx.metadata.toAddress}`,
    failSender: tx =>
      `You failed to send ${formatDenom(tx.metadata.amount[0].denom)} to ${tx.metadata.toAddress}`,
    successReceiver: tx =>
      `You received ${formatDenom(tx.metadata.amount[0].denom)} from ${tx.sender}`,
  }),
  [MsgTransfer.typeUrl]: createSenderReceiverHandler({
    iconSender: TransferIcon,
    colorSender: 'text-red-500',
    colorReceiver: 'text-green-500',
    signSender: (tx, metadata) =>
      `-${formatLargeNumber(formatAmount(tx.metadata.token.amount, tx.metadata.token.denom, metadata))} ${formatDenom(tx.metadata.token.denom)}`,
    signReceiver: (tx, metadata) =>
      `+${formatLargeNumber(formatAmount(tx.metadata.token.amount, tx.metadata.token.denom, metadata))} ${formatDenom(tx.metadata.token.denom)}`,
    successSender: tx =>
      `You sent ${formatDenom(tx.metadata.token.denom)} to ${tx.metadata.receiver} via IBC`,
    failSender: tx =>
      `You failed to send ${formatDenom(tx.metadata.token.denom)} to ${tx.metadata.receiver} via IBC`,
    successReceiver: tx =>
      `You received ${formatDenom(tx.metadata.token.denom)} from ${tx.sender} via IBC`,
  }),
  [MsgMint.typeUrl]: createSenderReceiverHandler({
    iconSender: MintIcon,
    colorSender: 'text-gray-500',
    signSender: (tx, metadata) =>
      `${formatLargeNumber(formatAmount(tx.metadata.amount.amount, tx.metadata.amount.denom, metadata))} ${formatDenom(tx.metadata.amount.denom)}`,
    signReceiver: (tx, metadata) =>
      `+${formatLargeNumber(formatAmount(tx.metadata.amount.amount, tx.metadata.amount.denom, metadata))} ${formatDenom(tx.metadata.amount.denom)}`,
    successSender: tx =>
      `You minted ${formatDenom(tx.metadata.amount.denom) ?? ''} to ${tx.metadata.mintToAddress}`.trim(),
    failSender: tx =>
      `You failed to mint ${formatDenom(tx.metadata.amount.denom) ?? ''} to ${tx.metadata.mintToAddress}`.trim(),
    successReceiver: tx => `You were minted ${formatDenom(tx.metadata.amount.denom) ?? ''}`.trim(),
  }),
  // TODO
  [MsgPayout.typeUrl]: createSenderReceiverHandler({
    iconSender: MintIcon,
    colorSender: 'text-green-500',
    signSender: '+',
    successSender: 'You minted',
    failSender: 'You failed to mint',
    successReceiver: 'You were minted',
  }),
  [MsgBurn.typeUrl]: createSenderReceiverHandler({
    iconSender: BurnIcon,
    colorSender: 'text-gray-500',
    signSender: (tx, metadata) =>
      `${formatLargeNumber(formatAmount(tx.metadata.amount.amount, tx.metadata.amount.denom, metadata))} ${formatDenom(tx.metadata.amount.denom)}`,
    signReceiver: (tx, metadata) =>
      `-${formatLargeNumber(formatAmount(tx.metadata.amount.amount, tx.metadata.amount.denom, metadata))} ${formatDenom(tx.metadata.amount.denom)}`,
    successSender: tx =>
      `You burned ${formatDenom(tx.metadata.amount.denom)} from ${tx.metadata.burnFromAddress}`,
    failSender: tx =>
      `You failed to burn ${formatDenom(tx.metadata.amount.denom)} from ${tx.metadata.burnFromAddress}`,
    successReceiver: tx =>
      `You were burned ${formatDenom(tx.metadata.amount.denom)} by ${tx.sender}`,
  }),
  // TODO
  [MsgBurnHeldBalance.typeUrl]: createSenderReceiverHandler({
    iconSender: BurnIcon,
    colorSender: 'text-gray-500',
    signSender: '-',
    successSender: tx => 'You burned held balance',
    failSender: 'You failed to burn',
    // Notice: successReceiver is "Anomaly detected" instead of "You were burned"
    successReceiver: 'Anomaly detected',
  }),
  [MsgChangeAdmin.typeUrl]: createSenderReceiverHandler({
    iconSender: TransferIcon,
    colorSender: 'text-secondary-content',
    successSender: tx =>
      `You changed the administrator of the ${formatDenom(tx.metadata.denom)} token to ${tx.metadata.newAdmin}`.trim(),
    failSender: tx =>
      `You failed to change the administrator of the ${formatDenom(tx.metadata.denom)} token to ${tx.metadata.newAdmin}`.trim(),
    successReceiver: tx =>
      `You were set administrator of the ${formatDenom(tx.metadata.denom)} token by ${tx.sender}`.trim(),
  }),
  [MsgCreateGroupWithPolicy.typeUrl]: createSenderReceiverHandler({
    iconSender: GroupsIcon,
    colorSender: 'text-secondary-content',
    successSender: 'You created a new group',
    failSender: 'You failed to create a new group',
    successReceiver: 'A new group mentioning you was created',
  }),
  [MsgExec.typeUrl]: createSenderReceiverHandler({
    iconSender: GroupsIcon,
    colorSender: 'text-secondary-content',
    successSender: tx => `You executed proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
    failSender: tx => `You failed to execute proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
    successReceiver: tx => `Proposal #${tx.proposal_ids} was executed by ${tx.sender}`.trim(), // TODO Link to proposal
  }),
  [MsgSubmitProposal.typeUrl]: createSenderReceiverHandler({
    iconSender: GroupsIcon,
    colorSender: 'text-secondary-content',
    successSender: tx => `You submitted proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
    failSender: tx => 'You failed to submit a proposal',
    successReceiver: tx => `Proposal #${tx.proposal_ids} was submitted by ${tx.sender}`.trim(), // TODO Link to proposal
  }),
  [MsgVote.typeUrl]: createSenderReceiverHandler({
    iconSender: GroupsIcon,
    colorSender: 'text-secondary-content',
    successSender: tx =>
      `You voted ${formatVote(tx.metadata.option)} on proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
    failSender: tx => `You failed to vote on proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
    successReceiver: tx => `Proposal #${tx.proposal_ids} was voted on by ${tx.sender}`.trim(),
  }),
  [MsgWithdrawProposal.typeUrl]: createSenderReceiverHandler({
    iconSender: GroupsIcon,
    colorSender: 'text-secondary-content',
    successSender: tx => `You withdrew proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
    failSender: tx => `You failed to withdraw proposal #${tx.proposal_ids}`.trim(), // TODO Link to proposal
    successReceiver: tx => `Proposal #${tx.proposal_ids} was withdrawn by ${tx.sender}`.trim(), // TODO Link to proposal
  }),
  [MsgUpdateGroupMetadata.typeUrl]: createSenderReceiverHandler({
    iconSender: GroupsIcon,
    colorSender: 'text-secondary-content',
    successSender: tx => `You updated the metadata of group ${tx.sender}`, // TODO: Policy addr?
    failSender: tx => `You failed to update the metadata of group ${tx.sender}`,
    successReceiver: tx => `Group ${tx.sender} had its metadata updated`,
  }),
  [MsgUpdateGroupPolicyMetadata.typeUrl]: createSenderReceiverHandler({
    iconSender: GroupsIcon,
    colorSender: 'text-secondary-content',
    successSender: tx =>
      `You updated the policy metadata of group ${tx.metadata.groupPolicyAddress}`,
    failSender: tx =>
      `You failed to update policy metadata of group ${tx.metadata.groupPolicyAddress}`,
    successReceiver: tx =>
      `Group ${tx.metadata.groupPolicyAddress} had its policy metadata updated`,
  }),
  [MsgUpdateGroupPolicyDecisionPolicy.typeUrl]: createSenderReceiverHandler({
    iconSender: GroupsIcon,
    colorSender: 'text-secondary-content',
    successSender: tx =>
      `You updated the decision policy of group ${tx.metadata.groupPolicyAddress}`,
    failSender: tx =>
      `You failed to update the decision policy of group ${tx.metadata.groupPolicyAddress}`,
    successReceiver: tx =>
      `Group ${tx.metadata.groupPolicyAddress} had its decision policy updated`,
  }),
  [MsgLeaveGroup.typeUrl]: createSenderReceiverHandler({
    iconSender: GroupsIcon,
    colorSender: 'text-secondary-content',
    successSender: 'You left a group', // TODO: Group info?
    failSender: 'You failed to leave a group',
    successReceiver: 'Group had a member leave',
  }),
  [MsgUpdateGroupMembers.typeUrl]: createSenderReceiverHandler({
    iconSender: GroupsIcon,
    colorSender: 'text-secondary-content',
    successSender: 'You updated group members',
    failSender: 'You failed to update group members',
    successReceiver: 'A group mentioning you had its members updated',
  }),
  [MsgCreateDenom.typeUrl]: createSenderReceiverHandler({
    iconSender: FactoryIcon,
    colorSender: 'text-secondary-content',
    successSender: tx =>
      `You created the ${formatDenom(`factory/${tx.sender}/${tx.metadata.subdenom}`)} denomination`,
    failSender: tx =>
      `You failed to create the ${formatDenom(`factory/${tx.sender}/${tx.metadata.subdenom}`)} denomination`,
    successReceiver: tx =>
      `The ${formatDenom(`factory/${tx.sender}/${tx.metadata.subdenom}`)} denomination was created`,
  }),
  [MsgSetDenomMetadata.typeUrl]: createSenderReceiverHandler({
    iconSender: FactoryIcon,
    colorSender: 'text-secondary-content',
    successSender: tx => `You set the metadata of denomination ${formatDenom(tx.metadata.base)}`,
    failSender: tx => `You failed the metadata of denomination ${formatDenom(tx.metadata.base)}`,
    successReceiver: tx => `The ${formatDenom(tx.metadata.base)} denomination had its metadata set`,
  }),
  [MsgSoftwareUpgrade.typeUrl]: createSenderReceiverHandler({
    iconSender: ArrowUpIcon,
    colorSender: 'text-secondary-content',
    successSender: tx =>
      `A chain upgrade to ${tx.metadata.plan.name} is scheduled for block ${tx.metadata.plan.height}`,
    failSender: tx => `You failed to schedule a chain software upgrade to ${tx.metadata.plan.name}`,
    // The "receiver" scenario doesn't strictly apply if there's only a single actor,
    // so successReceiver is effectively the same message:
    successReceiver: tx =>
      `A chain upgrade to ${tx.metadata.plan.name} is scheduled for block ${tx.metadata.plan.height}`,
  }),
  [MsgCancelUpgrade.typeUrl]: createSenderReceiverHandler({
    iconSender: ArrowUpIcon,
    colorSender: 'text-secondary-content',
    successSender: 'You successfully cancelled the chain upgrade',
    failSender: 'You failed to cancel chain software upgrade',
    successReceiver: tx => `The chain software upgrade was cancelled by ${tx.sender}`,
  }),
  [MsgSetPower.typeUrl]: createSenderReceiverHandler({
    iconSender: AdminsIcon,
    colorSender: 'text-secondary-content',
    successSender: tx =>
      `You set the validator ${tx.metadata.validatorAddress} power to ${tx.metadata.power}`,
    failSender: tx =>
      `You failed to set the validator ${tx.metadata.validatorAddress} power to ${tx.metadata.power}`,
    successReceiver: tx =>
      `Validator ${tx.metadata.validatorAddress} had its power set to ${tx.metadata.power}`,
  }),
  [MsgRemovePending.typeUrl]: createSenderReceiverHandler({
    iconSender: AdminsIcon,
    colorSender: 'text-secondary-content',
    successSender: tx => `You removed pending validator ${tx.metadata.validatorAddress}`,
    failSender: tx => `You failed to remove pending validator ${tx.metadata.validatorAddress}`,
    successReceiver: tx => `Validator ${tx.metadata.validatorAddress} was removed from pending`,
  }),
  [MsgRemoveValidator.typeUrl]: createSenderReceiverHandler({
    iconSender: AdminsIcon,
    colorSender: 'text-secondary-content',
    successSender: tx => `You removed validator ${tx.metadata.validatorAddress}`,
    failSender: tx => 'You failed to remove validator ${tx.metadata.validatorAddress}',
    successReceiver: tx => `Validator ${tx.metadata.validatorAddress} was removed`,
  }),
  [MsgCreateValidator.typeUrl]: createSenderReceiverHandler({
    iconSender: AdminsIcon,
    colorSender: 'text-secondary-content',
    successSender: tx => `You created validator ${tx.metadata.validatorAddress}`,
    failSender: tx => `You failed to create validator ${tx.metadata.validatorAddress}`,
    successReceiver: tx => `Validator ${tx.metadata.validatorAddress} was created`,
  }),
};

function formatLargeNumber(num: number): string {
  const quintillion = 1e18;
  const quadrillion = 1e15;
  const trillion = 1e12;
  const billion = 1e9;
  const million = 1e6;

  if (num < million) {
    return num.toString();
  }

  if (num >= quintillion) {
    return `${(num / quintillion).toFixed(2)}QT`;
  } else if (num >= quadrillion) {
    return `${(num / quadrillion).toFixed(2)}Q`;
  } else if (num >= trillion) {
    return `${(num / trillion).toFixed(2)}T`;
  } else if (num >= billion) {
    return `${(num / billion).toFixed(2)}B`;
  } else if (num >= million) {
    return `${(num / million).toFixed(2)}M`;
  }
  return num.toFixed(6);
}

export function HistoryBox({
  isLoading: initialLoading,
  address,
  currentPage,
  setCurrentPage,
  sendTxs,
  totalPages,
  txLoading,
  isError,
  refetch,
  skeletonGroupCount,
  skeletonTxCount,
  isGroup,
}: Readonly<{
  isLoading: boolean;
  address: string;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  sendTxs: TxMessage[];
  totalPages: number;
  txLoading: boolean;
  isError: boolean;
  refetch: () => void;
  skeletonGroupCount: number;
  skeletonTxCount: number;
  isGroup?: boolean;
}>) {
  const [selectedTx, setSelectedTx] = useState<TxMessage | null>(null);

  const isLoading = initialLoading || txLoading;

  const { metadatas } = useTokenFactoryDenomsMetadata();

  function formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getTransactionIcon(tx: TxMessage, address: string) {
    const IconComponent =
      transactionRenderData[tx.type]?.(tx, address)?.icon ?? defaultHandler.icon;
    return <IconComponent />;
  }

  function getTransactionMessage(tx: TxMessage, address: string) {
    return transactionRenderData[tx.type]?.(tx, address)?.message ?? defaultHandler.message;
  }

  function getTransactionColor(tx: TxMessage, address: string) {
    return transactionRenderData[tx.type]?.(tx, address)?.color ?? defaultHandler.color;
  }

  function getTransactionPlusMinus(tx: TxMessage, address: string, metadata?: MetadataSDKType[]) {
    return transactionRenderData[tx.type]?.(tx, address, metadata)?.sign ?? defaultHandler.sign;
  }

  return (
    <div className="w-full mx-auto rounded-[24px] h-full flex flex-col">
      {isLoading ? (
        <div className="flex-1 overflow-hidden h-full">
          <div aria-label="skeleton" className="space-y-2">
            {[...Array(skeletonGroupCount)].map((_, groupIndex) => (
              <div key={groupIndex}>
                <div className="space-y-2">
                  {[...Array(skeletonTxCount)].map((_, txIndex) => (
                    <div
                      key={txIndex}
                      className="flex items-center justify-between p-4 bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px]"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="skeleton w-9 h-9 rounded-full"></div>
                        <div className="skeleton w-11 h-11 rounded-md"></div>
                        <div>
                          <div className="flex flex-row items-center gap-2">
                            <div className="skeleton h-6 w-16"></div>
                            <div className="skeleton h-6 w-12"></div>
                          </div>
                          <div className="skeleton h-5 w-32 mt-1"></div>
                        </div>
                      </div>
                      <div className="skeleton h-4 w-24 sm:block hidden"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden h-full">
          {txLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-[200px] w-full bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] rounded-[16px]">
              <p className="text-center text-red-500">Error loading transactions</p>
            </div>
          ) : !sendTxs || sendTxs.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] w-full bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] mt-5 rounded-[16px]">
              <p className="text-center text-[#00000099] dark:text-[#FFFFFF99]">
                No transactions found!
              </p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              {sendTxs?.slice(0, skeletonTxCount).map((tx, index) => (
                <div
                  key={`${tx.id}-${index}`}
                  className={`flex items-center justify-between p-4 
                    ${tx.error ? 'bg-[#E5393522] dark:bg-[#E5393533] hover:bg-[#E5393544] dark:hover:bg-[#E5393555]' : 'bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A]'}
                    rounded-[16px] cursor-pointer transition-colors mb-2`}
                  onClick={() => {
                    setSelectedTx(tx);
                    (document?.getElementById(`tx_modal_info`) as HTMLDialogElement)?.showModal();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                      {getTransactionIcon(tx, address)}
                    </div>

                    <div>
                      <div className="flex flex-row items-center gap-2">
                        <p className="font-semibold text-[#161616] dark:text-white">
                          {getTransactionMessage(tx, address)}
                        </p>
                        <p className="font-semibold text-[#161616] dark:text-white"></p>
                      </div>
                      <div
                        className="address-copy xs:block hidden"
                        onClick={e => e.stopPropagation()}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right flex-col items-end sm:flex hidden">
                    <p className="text-sm text-[#00000099] dark:text-[#FFFFFF99] mb-1">
                      {formatDateShort(tx.timestamp)}
                    </p>
                    {!tx.error && (
                      <p className={`font-semibold ${getTransactionColor(tx, address)} `}>
                        {getTransactionPlusMinus(tx, address, metadatas?.metadatas)}
                      </p>
                    )}
                    <div className="text-red-500 text-xs">
                      Fee:{' -'}
                      {tx.fee &&
                        formatLargeNumber(Number(shiftDigits(tx.fee.amount?.[0]?.amount, -6))) +
                          ' ' +
                          formatDenom(tx.fee.amount?.[0]?.denom)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
            aria-label="Previous page"
            className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            // Only show current page and adjacent pages
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors  
                      ${
                        currentPage === pageNum
                          ? 'bg-[#0000001A] dark:bg-[#FFFFFF1A] text-black dark:text-white'
                          : 'hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white'
                      }`}
                >
                  {pageNum}
                </button>
              );
            } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return (
                <span className="text-black dark:text-white" key={pageNum}>
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
            aria-label="Next page"
            className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      )}

      <TxInfoModal modalId={`tx_modal_info`} tx={selectedTx ?? ({} as TxMessage)} />
    </div>
  );
}
