import { bech32 } from '@scure/base';
import * as Yup from 'yup';

// Updated import
import { supportedDomains, supportedPatterns } from '@/components/factory/components/DenomImage';
import { containsProfanity } from '@/utils/profanityFilter';

declare module 'yup' {
  interface StringSchema {
    noProfanity(message?: string): this;
    manifestAddress(message?: string): this;
    simulateDenomCreation(simulateFn: () => Promise<boolean>, message?: string): this;
    simulateDenomMetadata(simulateFn: () => Promise<boolean>, message?: string): this;
    supportedImageUrl(message?: string): this;
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

    try {
      if (!value.includes('1')) {
        throw new Error('Invalid bech32 address format');
      }
      const decoded = bech32.decode(value as `${string}1${string}`);

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
    } catch (error) {
      return createError({
        path,
        message: message || 'Please enter a valid Bech32 address',
      });
    }
  });
});

Yup.addMethod<Yup.StringSchema>(Yup.string, 'supportedImageUrl', function (message) {
  return this.test('supported-image-url', message, function (value) {
    const { path, createError } = this;
    if (!value) return true;

    try {
      const { hostname } = new URL(value);
      const isSupported =
        supportedDomains.includes(hostname) ||
        supportedPatterns.some(pattern => pattern.test(value));

      return (
        isSupported ||
        createError({
          path,
          message:
            message || `URL domain is not supported. Please use one of the supported domains`,
        })
      );
    } catch {
      return createError({
        path,
        message: message || 'Invalid URL format',
      });
    }
  });
});

export default Yup;
