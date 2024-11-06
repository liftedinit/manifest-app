import { Chain } from '@chain-registry/types';
import {
  BondStatus,
  ParamsSDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking';
import { ExtendedValidatorSDKType, TransactionGroup } from '@/components';
import { CombinedBalanceInfo } from '@/utils/types';
import { ExtendedGroupType } from '@/hooks';
import {
  ProposalExecutorResult,
  ProposalSDKType,
  ProposalStatus,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { FormData, ProposalFormData } from '@/helpers';
import { cosmos } from '@liftedinit/manifestjs';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MsgSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';

export const manifestAddr1 = 'manifest1hj5fveer5cjtn4wd6wstzugjfdxzl0xp8ws9ct';
export const manifestAddr2 = 'manifest1efd63aw40lxf3n4mhf7dzhjkr453axurm6rp3z';

export const mockDenomMeta1: MetadataSDKType = {
  description: 'My First Token',
  name: 'Token 1',
  symbol: 'TK1',
  uri: '',
  uri_hash: '',
  display: 'Token 1',
  base: 'token1',
  denom_units: [
    { denom: 'utoken1', exponent: 0, aliases: ['utoken1'] },
    { denom: 'token1', exponent: 6, aliases: ['token1'] },
  ],
};

export const mockDenomMeta2: MetadataSDKType = {
  description: 'My Second Token',
  name: 'Token 2',
  symbol: 'TK2',
  uri: '',
  uri_hash: '',
  display: 'Token 2',
  base: 'token2',
  denom_units: [
    { denom: 'utoken2', exponent: 0, aliases: ['utoken2'] },
    { denom: 'token2', exponent: 6, aliases: ['token2'] },
  ],
};

export const mockBalances: CombinedBalanceInfo[] = [
  {
    denom: 'token1',
    coreDenom: 'utoken1',
    amount: '1000',
    metadata: mockDenomMeta1,
  },
  {
    denom: 'token2',
    coreDenom: 'utoken2',
    amount: '2000',
    metadata: mockDenomMeta2,
  },
];

export const mockActiveValidators: ExtendedValidatorSDKType[] = [
  {
    operator_address: 'validator1',
    description: {
      moniker: 'Validator One',
      identity: 'identity1',
      details: 'details1',
      website: 'website1.com',
      security_contact: 'security1@foobar.com',
    },
    consensus_power: BigInt(1000),
    logo_url: '',
    jailed: false,
    status: BondStatus.BOND_STATUS_BONDED,
    tokens: '1000upoa',
    delegator_shares: '1000',
    min_self_delegation: '1',
    unbonding_height: 0n,
    unbonding_time: new Date(),
    commission: {
      commission_rates: {
        rate: '0.1',
        max_rate: '0.2',
        max_change_rate: '0.01',
      },
      update_time: new Date(),
    },
    unbonding_on_hold_ref_count: 0n,
    unbonding_ids: [],
  },
  {
    operator_address: 'validator2',
    description: {
      moniker: 'Validator Two',
      identity: 'identity2',
      details: 'details2',
      website: 'website2.com',
      security_contact: 'security2',
    },
    consensus_power: BigInt(2000),
    logo_url: '',
    jailed: false,
    status: BondStatus.BOND_STATUS_BONDED,
    tokens: '2000upoa',
    delegator_shares: '2000',
    min_self_delegation: '1',
    unbonding_height: 0n,
    unbonding_time: new Date(),
    commission: {
      commission_rates: {
        rate: '0.1',
        max_rate: '0.2',
        max_change_rate: '0.01',
      },
      update_time: new Date(),
    },
    unbonding_on_hold_ref_count: 0n,
    unbonding_ids: [],
  },
];

export const mockPendingValidators: ExtendedValidatorSDKType[] = [
  {
    operator_address: 'validator3',
    description: {
      moniker: 'Validator Three',
      identity: 'identity2',
      details: 'details2',
      website: 'website2.com',
      security_contact: 'security2',
    },
    consensus_power: BigInt(3000),
    logo_url: '',
    jailed: false,
    status: BondStatus.BOND_STATUS_UNBONDED,
    tokens: '3000upoa',
    delegator_shares: '3000',
    min_self_delegation: '1',
    unbonding_height: 0n,
    unbonding_time: new Date(),
    commission: {
      commission_rates: {
        rate: '0.1',
        max_rate: '0.2',
        max_change_rate: '0.01',
      },
      update_time: new Date(),
    },
    unbonding_on_hold_ref_count: 0n,
    unbonding_ids: [],
  },
];

export const defaultAssetLists = [
  {
    chain_name: 'manifest',
    assets: [
      {
        name: 'Manifest Network Token',
        display: 'umfx',
        base: 'umfx',
        symbol: 'umfx',
        denom_units: [{ denom: 'umfx', exponent: 0, aliases: ['umfx'] }],
      },
    ],
  },
];

export const defaultChain: Chain = {
  chain_name: 'manifest',
  chain_id: 'manifest-1',
  status: 'live',
  network_type: 'testnet',
  pretty_name: 'Manifest Network',
  bech32_prefix: 'manifest',
  slip44: 118,
  fees: {
    fee_tokens: [
      {
        denom: 'umfx',
        fixed_min_gas_price: 0.001,
        low_gas_price: 0.001,
        average_gas_price: 0.001,
        high_gas_price: 0.001,
      },
    ],
  },
};

export const mockTransactions: TransactionGroup[] = [
  {
    tx_hash: 'hash1',
    block_number: 1,
    formatted_date: '2023-05-01T12:00:00Z',
    data: {
      from_address: 'address1',
      to_address: 'address2',
      amount: [{ amount: '1000000', denom: 'utoken' }],
    },
  },
  {
    tx_hash: 'hash2',
    block_number: 2,
    formatted_date: '2023-05-02T12:00:00Z',
    data: {
      from_address: 'address2',
      to_address: 'address1',
      amount: [{ amount: '2000000', denom: 'utoken' }],
    },
  },
];

export const mockStakingParams: ParamsSDKType = {
  unbonding_time: { seconds: 86400n, nanos: 0 },
  max_validators: 100,
  bond_denom: 'upoa',
  min_commission_rate: '0.05',
  max_entries: 7,
  historical_entries: 200,
};

// TODO: Not compatible with alpha.12 as poaParams is not defined in the current version
export const mockPoaParams = {
  admins: ['admin1'],
  allow_validator_self_exit: true,
};

export const mockGroup: ExtendedGroupType = {
  id: 1n,
  admin: 'admin1',
  metadata: 'metadata1',
  version: 1n,
  created_at: new Date(),
  ipfsMetadata: {
    title: 'title1',
    summary: 'summary1',
    details: 'details1',
    authors: 'author1, author2',
    proposalForumURL: 'forum1.com',
    voteOptionContext: 'context1',
  },
  total_weight: '10',
  policies: [
    {
      group_id: 1n,
      admin: 'admin1',
      metadata: 'metadata1',
      version: 1n,
      created_at: new Date(),
      address: 'test_policy_address',
      decision_policy: {
        threshold: '5',
      },
    },
  ],
  members: [
    {
      group_id: 1n,
      member: {
        address: 'test_address1',
        weight: '5',
        metadata: 'test_metadata1',
        added_at: new Date(),
      },
    },
    {
      group_id: 1n,
      member: {
        address: 'test_address2',
        weight: '5',
        metadata: 'test_metadata2',
        added_at: new Date(),
      },
    },
  ],
};

export const mockGroup2: ExtendedGroupType = {
  id: 2n,
  admin: 'admin2',
  metadata: 'metadata2',
  version: 1n,
  created_at: new Date(),
  ipfsMetadata: {
    title: 'title2',
    summary: 'summary2',
    details: 'details2',
    authors: 'author2, author3',
    proposalForumURL: 'forum2.com',
    voteOptionContext: 'context2',
  },
  total_weight: '10',
  policies: [
    {
      address: 'test_policy_address2',
      group_id: 2n,
      admin: 'admin2',
      metadata: 'metadata2',
      version: 1n,
      created_at: new Date(),
      decision_policy: {
        threshold: '5',
      },
    },
  ],
  members: [
    {
      group_id: 2n,
      member: {
        address: 'test_address2',
        weight: '5',
        metadata: 'test_metadata2',
        added_at: new Date(),
      },
    },
    {
      group_id: 2n,
      member: {
        address: 'test_address3',
        weight: '5',
        metadata: 'test_metadata3',
        added_at: new Date(),
      },
    },
  ],
};

export const mockDenom = {
  base: 'TTT',
  display: 'TEST',
  denom_units: [
    { denom: 'utest1', exponent: 0, aliases: ['utest1'] },
    { denom: 'test1', exponent: 6, aliases: ['test1'] },
  ],
  symbol: 'TST',
};

export const mockMfxDenom = {
  base: 'umfx',
  display: 'MFX',
  denom_units: [
    { denom: 'umfx', exponent: 0, aliases: ['umfx'] },
    { denom: 'mfx', exponent: 6, aliases: ['mfx'] },
  ],
  symbol: 'umfx',
};

const { send } = cosmos.bank.v1beta1.MessageComposer.withTypeUrl;
const msg = send({
  fromAddress: 'fromaddress123',
  toAddress: 'toaddress321',
  amount: [{ denom: 'ufoof', amount: '42' }],
});
const anyMessage = Any.fromPartial({
  typeUrl: msg.typeUrl,
  value: MsgSend.encode(msg.value).finish(),
});

export const mockProposals: { [key: string]: ProposalSDKType[] } = {
  // The key should match the policy address from `mockGroup`
  test_policy_address: [
    {
      id: 1n,
      title: 'mytitle1',
      group_policy_address: 'policy1',
      summary: 'summary1',
      metadata: 'metadata1',
      proposers: ['proposer1'],
      submit_time: new Date(),
      group_version: 1n,
      group_policy_version: 1n,
      status: ProposalStatus.PROPOSAL_STATUS_SUBMITTED,
      final_tally_result: {
        yes_count: '1',
        abstain_count: '0',
        no_count: '0',
        no_with_veto_count: '0',
      },
      voting_period_end: new Date(),
      executor_result: ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN,
      messages: [{ ...anyMessage, type_url: '/cosmos.bank.v1beta1.MsgSend' }],
    },
    {
      id: 2n,
      title: 'mytitle2',
      group_policy_address: 'policy2',
      summary: 'summary2',
      metadata: 'metadata2',
      proposers: ['proposer2'],
      submit_time: new Date(),
      group_version: 1n,
      group_policy_version: 1n,
      status: ProposalStatus.PROPOSAL_STATUS_ACCEPTED,
      final_tally_result: {
        yes_count: '1',
        abstain_count: '0',
        no_count: '0',
        no_with_veto_count: '0',
      },
      voting_period_end: new Date(),
      executor_result: ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_SUCCESS,
      messages: [{ ...anyMessage, type_url: '/cosmos.bank.v1beta1.MsgSend' }],
    },
  ],
  // The key should match the policy address from `mockGroup2`
  test_policy_address2: [
    {
      id: 3n,
      title: 'title3',
      group_policy_address: 'policy3',
      summary: 'summary3',
      metadata: 'metadata3',
      proposers: ['proposer3'],
      submit_time: new Date(),
      group_version: 1n,
      group_policy_version: 1n,
      status: ProposalStatus.PROPOSAL_STATUS_REJECTED,
      final_tally_result: {
        yes_count: '0',
        abstain_count: '0',
        no_count: '1',
        no_with_veto_count: '0',
      },
      voting_period_end: new Date(),
      executor_result: ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_FAILURE,
      messages: [],
    },
    {
      id: 4n,
      title: 'title4',
      group_policy_address: 'policy4',
      summary: 'summary4',
      metadata: 'metadata4',
      proposers: ['proposer4'],
      submit_time: new Date(),
      group_version: 1n,
      group_policy_version: 1n,
      status: ProposalStatus.PROPOSAL_STATUS_WITHDRAWN,
      final_tally_result: {
        yes_count: '1',
        abstain_count: '0',
        no_count: '0',
        no_with_veto_count: '0',
      },
      voting_period_end: new Date(),
      executor_result: ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN,
      messages: [],
    },
  ],
};

// TODO: Re-use mockDenomMeta1 here
export const mockTokenFormData = {
  name: 'Name Test Token',
  symbol: 'STT',
  display: 'Display Test Token',
  subdenom: 'subtesttoken',
  description: 'This is a test token',
  denomUnits: [
    { denom: 'testtoken', exponent: 0, aliases: [] },
    { denom: 'tt', exponent: 6, aliases: [] },
  ],
  uri: 'www.someuri.com',
  uriHash: 's0m3h4sh',
  exponent: '6',
  label: 'LabelTT',
  base: 'BaseTT',
};

export const mockGroupFormData: FormData = {
  title: 'Test Group',
  authors: 'manifest1author',

  description: 'Detailed description of the test group',

  votingPeriod: { seconds: BigInt(3600), nanos: 0 },
  votingThreshold: '2',
  members: [
    { address: manifestAddr1, name: 'Member 1', weight: '1' },
    { address: manifestAddr2, name: 'Member 2', weight: '2' },
  ],
};
export const mockProposalFormData: ProposalFormData = {
  title: 'Test Proposal',
  proposers: manifestAddr1,
  summary: 'This is a test proposal',
  metadata: {
    title: 'Test Metadata Title',
    authors: 'manifest1author',
    summary: 'This is a test summary',
    details: 'Detailed description of the test proposal',
  },
  messages: [
    {
      type: 'send',
      amount: { denom: 'umfx', amount: '100' },
      to_address: 'manifest1recipient',
      from_address: 'manifest1from',
    },
  ],
};
