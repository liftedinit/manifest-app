import * as Yup from 'yup';
import { containsProfanity } from '@/utils/profanityFilter';

declare module 'yup' {
  interface StringSchema {
    noProfanity(message?: string): this;
    manifestAddress(message?: string): this;
  }
}

Yup.addMethod<Yup.StringSchema>(Yup.string, 'noProfanity', function (message) {
  return this.test('no-profanity', message, function (value) {
    const { path, createError } = this;
    return (
      !value ||
      !containsProfanity(value) ||
      createError({ path, message: message || 'Profanity is not allowed' })
    );
  });
});

Yup.addMethod<Yup.StringSchema>(Yup.string, 'manifestAddress', function (message) {
  return this.test('manifest-address', message, function (value) {
    const { path, createError } = this;
    return (
      !value ||
      /^manifest1[a-zA-Z0-9]{37,}$/.test(value) ||
      createError({
        path,
        message: message || 'Please enter a valid manifest address',
      })
    );
  });
});

export default Yup;
