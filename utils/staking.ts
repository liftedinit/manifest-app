import { Coin, decodeCosmosSdkDecFromProto } from '@cosmjs/stargate';
import { QueryDelegationTotalRewardsResponse } from '@liftedinit/manifestjs/dist/codegen/cosmos/distribution/v1beta1/query';
import { QueryAnnualProvisionsResponse } from '@liftedinit/manifestjs/dist/codegen/cosmos/mint/v1beta1/query';
import {
  QueryDelegatorDelegationsResponse,
  QueryParamsResponse,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/staking/v1beta1/query';
import { Pool } from '@liftedinit/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking';
import { Validator } from '@liftedinit/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking';
import { bech32 } from 'bech32';
import BigNumber from 'bignumber.js';
import * as CryptoJS from 'crypto-js';

import { decodeUint8Arr, isGreaterThanZero, shiftDigits, toNumber } from '.';

const DAY_TO_SECONDS = 24 * 60 * 60;
const ZERO = '0';

export const calcStakingApr = ({
  pool,
  commission,
  communityTax,
  annualProvisions,
}: ChainMetaData & { commission: string }) => {
  const totalSupply = new BigNumber(pool?.bondedTokens || 0).plus(pool?.notBondedTokens || 0);

  const bondedTokensRatio = new BigNumber(pool?.bondedTokens || 0).div(totalSupply);

  const inflation = new BigNumber(annualProvisions || 0).div(totalSupply);

  const one = new BigNumber(1);

  return inflation
    .multipliedBy(one.minus(communityTax || 0))
    .div(bondedTokensRatio)
    .multipliedBy(one.minus(commission))
    .shiftedBy(2)
    .decimalPlaces(2, BigNumber.ROUND_DOWN)
    .toString();
};

export type ParsedValidator = ReturnType<typeof parseValidators>[0];

function extractValconsPrefix(operatorAddress: string): string {
  const prefixEndIndex = operatorAddress.indexOf('valoper');
  const chainPrefix = operatorAddress.substring(0, prefixEndIndex);
  return `${chainPrefix}valcons`;
}

export const parseValidators = (validators: Validator[]) => {
  return validators.map(validator => {
    const commissionRate = validator.commission?.commissionRates?.rate || ZERO;
    const commissionPercentage = parseFloat(commissionRate) * 100;

    //TODO: Add valconsAddress to query missed blocks
    const valconsPrefix = extractValconsPrefix(validator.operatorAddress);
    const valconsAddress = getValconsAddress(validator.consensusPubkey, valconsPrefix);

    return {
      consensusPubkey: validator.consensusPubkey || '',
      valconsAddress,
      description: validator.description?.details || '',
      name: validator.description?.moniker || '',
      identity: validator.description?.identity || '',
      address: validator.operatorAddress || '',
      commission: commissionPercentage.toFixed(2) + '%',
      votingPower: toNumber(shiftDigits(validator.tokens, -6, 0), 0),
    };
  });
};

function getValconsAddress(consensusPubkey: any, valconsPrefix: string) {
  if (!consensusPubkey || typeof consensusPubkey.key !== 'string') {
    console.error('Invalid or missing consensus public key');
    return '';
  }

  try {
    // Decode the Base64 key directly to bytes
    const decoded = Buffer.from(consensusPubkey.key, 'base64');

    // Convert bytes to Bech32 words
    const valconsWords = bech32.toWords(new Uint8Array(decoded));

    // Encode to Bech32 with the given prefix
    const valconsAddress = bech32.encode(valconsPrefix, valconsWords);

    return valconsAddress;
  } catch (error) {
    console.error('Error in generating valcons address:', error);
    return '';
  }
}

export type ExtendedValidator = ReturnType<typeof extendValidators>[0];

export type ChainMetaData = {
  annualProvisions: string;
  communityTax: string;
  pool: Pool;
};

export const extendValidators = (
  validators: ParsedValidator[] = [],
  chainMetadata: ChainMetaData
) => {
  const { annualProvisions, communityTax, pool } = chainMetadata;

  return validators.map(validator => {
    const apr = annualProvisions
      ? calcStakingApr({
          annualProvisions,
          //@ts-ignore
          commission: validator.commission,
          communityTax,
          pool,
        })
      : null;

    return {
      ...validator,
    };
  });
};

const findAndDecodeReward = (coins: Coin[], denom: string, exponent: number) => {
  const amount = coins.find(coin => coin.denom === denom)?.amount || ZERO;
  const decodedAmount = decodeCosmosSdkDecFromProto(amount).toString();
  return shiftDigits(decodedAmount, exponent);
};

export type ParsedRewards = ReturnType<typeof parseRewards>;

export const parseRewards = (
  { rewards, total }: QueryDelegationTotalRewardsResponse,
  denom: string,
  exponent: number
) => {
  const totalReward = findAndDecodeReward(total, denom, exponent);

  const rewardsParsed = rewards.map(({ reward, validatorAddress }) => ({
    validatorAddress,
    amount: findAndDecodeReward(reward, denom, exponent),
  }));

  return {
    byValidators: rewardsParsed,
    total: totalReward,
  };
};

export type ParsedDelegations = ReturnType<typeof parseDelegations>;

export const parseDelegations = (
  delegations: QueryDelegatorDelegationsResponse['delegationResponses'],
  exponent: number
) => {
  return delegations.map(({ balance, delegation }) => ({
    validatorAddress: delegation?.validatorAddress || '',
    amount: shiftDigits(balance?.amount || ZERO, exponent),
  }));
};

export const calcTotalDelegation = (delegations: ParsedDelegations) => {
  if (!delegations) {
    console.error('Delegations are undefined:', delegations);
    return '0'; // Handle this case accordingly
  }

  return delegations.reduce((prev, cur) => prev.plus(cur.amount), new BigNumber(0)).toString();
};
export const parseUnbondingDays = (params: QueryParamsResponse['params']) => {
  return new BigNumber(Number(params?.unbondingTime?.seconds || 0))
    .div(DAY_TO_SECONDS)
    .decimalPlaces(0)
    .toString();
};

export const parseAnnualProvisions = (data: QueryAnnualProvisionsResponse) => {
  const res = shiftDigits(decodeUint8Arr(data?.annualProvisions), -18);
  return isGreaterThanZero(res) ? res : null;
};

function wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray) {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const u8 = new Uint8Array(sigBytes);

  for (let i = 0; i < sigBytes; i++) {
    const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    u8[i] = byte;
  }

  return u8;
}
