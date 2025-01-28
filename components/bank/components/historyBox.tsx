import React, { useState } from 'react';
import { shiftDigits, formatLargeNumber, TransactionAmount, TxMessage, formatDenom } from '@/utils';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { QuestionIcon } from '@/components/icons/QuestionIcon';
import { useTokenFactoryDenomsMetadata } from '@/hooks';
import TxInfoModal from '../modals/txInfo';
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
  MsgLeaveGroup,
  MsgSubmitProposal,
  MsgUpdateGroupMembers,
  MsgUpdateGroupMetadata,
  MsgUpdateGroupPolicyDecisionPolicy,
  MsgUpdateGroupPolicyMetadata,
  MsgVote,
  MsgWithdrawProposal,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import {
  MsgCancelUpgrade,
  MsgSoftwareUpgrade,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';
import {
  MsgCreateValidator,
  MsgRemovePending,
  MsgRemoveValidator,
  MsgSetPower,
} from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import {
  MsgBurnHandler,
  MsgBurnHeldBalanceHandler,
  MsgChangeAdminHandler,
  MsgCreateDenomHandler,
  MsgCreateGroupWithPolicyHandler,
  MsgExecHandler,
  MsgLeaveGroupHandler,
  MsgMintHandler,
  MsgPayoutHandler,
  MsgSendHandler,
  MsgSetDenomMetadataHandler,
  MsgSetPowerHandler,
  MsgSoftwareUpgradeHandler,
  MsgTransferHandler,
  MsgUpdateGroupMembersHandler,
  MsgUpdateGroupMetadataHandler,
  MsgUpdateGroupPolicyDecisionPolicyHandler,
  MsgUpdateGroupPolicyMetadataHandler,
  MsgVoteHandler,
  MsgWithdrawProposalHandler,
  MsgSubmitProposalHandler,
  MsgRemoveValidatorHandler,
  MsgRemovePendingValidatorHandler,
  MsgCancelUpgradeHandler,
  MsgCreateValidatorHandler,
} from '@/components/bank/handlers';

export interface TransactionGroup {
  tx_hash: string;
  block_number: number;
  formatted_date: string;
  fee?: TransactionAmount;
  memo?: string;
}

const defaultHandler = {
  icon: QuestionIcon,
  message: 'Unknown transaction type',
};

const transactionRenderData = {
  [MsgSend.typeUrl]: MsgSendHandler,
  [MsgTransfer.typeUrl]: MsgTransferHandler,
  [MsgMint.typeUrl]: MsgMintHandler,
  [MsgPayout.typeUrl]: MsgPayoutHandler,
  [MsgBurn.typeUrl]: MsgBurnHandler,
  [MsgBurnHeldBalance.typeUrl]: MsgBurnHeldBalanceHandler,
  [MsgChangeAdmin.typeUrl]: MsgChangeAdminHandler,
  [MsgCreateGroupWithPolicy.typeUrl]: MsgCreateGroupWithPolicyHandler,
  [MsgExec.typeUrl]: MsgExecHandler,
  [MsgSubmitProposal.typeUrl]: MsgSubmitProposalHandler,
  [MsgVote.typeUrl]: MsgVoteHandler,
  [MsgWithdrawProposal.typeUrl]: MsgWithdrawProposalHandler,
  [MsgUpdateGroupMetadata.typeUrl]: MsgUpdateGroupMetadataHandler,
  [MsgUpdateGroupPolicyMetadata.typeUrl]: MsgUpdateGroupPolicyMetadataHandler,
  [MsgUpdateGroupPolicyDecisionPolicy.typeUrl]: MsgUpdateGroupPolicyDecisionPolicyHandler,
  [MsgLeaveGroup.typeUrl]: MsgLeaveGroupHandler,
  [MsgUpdateGroupMembers.typeUrl]: MsgUpdateGroupMembersHandler,
  [MsgCreateDenom.typeUrl]: MsgCreateDenomHandler,
  [MsgSetDenomMetadata.typeUrl]: MsgSetDenomMetadataHandler,
  [MsgSoftwareUpgrade.typeUrl]: MsgSoftwareUpgradeHandler,
  [MsgCancelUpgrade.typeUrl]: MsgCancelUpgradeHandler,
  [MsgSetPower.typeUrl]: MsgSetPowerHandler,
  [MsgRemovePending.typeUrl]: MsgRemovePendingValidatorHandler,
  [MsgRemoveValidator.typeUrl]: MsgRemoveValidatorHandler,
  [MsgCreateValidator.typeUrl]: MsgCreateValidatorHandler,
};

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
  const { metadatas, isMetadatasLoading } = useTokenFactoryDenomsMetadata();

  const isLoading = initialLoading || txLoading || isMetadatasLoading;

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

  function getTransactionMessage(tx: TxMessage, address: string, metadata?: MetadataSDKType[]) {
    return (
      transactionRenderData[tx.type]?.(tx, address, metadata)?.message ?? defaultHandler.message
    );
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
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[#161616] dark:text-white">
                      {getTransactionIcon(tx, address)}
                    </div>
                    <div className="flex flex-col items-left">
                      <p className="text-sm text-[#00000099] dark:text-[#FFFFFF99] mb-1">
                        {formatDateShort(tx.timestamp)}
                      </p>
                      <div className="flex flex-row items-center gap-2">
                        <span className="font-semibold text-[#161616] dark:text-white">
                          {
                            <div
                              dangerouslySetInnerHTML={{
                                __html: getTransactionMessage(tx, address, metadatas?.metadatas),
                              }}
                            />
                          }
                        </span>
                        <p className="font-semibold text-[#161616] dark:text-white"></p>
                      </div>
                      <div className="text-gray-500 text-xs">
                        Incl.:{' '}
                        {tx.fee &&
                          formatLargeNumber(Number(shiftDigits(tx.fee.amount?.[0]?.amount, -6))) +
                            ' ' +
                            formatDenom(tx.fee.amount?.[0]?.denom)}{' '}
                        fee
                      </div>
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
