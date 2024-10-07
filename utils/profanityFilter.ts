import { Filter } from 'bad-words';

const filter = new Filter();

export const containsProfanity = (text: string) => {
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();

  // Check if any word from the profanity list is included in the text
  return filter.list.some(word => lowerText.includes(word.toLowerCase()));
};
