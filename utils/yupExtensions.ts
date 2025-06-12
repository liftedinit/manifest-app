import { bech32 } from '@scure/base';
import * as Yup from 'yup';

import { containsProfanity } from '@/utils/profanityFilter';

declare module 'yup' {
  interface StringSchema {
    noProfanity(message?: string): this;
    manifestAddress(message?: string): this;
    simulateDenomCreation(simulateFn: () => Promise<boolean>, message?: string): this;
    simulateDenomMetadata(simulateFn: () => Promise<boolean>, message?: string): this;
  }

  interface ArraySchema<TIn extends any[] | null | undefined, TContext> {
    unique(message?: string): this;
  }
}

Yup.addMethod<Yup.StringSchema>(
  Yup.string,
  'simulateDenomCreation',
  function (simulateFn, message) {
    return this.test('simulate-denom-creation', message, async function (value) {
      const { path, createError } = this;
      if (!value) return true;

      try {
        const isValid = await simulateFn();
        if (!isValid) {
          return createError({
            path,
            message: message || 'This denom cannot be created',
          });
        }
        return true;
      } catch (error) {
        return createError({
          path,
          message: message || 'Error during denom creation simulation',
        });
      }
    });
  }
);

Yup.addMethod<Yup.StringSchema>(
  Yup.string,
  'simulateDenomMetadata',
  function (simulateFn, message) {
    return this.test('simulate-denom-metadata', message, async function (value) {
      const { path, createError } = this;
      if (!value) return true;

      try {
        const isValid = await simulateFn();
        if (!isValid) {
          return createError({
            path,
            message: message || 'This denom cannot be created',
          });
        }
        return true;
      } catch (error) {
        return createError({
          path,
          message: message || 'Error during denom creation simulation',
        });
      }
    });
  }
);

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

    if (!value.includes('1')) {
      return createError({
        path,
        message: message || `Invalid bech32 address format`,
      });
    }
    let decoded;
    try {
      decoded = bech32.decode(value as `${string}1${string}`);
    } catch (_) {
      return createError({
        path,
        message: message || 'Please enter a valid Bech32 address',
      });
    }

    const validPrefixes = ['manifest', 'manifestvaloper', 'manifestvalcons', 'osmo', 'axelar'];
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
  });
});

Yup.addMethod<Yup.ArraySchema<Yup.AnySchema[] | undefined, any>>(
  Yup.array,
  'unique',
  function (this: Yup.ArraySchema<Yup.AnySchema[] | undefined, any>, message) {
    return this.test('array-unique-items', message, function (array) {
      if (!array) {
        return true;
      }

      const uniqueData = Array.from(new Set(array));
      const isUnique = array.length === uniqueData.length;
      if (isUnique) {
        return true;
      }

      const index = array.findIndex((item, i) => item !== uniqueData[i]);
      if (index === -1) {
        return true;
      }

      return this.createError({
        path: `${this.path}[${index}]`,
        message: message || `${this.path}[${index}] must be unique`,
      });
    });
  }
);

export default Yup;
