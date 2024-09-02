import * as Yup from 'yup';
import { containsProfanity } from '@/utils/profanityFilter';

declare module 'yup' {
  interface StringSchema {
    noProfanity(message?: string): this;
  }
}

Yup.addMethod(Yup.string, 'noProfanity', function (message) {
  return this.test('no-profanity', message, function (value) {
    const { path, createError } = this;
    return (
      !value ||
      !containsProfanity(value) ||
      createError({ path, message: message || 'Profanity is not allowed' })
    );
  });
});
