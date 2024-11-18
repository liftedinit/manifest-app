import { CustomMessage, RemoveValidatorMessage, SendMessage } from '@/helpers';

// Bank
export const initialSendMessage: SendMessage = {
  type: 'send',
  from_address: '',
  to_address: '',
  amount: { denom: '', amount: '' },
};
export const initialMultiSendMessage = {
  type: 'multiSend',
  inputs: [{ address: '', coins: [{ denom: '', amount: '' }] }],
  outputs: [{ address: '', coins: [{ denom: '', amount: '' }] }],
};

// Manifest Messages
export const initialPayoutStakeholdersMessage = {
  type: 'payoutStakeholders',
  authority: '',
  address: '',
  amount: { denom: '', amount: '' },
};

export const initialBurnHeldBalanceMessage = {
  type: 'burnHeldBalance',
  authority: '',
  amount: { denom: '', amount: '' },
};

// Group Messages
export const initialUpdateGroupAdminMessage = {
  type: 'updateGroupAdmin',
  new_admin: '',
  group_id: BigInt(0),
  admin: '',
};

export const initialUpdateGroupMembersMessage = {
  type: 'updateGroupMembers',
  group_id: BigInt(0),
  admin: '',
  member_updates: [{ address: '', weight: '', metadata: '', added_at: {} as Date }],
};

export const initialUpdateGroupMetadataMessage = {
  type: 'updateGroupMetadata',
  group_id: BigInt(0),
  admin: '',
  metadata: '',
};

export const initialUpdateGroupPolicyAdminMessage = {
  type: 'updateGroupPolicyAdmin',
  new_admin: '',
  admin: '',
  address: '',
};

// Token Factory
export const initialCreateDenomMessage = {
  type: 'createDenom',
  sender: '',
  subdenom: '',
};

export const initialSetDenomMetadataMessage = {
  type: 'setDenomMetadata',
  sender: '',
  metadata: {
    description: '',
    base: '',
    ticker: '',
    name: '',
    logo: '',
  },
};

export const initialMintMessage = {
  type: 'mint',
  sender: '',
  amount: { denom: '', amount: '' },
  mint_to_address: '',
};

export const initialBurnMessage = {
  type: 'burn',
  sender: '',
  amount: { denom: '', amount: '' },
  burn_from_address: '',
};

export const initialChangeAdminMessage = {
  type: 'changeAdmin',
  sender: '',
  new_admin: '',
};

// Upgrade
export const initialSoftwareUpgradeMessage = {
  type: 'softwareUpgrade',
  authority: '',
  plan: { name: '', time: {} as Date, height: BigInt(0), info: '' },
};

export const initialCancelUpgradeMessage = {
  type: 'cancelUpgrade',
  authority: '',
};

export const initialCustomMessage: CustomMessage = {
  type: 'customMessage',
  custom_field: '',
};
