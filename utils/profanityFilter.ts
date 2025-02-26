import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

const filter = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export const containsProfanity = (text: string) => filter.hasMatch(text);
