import BigNumber from 'bignumber.js';

export const isGreaterThanZero = (val: number | string | undefined) => {
  return new BigNumber(val || 0).gt(0);
};

export const shiftDigits = (
  num: string | number,
  places: number,
  decimalPlaces?: number
): string => {
  if (num === '' || num === null || num === undefined || Number.isNaN(Number(num))) {
    console.warn(`Invalid number passed to shiftDigits: ${num}`);
    return '0';
  }

  try {
    const result = new BigNumber(num)
      .shiftedBy(places)
      .decimalPlaces(decimalPlaces ?? 6, BigNumber.ROUND_DOWN);

    if (result.isNaN()) {
      console.warn(`Calculation resulted in NaN: ${num}, ${places}`);
      return '0';
    }

    return result.toString();
  } catch (error) {
    console.error(`Error in shiftDigits: ${error}`);
    return '0';
  }
};

export const toNumber = (val: string, decimals: number = 6) => {
  return new BigNumber(val).decimalPlaces(decimals).toNumber();
};

export const formatNumber = (num: number) => {
  if (num === 0) return '0';
  if (num < 0.001) return '<0.001';

  const truncate = (number: number, decimalPlaces: number) => {
    const numStr = number.toString();
    const dotIndex = numStr.indexOf('.');
    if (dotIndex === -1) return numStr;
    const endIndex = decimalPlaces > 0 ? dotIndex + decimalPlaces + 1 : dotIndex;
    return numStr.substring(0, endIndex);
  };

  if (num < 1) {
    return truncate(num, 3);
  }
  if (num < 100) {
    return truncate(num, 1);
  }
  if (num < 1000) {
    return truncate(num, 0);
  }
  if (num >= 1000 && num < 1000000) {
    return truncate(num / 1000, 0) + 'K';
  }
  if (num >= 1000000 && num < 1000000000) {
    return truncate(num / 1000000, 0) + 'M';
  }
  if (num >= 1000000000) {
    return truncate(num / 1000000000, 0) + 'B';
  }
};

export function truncateToTwoDecimals(num: number) {
  const multiplier = Math.pow(10, 2);
  return Math.floor(num * multiplier) / multiplier;
}

export const sum = (...args: string[]) => {
  return args.reduce((prev, cur) => prev.plus(cur), new BigNumber(0)).toString();
};

export function abbreviateNumber(value: number): string {
  if (value < 1000) {
    return Number(value.toFixed(1)).toString();
  }

  const suffixes = ['', 'k', 'M', 'B', 'T'];

  const suffixNum = Math.floor(Math.log10(value) / 3);

  let shortValue = value / Math.pow(1000, suffixNum);

  shortValue = Math.round(shortValue * 10) / 10;

  let newValue = shortValue % 1 === 0 ? shortValue.toString() : shortValue.toFixed(1);

  return newValue + suffixes[suffixNum];
}

export const calculateIsUnsafe = (
  newPower: string | number,
  currentPower: string | number,
  totalVP: string | number
): boolean => {
  const newVP = BigInt(Number.isNaN(Number(newPower)) ? 0 : newPower);
  const currentVP = BigInt(Number.isNaN(Number(currentPower)) ? 0 : currentPower);
  const totalVPBigInt = BigInt(Number.isNaN(Number(totalVP)) ? 0 : totalVP);

  if (totalVPBigInt === 0n) {
    return newVP !== currentVP;
  }

  const currentPercentage = (currentVP * 100n) / totalVPBigInt;
  const newPercentage = (newVP * 100n) / totalVPBigInt;

  const changePercentage =
    newPercentage > currentPercentage
      ? newPercentage - currentPercentage
      : currentPercentage - newPercentage;

  return changePercentage > 30n;
};
