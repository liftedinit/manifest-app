import { truncateString } from '@/utils';
import { ThresholdDecisionPolicy } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { PercentageDecisionPolicy } from 'cosmjs-types/cosmos/group/v1/types';

export function getGroupTitle(metadata: string): string | undefined {
  let title = '';

  try {
    const parsed = JSON.parse(metadata);
    title = parsed.title || title;
  } catch (e) {}

  if (title === '') {
    return undefined;
  }

  return truncateString(title, 24);
}

export function getGroupPolicy(policyType: string): string {
  switch (policyType) {
    case ThresholdDecisionPolicy.typeUrl:
      return 'threshold';
    case PercentageDecisionPolicy.typeUrl:
      return 'percentage';
    default:
      return 'unknown';
  }
}
