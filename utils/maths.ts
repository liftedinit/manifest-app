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

export const parseNumberToBigInt = (v: string, maxDigits: number = 6) => {
  const amount = new BigNumber(v);
  if (!amount.isFinite()) {
    console.error(`Invalid input passed to parseNumberToBigInt: ${v}`);
    return BigInt(0);
  }
  const precision = new BigNumber(10).pow(maxDigits);
  const b = amount.times(precision).toFixed();
  console.log('amount', amount);
  console.log('precision', precision);
  console.log('BBBBBBBBBBBBBBB', b);
  return BigInt(b);
};

export const toNumber = (val: string, decimals: number = 6) => {
  return new BigNumber(val).decimalPlaces(decimals).toNumber();
};

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
