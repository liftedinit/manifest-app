import { DurationSDKType } from '@manifest-network/manifestjs/dist/codegen/google/protobuf/duration';
import * as Yup from 'yup';

const SECONDS_IN_A_MINUTE: bigint = 60n;
const SECONDS_IN_AN_HOUR: bigint = 3600n;
const SECONDS_IN_A_DAY: bigint = 86400n;

/**
 * Converts a duration from the Cosmos SDK type to the Duration type used in the App.
 * @param duration The duration to convert, either a structure with a seconds field, or
 *                 a string with an `s` suffix (@see DurationSDKType (JSON Mapping)).
 */
export function fromSdk(duration: DurationSDKType | string): Duration {
  let seconds: bigint;
  // Parse the number of seconds. The documentation of the SDKType explicitly says that
  // in the case of JSON encoding this will be a string with an `s` suffix. We take
  // that and convert it to a number.
  if (typeof duration === 'string') {
    if (!duration.endsWith('s')) {
      throw new Error('Invalid duration string');
    }
    seconds = BigInt(parseInt(duration.slice(0, -1), 10));
  } else {
    seconds = duration.seconds;
  }

  return {
    days: Number(seconds / SECONDS_IN_A_DAY) || 0,
    hours: Number((seconds % SECONDS_IN_A_DAY) / SECONDS_IN_AN_HOUR) || 0,
    minutes: Number((seconds % SECONDS_IN_AN_HOUR) / SECONDS_IN_A_MINUTE) || 0,
    seconds: Number(seconds % SECONDS_IN_A_MINUTE) || 0,
  };
}

/**
 * Converts a number of seconds to a duration.
 * @param seconds
 */
export function fromSeconds(seconds: number | bigint): Duration {
  seconds = BigInt(seconds);
  return {
    days: Number(seconds / SECONDS_IN_A_DAY) || 0,
    hours: Number((seconds % SECONDS_IN_A_DAY) / SECONDS_IN_AN_HOUR) || 0,
    minutes: Number((seconds % SECONDS_IN_AN_HOUR) / SECONDS_IN_A_MINUTE) || 0,
    seconds: Number(seconds % SECONDS_IN_A_MINUTE) || 0,
  };
}

/**
 * Converts a duration to the Cosmos SDK type.
 * @param value The duration to convert.
 */
export function toSdk(value: Duration): DurationSDKType {
  return {
    seconds:
      BigInt(value.days ?? 0) * SECONDS_IN_A_DAY +
      BigInt(value.hours ?? 0) * SECONDS_IN_AN_HOUR +
      BigInt(value.minutes ?? 0) * SECONDS_IN_A_MINUTE +
      BigInt(value.seconds ?? 0),
    nanos: 0,
  };
}

/**
 * Converts a duration to a number of seconds.
 * @param value The duration to convert.
 */
export function toSeconds(value: Duration): number {
  return Number(toSdk(value).seconds);
}

/**
 * Compares two durations, returning a negative number if a < b, a positive number if a > b,
 * and 0 if a == b.
 * @param a
 * @param b
 */
export function compare(a: Duration, b: Duration): number {
  return toSeconds(a) - toSeconds(b);
}

/**
 * Validation schema for a duration.
 */
export const schema = Yup.object().shape({
  days: Yup.number().integer().min(0).required(),
  hours: Yup.number().integer().min(0).max(24).required(),
  minutes: Yup.number().integer().min(0).max(60).required(),
  seconds: Yup.number().integer().min(0).max(60).required(),
});

/**
 * Schema type for a duration.
 */
export type Duration = Yup.InferType<typeof schema>;
