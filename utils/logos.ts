import { ExtendedValidatorSDKType } from "@/components";

type ImageSource = {
  imageSource: 'cosmostation' | 'keybase';
};

export const splitIntoChunks = (
  arr: any[],
  chunkSize: number,
) => {
  const res = [];
  for (
    let i = 0;
    i < arr.length;
    i += chunkSize
  ) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};

export const convertChainName = (
  chainName: string,
) => {
  if (chainName.endsWith('testnet')) {
    return chainName.replace(
      'testnet',
      '-testnet',
    );
  }

  switch (chainName) {
    case 'cosmoshub':
      return 'cosmos';
    case 'assetmantle':
      return 'asset-mantle';
    case 'cryptoorgchain':
      return 'crypto-org';
    case 'dig':
      return 'dig-chain';
    case 'gravitybridge':
      return 'gravity-bridge';
    case 'kichain':
      return 'ki-chain';
    case 'oraichain':
      return 'orai-chain';
    case 'terra':
      return 'terra-classic';
    default:
      return chainName;
  }
};

export const isUrlValid = async (url: string) => {
  const res = await fetch(url, {
    method: 'HEAD',
  });
  const contentType =
    res?.headers?.get('Content-Type') || '';
  return contentType.startsWith('image');
};

export const getCosmostationUrl = (
  chainName: string,
  validatorAddr: string,
) => {
  const env = process.env.NEXT_PUBLIC_CHAIN_ENV;
  const convertedChainName = convertChainName(chainName);
  const dynamicChainName = env === 'testnet' ? `${convertedChainName}-testnet` : convertedChainName;
  return `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${dynamicChainName}/moniker/${validatorAddr}.png`;
};

export const getKeybaseUrl = (
  identity: string,
) => {
  return `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`;
};

export const addLogoUrlSource = async (
  validator: ExtendedValidatorSDKType,
  chainName: string,
): Promise<ExtendedValidatorSDKType & ImageSource> => {
  const url = getCosmostationUrl(
    chainName,
    validator.operator_address,
  );
  const isValid = await isUrlValid(url);
  return {
    ...validator,
    imageSource: isValid
      ? 'cosmostation'
      : 'keybase',
  };
};




export const getLogoUrlForValidator = async (
  validator: ExtendedValidatorSDKType,
): Promise<{ url: string }> => {
  if (!validator.description?.identity) {
    return {  url: '' };
  }

  try {
    const response = await fetch(getKeybaseUrl(validator.description.identity));
    const res = await response.json();
    const url = res.them?.[0]?.pictures?.primary.url || '';
    return { url };
  } catch (error) {
    console.error('Failed to fetch Keybase URL:', error);
    return { url: '' };
  }
};

export const getLogoUrls = async (
  validator: ExtendedValidatorSDKType,
): Promise<string> => {
  const logoInfo = await getLogoUrlForValidator(validator);
  return logoInfo.url;
};