import { truncateString } from '@/utils';

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
