import { DenomUnit } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { Duration } from '@chalabi/manifestjs/dist/codegen/google/protobuf/duration';
import { Coin } from '@cosmjs/stargate';

// Schemas for form data
export type FormData = {
  title: string;
  authors: string | string[];
  summary: string;
  description: string;
  forumLink: string;
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
  | { type: 'ADD_MEMBER'; member: FormData['members'][0] };

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

    default:
      throw new Error('Unknown action type');
  }
};

export type SendMessage = {
  type: 'send';
  from_address: string;
  to_address: string;
  amount: Coin;
};

export type CustomMessage = {
  type: 'customMessage';
  custom_field: string;
};

export type UpdatePoaParamsMessage = {
  type: 'updatePoaParams';
  sender: string;
  params: {
    admins: string[];
    allow_validator_self_exit: boolean;
  };
};

export type RemoveValidatorMessage = {
  type: 'removeValidator';
  sender: string;
  validator_address: string;
};

export type UpdateStakingParamsMessage = {
  type: 'updateStakingParams';
  sender: string;
  params: {
    unbonding_time: { seconds: bigint; nanos: number };
    max_validators: number;
    max_entries: number;
    historical_entries: number;
    bond_denom: string;
    min_commission_rate: string;
  };
};

export type RemovePendingMessage = {
  type: 'removePending';
  sender: string;
  validator_address: string;
};

export type SetPowerMessage = {
  type: 'setPower';
  sender: string;
  validator_address: string;
  power: bigint;
  unsafe: boolean;
};

export type UpdateManifestParamsMessage = {
  type: 'updateManifestParams';
  authority: string;
  params: {
    stake_holders: { address: string; percentage: number }[];
    inflation: {
      automatic_enabled: boolean;
      mint_denom: string;
      yearly_amount: bigint;
    };
  };
};

export type PayoutStakeholdersMessage = {
  type: 'payoutStakeholders';
  authority: string;
  payout: { denom: string; amount: string };
};

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

export type CreateGroupWithPolicyMessage = {
  type: 'createGroupWithPolicy';
  admin: string;
  group_metadata: string;
  group_policy_as_admin: boolean;
  group_policy_metadata: string;
  members: {
    address: string;
    weight: string;
    metadata: string;
    added_at: Date;
  }[];
};

export type SubmitProposalMessage = {
  type: 'submitProposal';
  proposers: string[];
  messages: any[];
  metadata: string;
  address: string;
  exec: number;
};

export type VoteMessage = {
  type: 'vote';
  voter: string;
  proposal_id: bigint;
  option: number;
  metadata: string;
  exec: number;
};

export type WithdrawProposalMessage = {
  type: 'withdrawProposal';
  proposal_id: bigint;
  address: string;
};

export type ExecMessage = {
  type: 'exec';
  proposal_id: bigint;
  signer: string;
};

export type LeaveGroupMessage = {
  type: 'leaveGroup';
  group_id: bigint;
  address: string;
};

export type MultiSendMessage = {
  type: 'multiSend';
  inputs: { address: string; coins: { denom: string; amount: string }[] }[];
  outputs: { address: string; coins: { denom: string; amount: string }[] }[];
};

export type SoftwareUpgradeMessage = {
  type: 'softwareUpgrade';
  authority: string;
  plan: { name: string; time: Date; height: bigint; info: string };
};

export type CancelUpgradeMessage = {
  type: 'cancelUpgrade';
  authority: string;
};

// Add more message types as needed

// Union of all possible message types
export type Message =
  | SendMessage
  | CustomMessage
  | UpdatePoaParamsMessage
  | RemovePendingMessage
  | SetPowerMessage
  | UpdateStakingParamsMessage
  | UpdateManifestParamsMessage
  | PayoutStakeholdersMessage
  | UpdateGroupAdminMessage
  | UpdateGroupMembersMessage
  | UpdateGroupMetadataMessage
  | UpdateGroupPolicyAdminMessage
  | CreateGroupWithPolicyMessage
  | SubmitProposalMessage
  | VoteMessage
  | WithdrawProposalMessage
  | ExecMessage
  | LeaveGroupMessage
  | RemoveValidatorMessage
  | MultiSendMessage
  | SoftwareUpgradeMessage
  | CancelUpgradeMessage;

export type MessageFields =
  | keyof SendMessage
  | keyof CustomMessage
  | keyof UpdatePoaParamsMessage
  | keyof RemoveValidatorMessage
  | keyof RemovePendingMessage
  | keyof SetPowerMessage
  | keyof UpdateStakingParamsMessage
  | keyof UpdateManifestParamsMessage
  | keyof PayoutStakeholdersMessage
  | keyof UpdateGroupAdminMessage
  | keyof UpdateGroupMembersMessage
  | keyof UpdateGroupMetadataMessage
  | keyof UpdateGroupPolicyAdminMessage
  | keyof CreateGroupWithPolicyMessage
  | keyof SubmitProposalMessage
  | keyof VoteMessage
  | keyof WithdrawProposalMessage
  | keyof ExecMessage
  | keyof LeaveGroupMessage
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
