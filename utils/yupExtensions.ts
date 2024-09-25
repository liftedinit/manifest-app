import * as Yup from 'yup';
import { containsProfanity } from '@/utils/profanityFilter';
import { bech32 } from '@scure/base'; // Updated import

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
    if (!value) return true;

    try {
      const decoded = bech32.decode(value);

      const validPrefixes = ['manifest', 'manifestvaloper', 'manifestvalcons'];
      if (!validPrefixes.includes(decoded.prefix)) {
        return createError({
          path,
          message: message || `Invalid address prefix; expected one of ${validPrefixes.join(', ')}`,
        });
      }

      const minLength = 32;
      const maxLength = 64;

      if (decoded.words.length < minLength || decoded.words.length > maxLength) {
        return createError({
          path,
          message: message || 'Invalid address length',
        });
      }

      return true;
    } catch (error) {
      return createError({
        path,
        message: message || 'Please enter a valid Bech32 address',
      });
    }
  });
});

export default Yup;
