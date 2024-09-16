export function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + '...' + str.slice(-6);
  } else {
    return str;
  }
}

export const isValidAddress = (address: string, prefix?: string): boolean => {
  const actualPrefix = prefix || 'manifest';
  return address.startsWith(actualPrefix) && address.length === actualPrefix.length + 39;
};

export const isValidIPFSCID = (cid: string): boolean => {
  const cidV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidV1Regex = /^b[A-Za-z2-7]{58}$/;
  return cidV0Regex.test(cid) || cidV1Regex.test(cid);
};
