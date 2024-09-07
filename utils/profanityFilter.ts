import { Filter } from 'bad-words';

const filter = new Filter();
export const containsProfanity = (text: string) => {
  return filter.isProfane(text);
};
