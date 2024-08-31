export function formatQasset(denom: string): string {
  if (denom.substring(0, 1) == 'Q' || denom.substring(0, 2) == 'AQ') {
    return 'q' + denom.substring(1);
  }
  return denom;
}

export function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + '...';
  } else {
    return str;
  }
}

export const isValidIPFSCID = (cid: string): boolean => {
  const cidV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidV1Regex = /^b[A-Za-z2-7]{58}$/;
  return cidV0Regex.test(cid) || cidV1Regex.test(cid);
};
