import { ExtendedValidatorSDKType } from '@/components';

export const getRealLogo = (logo: string) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const localAndHasExtension = /^\/(?!.*\.[0-9a-z]+$)/i.test(logo);
  return localAndHasExtension
    ? isDarkMode
      ? logo?.toString() + '_light.svg'
      : logo?.toString() + '_dark.svg'
    : logo;
};
export const getKeybaseUrl = (identity: string) => {
  return `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`;
};
export const getLogoUrlForValidator = async (
  validator: ExtendedValidatorSDKType
): Promise<{ url: string }> => {
  if (!validator.description?.identity) {
    return { url: '' };
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

export const getLogoUrls = async (validator: ExtendedValidatorSDKType): Promise<string> => {
  const logoInfo = await getLogoUrlForValidator(validator);
  return logoInfo.url;
};
