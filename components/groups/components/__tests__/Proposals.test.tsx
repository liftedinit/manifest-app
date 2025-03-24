import { TallyResultSDKType } from '@liftedinit/manifestjs/src/codegen/cosmos/gov/v1/gov';
import { describe, expect, test } from 'bun:test';

import { humanReadableDuration, isProposalPassing } from '@/components';

describe('isProposalPassing', () => {
  test('works with a passing vote', () => {
    const tally: TallyResultSDKType = {
      yes_count: '10',
      no_count: '5',
      abstain_count: '2',
      no_with_veto_count: '1',
    };

    const policyThreshold = 10;

    const results = isProposalPassing(tally, policyThreshold);
    expect(results.isPassing).toBe(true);
    expect(results.yesCount).toBe(10n);
    expect(results.noCount).toBe(5n);
    expect(results.noWithVetoCount).toBe(1n);
    expect(results.abstainCount).toBe(2n);
    expect(results.isThresholdReached).toBe(true);
    expect(results.isTie).toBe(false);
  });

  test('works without any tally', () => {
    const policyThreshold = 10;
    const results = isProposalPassing(undefined, policyThreshold);

    expect(results.isPassing).toBe(false);
    expect(results.yesCount).toBe(0n);
    expect(results.noCount).toBe(0n);
    expect(results.noWithVetoCount).toBe(0n);
    expect(results.abstainCount).toBe(0n);
    expect(results.isThresholdReached).toBe(false);
    expect(results.isTie).toBe(false);
  });

  test('works without reaching threshold', () => {
    const tally: TallyResultSDKType = {
      yes_count: '10',
      no_count: '5',
      abstain_count: '2',
      no_with_veto_count: '1',
    };

    const policyThreshold = 20;

    const results = isProposalPassing(tally, policyThreshold);
    expect(results.isPassing).toBe(false);
    expect(results.yesCount).toBe(10n);
    expect(results.noCount).toBe(5n);
    expect(results.noWithVetoCount).toBe(1n);
    expect(results.abstainCount).toBe(2n);
    expect(results.isThresholdReached).toBe(false);
    expect(results.isTie).toBe(false);
  });

  test('works with a NO vote', () => {
    const tally: TallyResultSDKType = {
      yes_count: '5',
      no_count: '10',
      abstain_count: '2',
      no_with_veto_count: '1',
    };

    const policyThreshold = 10;

    const results = isProposalPassing(tally, policyThreshold);
    expect(results.isPassing).toBe(false);
    expect(results.yesCount).toBe(5n);
    expect(results.noCount).toBe(10n);
    expect(results.noWithVetoCount).toBe(1n);
    expect(results.abstainCount).toBe(2n);
    expect(results.isThresholdReached).toBe(true);
    expect(results.isTie).toBe(false);
  });

  test('works with a tie', () => {
    const tally: TallyResultSDKType = {
      yes_count: '5',
      no_count: '4',
      abstain_count: '2',
      no_with_veto_count: '1',
    };

    const policyThreshold = 10;

    const results = isProposalPassing(tally, policyThreshold);
    expect(results.isPassing).toBe(false);
    expect(results.yesCount).toBe(5n);
    expect(results.noCount).toBe(4n);
    expect(results.noWithVetoCount).toBe(1n);
    expect(results.abstainCount).toBe(2n);
    expect(results.isThresholdReached).toBe(true);
    expect(results.isTie).toBe(true);
  });
});

describe('humanReadableDuration', () => {
  test('handles duration less than a minute', () => {
    expect(humanReadableDuration(45)).toBe('less than a minute');
    expect(humanReadableDuration(1)).toBe('less than a minute');
  });

  test('handles minutes', () => {
    expect(humanReadableDuration(60)).toBe('1 minute');
    expect(humanReadableDuration(160)).toBe('2 minutes');
    expect(humanReadableDuration(239)).toBe('3 minutes');
  });

  test('handles hours', () => {
    expect(humanReadableDuration(3661)).toBe('1 hour');
    expect(humanReadableDuration(3600)).toBe('1 hour');
    expect(humanReadableDuration(3600 * 2 + 1000)).toBe('2 hours');
    expect(humanReadableDuration(3600 * 2 + 3599)).toBe('2 hours');
  });

  test('handles large durations', () => {
    expect(humanReadableDuration(90061)).toBe('1 day');
    expect(humanReadableDuration(10090061)).toBe('116 days');
  });

  test('handles done', () => {
    const result = humanReadableDuration(0); // 0 seconds
    expect(result).toBe('none');
  });
});
