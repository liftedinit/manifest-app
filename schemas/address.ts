import { isValidManifestAddress } from '@/utils';
import Yup from '@/utils/yupExtensions';

export const schema = Yup.string()
  .min(8)
  .when('isManifest', {
    is: (value: any) => (value === undefined ? true : value.startsWith('manifest')),
    then: schema =>
      schema.test('valid-manifest-address', 'Invalid manifest address', v =>
        v === undefined ? true : isValidManifestAddress(v)
      ),
    otherwise: schema => schema.manifestAddress(),
  });

export type Address = Yup.InferType<typeof schema>;
