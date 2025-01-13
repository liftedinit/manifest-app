import { TransactionGroup } from '@/components';

export interface TransactionAmount {
  amount: string;
  denom: string;
}

export enum HistoryTxType {
  UNKNOWN,
  // Bank
  SEND,

  // IBC
  IBC_TRANSFER,

  // Token Factory
  CREATE_DENOM,
  SET_DENOM_METADATA,
  MINT,
  BURN,
  CHANGE_ADMIN,

  // Manifest
  PAYOUT,
  BURN_HELD_BALANCE,

  // Group
  SUBMIT_PROPOSAL,
  VOTE_PROPOSAL,
  EXEC_PROPOSAL,
  WITHDRAW_PROPOSAL,
  LEAVE_GROUP,
  CREATE_GROUP_WITH_POLICY,
  UPDATE_GROUP_METADATA,
  UPDATE_GROUP_POLICY_METADATA,
  UPDATE_GROUP_MEMBERS,
}

export interface ParsedTransactionData {
  tx_type: HistoryTxType;
  from_address: string;
  to_address?: string;
  amount?: TransactionAmount[];
  metadata?: Record<string, any>;
}

// Bank
function parseMsgSend(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.SEND,
      from_address: message.fromAddress,
      to_address: message.toAddress,
      amount: message.amount.map((amt: TransactionAmount) => ({
        amount: amt.amount,
        denom: amt.denom,
      })),
    },
  ];
}

// Token Factory
function parseMsgMint(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.MINT,
      from_address: message.sender,
      to_address: message.mintToAddress,
      amount: [message.amount],
    },
  ];
}

function parseChangeAdmin(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.CHANGE_ADMIN,
      from_address: message.sender,
      to_address: message.newAdmin,
      metadata: {
        denom: message.denom,
      },
    },
  ];
}

function parseMsgBurn(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.BURN,
      from_address: message.sender,
      to_address: message.burnFromAddress,
      amount: [message.amount],
    },
  ];
}

function parseSetDenomMetadata(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.SET_DENOM_METADATA,
      from_address: message.sender,
      metadata: {
        name: message.metadata.name,
        description: message.metadata.description,
        ticker: message.metadata.display,
        base: message.metadata.base,
      },
    },
  ];
}

function parseCreateDenom(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.CREATE_DENOM,
      from_address: message.sender,
      metadata: {
        denom: message.subdenom,
      },
    },
  ];
}

// Manifest
function parseMsgPayout(message: any, currentUser: string): ParsedTransactionData[] {
  return message.payoutPairs
    .map((pair: { coin: TransactionAmount; address: string }) => {
      // Only include relevant pairs if we care about the address
      if (message.authority === currentUser || pair.address === currentUser) {
        return {
          tx_type: HistoryTxType.PAYOUT,
          from_address: message.authority,
          to_address: pair.address,
          amount: [{ amount: pair.coin.amount, denom: pair.coin.denom }],
        };
      }
      return null;
    })
    .filter(Boolean) as ParsedTransactionData[];
}

function parseMsgBurnHeldBalance(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.BURN_HELD_BALANCE,
      from_address: message.authority,
      to_address: message.authority,
      amount: message.burnCoins,
    },
  ];
}

// IBC
function parseIbcTransfer(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.IBC_TRANSFER,
      from_address: message.sender,
      to_address: message.receiver,
      amount: [{ amount: message.token.amount, denom: message.token.denom }],
    },
  ];
}

// Group
function parseCreateGroupWithPolicy(message: any): ParsedTransactionData[] {
  const metadata: Record<string, any> = {};
  let parsedMetadata;
  try {
    parsedMetadata = JSON.parse(message.groupMetadata);
    for (const key in parsedMetadata) {
      if (['title', 'details', 'authors'].includes(key) && parsedMetadata.hasOwnProperty(key)) {
        metadata[key] = parsedMetadata[key];
      }
    }
  } catch (e) {
    console.log('Error parsing group metadata', e);
  }

  const result: ParsedTransactionData = {
    tx_type: HistoryTxType.CREATE_GROUP_WITH_POLICY,
    from_address: message.admin,
  };

  if (Object.keys(metadata).length > 0) {
    result.metadata = metadata;
  }

  return [result];
}

function parseExecGroupProposal(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.EXEC_PROPOSAL,
      from_address: message.executor,
      metadata: {
        proposal_id: message.proposalId,
      },
    },
  ];
}

function parseSubmitGroupProposal(message: any, address: string): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.SUBMIT_PROPOSAL,
      from_address: address,
      metadata: {
        title: message.title,
        description: message.summary,
        proposers: message.proposers,
      },
    },
  ];
}

function parseVoteGroupProposal(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.VOTE_PROPOSAL,
      from_address: message.voter,
      metadata: {
        proposal_id: message.proposalId,
        option: message.option,
      },
    },
  ];
}

function parseWithdrawGroupProposal(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.WITHDRAW_PROPOSAL,
      from_address: message.address,
      metadata: {
        proposal_id: message.proposalId,
      },
    },
  ];
}

function parseUpdateGroupMetadata(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.UPDATE_GROUP_METADATA,
      from_address: message.admin,
      metadata: {
        group_id: message.groupId,
        metadata: message.metadata,
      },
    },
  ];
}

function parseUpdateGroupPolicyMetadata(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.UPDATE_GROUP_POLICY_METADATA,
      from_address: message.admin,
      metadata: {
        group_address: message.groupPolicyAddress,
        metadata: message.metadata,
      },
    },
  ];
}

function parseLeaveGroup(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.LEAVE_GROUP,
      from_address: message.address,
      metadata: {
        group_id: message.groupId,
      },
    },
  ];
}

function parseUpdateGroupMembers(message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.UPDATE_GROUP_MEMBERS,
      from_address: message.admin,
      metadata: {
        group_id: message.groupId,
      },
    },
  ];
}

// Unknown
function parseUnknown(_message: any): ParsedTransactionData[] {
  return [
    {
      tx_type: HistoryTxType.UNKNOWN,
      from_address: '',
      to_address: '',
      amount: [],
    },
  ];
}

const messageParserRegistry: Record<
  string,
  (msg: any, address: string) => ParsedTransactionData[]
> = {
  // Bank
  '/cosmos.bank.v1beta1.MsgSend': (msg, _address) => parseMsgSend(msg),
  '/ibc.applications.transfer.v1.MsgTransfer': (msg, _address) => parseIbcTransfer(msg),
  // Token Factory
  '/osmosis.tokenfactory.v1beta1.MsgMint': (msg, _address) => parseMsgMint(msg),
  '/osmosis.tokenfactory.v1beta1.MsgBurn': (msg, _address) => parseMsgBurn(msg),
  '/osmosis.tokenfactory.v1beta1.MsgChangeAdmin': (msg, _address) => parseChangeAdmin(msg),
  '/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata': (msg, _address) =>
    parseSetDenomMetadata(msg),
  '/osmosis.tokenfactory.v1beta1.MsgCreateDenom': (msg, _address) => parseCreateDenom(msg),
  // Manifest
  '/liftedinit.manifest.v1.MsgPayout': (msg, address) => parseMsgPayout(msg, address),
  '/liftedinit.manifest.v1.MsgBurnHeldBalance': (msg, _address) => parseMsgBurnHeldBalance(msg),
  // Group
  '/cosmos.group.v1.MsgCreateGroupWithPolicy': (msg, _address) => parseCreateGroupWithPolicy(msg),
  '/cosmos.group.v1.MsgExec': (msg, _address) => parseExecGroupProposal(msg),
  '/cosmos.group.v1.MsgSubmitProposal': (msg, address) => parseSubmitGroupProposal(msg, address),
  '/cosmos.group.v1.MsgVote': (msg, _address) => parseVoteGroupProposal(msg),
  '/cosmos.group.v1.MsgWithdrawProposal': (msg, _address) => parseWithdrawGroupProposal(msg),
  '/cosmos.group.v1.MsgUpdateGroupMetadata': (msg, _address) => parseUpdateGroupMetadata(msg),
  '/cosmos.group.v1.MsgUpdateGroupPolicyMetadata': (msg, _address) =>
    parseUpdateGroupPolicyMetadata(msg),
  '/cosmos.group.v1.MsgLeaveGroup': (msg, _address) => parseLeaveGroup(msg),
  '/cosmos.group.v1.MsgUpdateGroupMembers': (msg, _address) => parseUpdateGroupMembers(msg),
};

export const _formatMessage = (message: any, address: string): ParsedTransactionData[] => {
  const parser = messageParserRegistry[message['@type']];
  if (parser) {
    return parser(message, address);
  }
  return parseUnknown(message);
};

export const transformTransactions = (tx: any, address: string) => {
  const messages: TransactionGroup[] = [];
  const memo = tx.data.tx.body.memo ? { memo: tx.data.tx.body.memo } : {};
  let fee = undefined;
  if (tx.data.tx.authInfo.fee.amount && tx.data.tx.authInfo.fee.amount.length > 0) {
    fee = tx.data.tx.authInfo.fee.amount[0];
  }

  for (const message of tx.data.tx.body.messages) {
    let proposalId = undefined;

    // Handle special grouping logic (e.g., group proposals)
    if (message['@type'] === '/cosmos.group.v1.MsgSubmitProposal') {
      // Get the proposal ID
      const event = tx.data.txResponse.events.find(
        (event: { type: string }) => event.type === 'cosmos.group.v1.EventSubmitProposal'
      );
      if (event) {
        const attr = event.attributes.find((attr: { key: string }) => attr.key === 'proposal_id');
        if (attr) {
          proposalId = attr.value.replace(/"/g, ''); // Remove quotes
        }
      }
      for (const nestedMessage of message.messages) {
        // If none of the nested message content includes the address, skip it
        if (!JSON.stringify(nestedMessage).includes(address)) {
          continue;
        }

        const formattedMessages = _formatMessage(nestedMessage, address);
        for (const fm of formattedMessages) {
          // Add proposalId to metadata
          fm.metadata = {
            ...fm.metadata,
            proposal_id: proposalId,
          };
          messages.push({
            tx_hash: tx.id,
            block_number: parseInt(tx.data.txResponse.height),
            formatted_date: tx.data.txResponse.timestamp,
            ...memo,
            data: fm,
          });
        }
      }
    }

    // Handle top-level message
    const formattedMessages = _formatMessage(message, address);
    for (const fm of formattedMessages) {
      if (proposalId) {
        fm.metadata = {
          ...fm.metadata,
          proposal_id: proposalId,
        };
      }
      messages.push({
        tx_hash: tx.id,
        block_number: parseInt(tx.data.txResponse.height),
        formatted_date: tx.data.txResponse.timestamp,
        ...memo,
        ...fee,
        data: fm,
      });
    }
  }

  return messages;
};
