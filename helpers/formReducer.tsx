import { DenomUnit } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { Duration } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/duration';
import { Coin } from '@cosmjs/stargate';
import { Metadata } from 'cosmjs-types/cosmos/bank/v1beta1/bank';

// Schemas for form data
export type FormData = {
  title: string;
  authors: string | string[];
  description: string;
  votingPeriod: Duration;
  votingThreshold: string;
  members: { address: string; name: string; weight: string }[];
};

export type TokenFormData = {
  subdenom: string;
  symbol: string;
  description: string;
  exponent: string;
  uri: string;
  display: string;
  label: string;
  base: string;
  name: string;
  uriHash: string;
  denomUnits: DenomUnit[];
};

export type TokenAction = {
  type: 'UPDATE_FIELD';
  field: keyof TokenFormData;
  value: any;
};

export const tokenFormDataReducer = (state: TokenFormData, action: TokenAction): TokenFormData => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };

    default:
      throw new Error('Unknown action type');
  }
};

// Actions for form data
export type Action =
  | { type: 'UPDATE_FIELD'; field: keyof FormData; value: any }
  | { type: 'ADD_AUTHOR' }
  | { type: 'REMOVE_AUTHOR'; index: number }
  | { type: 'UPDATE_AUTHOR'; index: number; value: string }
  | {
      type: 'UPDATE_MEMBER';
      index: number;
      field: keyof FormData['members'][0];
      value: any;
    }
  | { type: 'ADD_MEMBER'; member: FormData['members'][0] }
  | { type: 'REMOVE_MEMBER'; index: number };

// Reducers
export const formDataReducer = (state: FormData, action: Action): FormData => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };

    case 'ADD_AUTHOR':
      return {
        ...state,
        authors: Array.isArray(state.authors) ? [...state.authors, ''] : [state.authors, ''],
      };

    case 'REMOVE_AUTHOR':
      if (!Array.isArray(state.authors)) return state;
      return {
        ...state,
        authors: state.authors.filter((_, index) => index !== action.index),
      };

    case 'UPDATE_AUTHOR':
      if (!Array.isArray(state.authors)) return state;
      return {
        ...state,
        authors: state.authors.map((author, index) =>
          index === action.index ? action.value : author
        ),
      };

    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map((m, i) =>
          i === action.index ? { ...m, [action.field]: action.value } : m
        ),
      };

    case 'ADD_MEMBER':
      return {
        ...state,
        members: [...state.members, action.member],
      };

    case 'REMOVE_MEMBER':
      return {
        ...state,
        members: state.members.filter((_, index) => index !== action.index),
      };

    default:
      throw new Error('Unknown action type');
  }
};

// Bank
export type SendMessage = {
  type: 'send';
  from_address: string;
  to_address: string;
  amount: Coin;
};

export type MultiSendMessage = {
  type: 'multiSend';
  inputs: { address: string; coins: { denom: string; amount: string }[] }[];
  outputs: { address: string; coins: { denom: string; amount: string }[] }[];
};

// Manifest
export type PayoutStakeholdersMessage = {
  type: 'payoutStakeholders';
  authority: string;
  payout_pairs: { address: string; amount: { denom: string; amount: string } }[];
};

export type BurnHeldBalanceMessage = {
  type: 'burnHeldBalance';
  authority: string;
  burn_coins: { denom: string; amount: string }[];
};

// Group
export type UpdateGroupAdminMessage = {
  type: 'updateGroupAdmin';
  new_admin: string;
  group_id: bigint;
  admin: string;
};

export type UpdateGroupMembersMessage = {
  type: 'updateGroupMembers';
  group_id: bigint;
  admin: string;
  member_updates: {
    address: string;
    weight: string;
    metadata: string;
    added_at: Date;
  }[];
};

export type UpdateGroupMetadataMessage = {
  type: 'updateGroupMetadata';
  group_id: bigint;
  admin: string;
  metadata: string;
};

export type UpdateGroupPolicyAdminMessage = {
  type: 'updateGroupPolicyAdmin';
  new_admin: string;
  admin: string;
  address: string;
};

export type UpdateGroupPolicyMetadataMessage = {
  type: 'updateGroupPolicyMetadata';
  metadata: string;
  address: string;
};

// Token Factory
export type CreateDenomMessage = {
  type: 'createDenom';
  sender: string;
  subdenom: string;
};

export type SetDenomMetadataMessage = {
  type: 'setDenomMetadata';
  sender: string;
  metadata: {
    base: string;
    display: string;
    description: string;
    name: string;
    symbol: string;
    uri: string;
    uri_hash: string;
    denom_units: {
      denom: string;
      exponent: number;
      aliases: string[];
    }[];
  };
};

export type MintMessage = {
  type: 'mint';
  sender: string;
  amount: { denom: string; amount: string };
  mint_to_address: string;
};

export type BurnMessage = {
  type: 'burn';
  sender: string;
  amount: { denom: string; amount: string };
  burn_from_address: string;
};

export type ChangeAdminMessage = {
  type: 'changeAdmin';
  sender: string;
  new_admin: string;
};

// Upgrade
export type SoftwareUpgradeMessage = {
  type: 'softwareUpgrade';
  authority: string;
  plan: { name: string; time: Date; height: bigint; info: string };
};

export type CancelUpgradeMessage = {
  type: 'cancelUpgrade';
  authority: string;
};

export type CustomMessage = {
  type: 'customMessage';
  custom_field: string;
};

// Add more message types as needed

// Union of all possible message types
export type Message =
  // Bank
  | SendMessage
  | MultiSendMessage
  // Manifest
  | PayoutStakeholdersMessage
  | BurnHeldBalanceMessage
  // Group
  | UpdateGroupAdminMessage
  | UpdateGroupMembersMessage
  | UpdateGroupMetadataMessage
  | UpdateGroupPolicyAdminMessage
  | UpdateGroupPolicyMetadataMessage
  // Token Factory
  | CreateDenomMessage
  | SetDenomMetadataMessage
  | MintMessage
  | BurnMessage
  | ChangeAdminMessage
  // Upgrade
  | SoftwareUpgradeMessage
  | CancelUpgradeMessage
  | CustomMessage;

export type MessageFields =
  // Bank
  | keyof SendMessage
  | keyof MultiSendMessage
  // Manifest
  | keyof PayoutStakeholdersMessage
  | keyof BurnHeldBalanceMessage
  // Group
  | keyof UpdateGroupAdminMessage
  | keyof UpdateGroupMembersMessage
  | keyof UpdateGroupMetadataMessage
  | keyof UpdateGroupPolicyAdminMessage
  | keyof UpdateGroupPolicyMetadataMessage
  // Token Factory
  | keyof CreateDenomMessage
  | keyof SetDenomMetadataMessage
  | keyof MintMessage
  | keyof BurnMessage
  | keyof ChangeAdminMessage
  // Upgrade
  | keyof SoftwareUpgradeMessage
  | keyof CancelUpgradeMessage
  | keyof CustomMessage
  | 'type';

export type ProposalFormData = {
  title: string;
  proposers: string;
  summary: string;
  messages: Message[];
  metadata: {
    title: string;
    authors: string;
    summary: string;
    details: string;
  };
};

export type ProposalAction =
  | { type: 'UPDATE_FIELD'; field: keyof ProposalFormData; value: any }
  | { type: 'UPDATE_MESSAGE'; index: number; message: Message }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'REMOVE_MESSAGE'; index: number };

export const proposalFormDataReducer = (
  state: ProposalFormData,
  action: ProposalAction
): ProposalFormData => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((m, i) => (i === action.index ? action.message : m)),
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.message],
      };

    case 'REMOVE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter((_, i) => i !== action.index),
      };

    default:
      throw new Error('Unknown action type');
  }
};
