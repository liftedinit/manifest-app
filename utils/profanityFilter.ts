import { Filter } from 'bad-words';

const filter = new Filter();

// Whitelist of acceptable words containing profane substrings
const whitelist = new Set([
  'title',
  'classic',
  'assignment',
  'passion',
  'assistant',
  'association',
  'passage',
  'glass',
  'grass',
  'bass',
  'massive',
  'compass',
  'hassock',
  'dismiss',
  'massage',
  'bassoon',
  'cassette',
  'glasses',
  'astronomy',
  'assign',
  'passable',
  'classroom',
  'cocktail',
  'hancock',
  'hitchcock',
  'blockage',
  'peacock',
  'cockle',
  'whitcock',
  'dickinson',
  'dickens',
  'medick',
  'candice',
  'scunthorpe',
  'turnip',
  'canal',
  'analyze',
  'analog',
  'manuscript',
  'uranus',
  'manipulate',
  'nippon',
  'pencil',
  'essex',
  'sussex',
  'middlesex',
  'therapist',
  'asset',
  'massage',
  'mass',
]);

export const containsProfanity = (text: string) => {
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();

  // Regular expression to match words
  const words = lowerText.match(/\b\w+\b/g) || [];

  // Check each word and its substrings
  for (const word of words) {
    // Skip if the word is in the whitelist
    if (whitelist.has(word)) {
      continue;
    }

    // Check for profane words within the word
    for (const profaneWord of filter.list) {
      const escapedWord = profaneWord.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

      // Create regex to search for the profane word as a substring
      const profanityRegex = new RegExp(escapedWord, 'i');

      // If profane word is found and the word is not whitelisted
      if (profanityRegex.test(word)) {
        return true;
      }
    }
  }

  return false; // No profanity detected
};
