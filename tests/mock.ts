import {Chain} from "@chain-registry/types";
import {BondStatus} from "@chalabi/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking";
import {ExtendedValidatorSDKType} from "@/components";
import {CombinedBalanceInfo} from "@/pages/bank";

export const mockActiveValidators: ExtendedValidatorSDKType[] = [
  {
    operator_address: "validator1",
    description: { moniker: "Validator One", identity: "identity1", details: "details1", website: "website1.com", security_contact: "security1" },
    consensus_power: BigInt(1000),
    logo_url: "",
    jailed: false,
    status: BondStatus.BOND_STATUS_BONDED,
    tokens: "1000upoa",
    delegator_shares: "1000",
    min_self_delegation: "1",
    unbonding_height: 0n,
    unbonding_time: new Date(),
    commission: {
      commission_rates: {
        rate: "0.1",
        max_rate: "0.2",
        max_change_rate: "0.01",
      },
      update_time: new Date(),
    },
    unbonding_on_hold_ref_count: 0n,
    unbonding_ids: [],
  },
  {
    operator_address: "validator2",
    description: { moniker: "Validator Two", identity: "identity2", details: "details2", website: "website2.com", security_contact: "security2" },
    consensus_power: BigInt(2000),
    logo_url: "",
    jailed: false,
    status: BondStatus.BOND_STATUS_BONDED,
    tokens: "2000upoa",
    delegator_shares: "2000",
    min_self_delegation: "1",
    unbonding_height: 0n,
    unbonding_time: new Date(),
    commission: {
      commission_rates: {
        rate: "0.1",
        max_rate: "0.2",
        max_change_rate: "0.01",
      },
      update_time: new Date(),
    },
    unbonding_on_hold_ref_count: 0n,
    unbonding_ids: [],
  },
];

export const mockPendingValidators: ExtendedValidatorSDKType[] = [
  {
    operator_address: "validator3",
    description: { moniker: "Validator Three", identity: "identity2", details: "details2", website: "website2.com", security_contact: "security2" },
    consensus_power: BigInt(3000),
    logo_url: "",
    jailed: false,
    status: BondStatus.BOND_STATUS_UNBONDED,
    tokens: "3000upoa",
    delegator_shares: "3000",
    min_self_delegation: "1",
    unbonding_height: 0n,
    unbonding_time: new Date(),
    commission: {
      commission_rates: {
        rate: "0.1",
        max_rate: "0.2",
        max_change_rate: "0.01",
      },
      update_time: new Date(),
    },
    unbonding_on_hold_ref_count: 0n,
    unbonding_ids: [],
  },
];

export const defaultAssetLists = [
  {
    chain_name: "manifest",
    assets: [
      {
        name: "Manifest Network Token",
        display: "umfx",
        base: "umfx",
        symbol: "umfx",
        denom_units: [
          { denom: "umfx", exponent: 0, aliases: ["umfx"] },
        ]
      }
    ],
  },
];

export const defaultChain: Chain = {
  chain_name: "manifest",
  chain_id: "manifest-1",
  status: "live",
  network_type: "testnet",
  pretty_name: "Manifest Network",
  bech32_prefix: "manifest",
  slip44: 118,
  fees: {
    fee_tokens: [
      {
        denom: "umfx",
        fixed_min_gas_price: 0.001,
        low_gas_price: 0.001,
        average_gas_price: 0.001,
        high_gas_price: 0.001,
      },
    ],
  },
}

export const mockBalances: CombinedBalanceInfo[] = [
  {
    denom: "token1",
    coreDenom: "utoken1",
    amount: "1000",
    metadata: {
      description: "My First Token",
      name: "Token 1",
      symbol: "TK1",
      uri: "",
      uri_hash: "",
      display: "Token 1",
      base: "token1",
      denom_units: [
        { denom: "utoken1", exponent: 0, aliases: ["utoken1"] },
        { denom: "token1", exponent: 6, aliases: ["token1"] },
      ],
    },
  },
];

