import { CombinedBalanceInfo, MFX_TOKEN_BASE, isValidManifestAddress } from '@/utils';
import Yup from '@/utils/yupExtensions';

export const schema = Yup.object().shape({
  recipient: Yup.string()
    .required('Recipient is required')
    .manifestAddress()
    .test('recipient-has-prefix', 'Recipient prefix must match recipient chain', function (value) {
      if (!value) return true;
      return value.startsWith('manifest');
    }),
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .test('sufficient-balance', 'Amount exceeds balance', function (value) {
      const { selectedToken } = this.parent;
      if (!selectedToken || !value) return true;

      const exponent = selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
      const balance = parseFloat(selectedToken.amount) / Math.pow(10, exponent);

      return value <= balance;
    }),

  // TODO: Use the proper type (CombinedBalanceInfo) for selectedToken.
  selectedToken: Yup.mixed<any>().nullable().required('Please select a token'),
  memo: Yup.string().max(255, 'Memo must be less than 255 characters'),
  feeWarning: Yup.mixed()
    .nullable()
    .test('leave-for-fees', 'Please confirm you understand the fee', function () {
      const { amount, selectedToken } = this.parent;
      if (!selectedToken || !amount || selectedToken.denom !== MFX_TOKEN_BASE) {
        return true;
      }

      const exponent = selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
      const balance = parseFloat(selectedToken.amount) / Math.pow(10, exponent);

      const MIN_FEE_BUFFER = 0.09;
      const hasInsufficientBuffer = amount > balance - MIN_FEE_BUFFER;

      return !hasInsufficientBuffer;
    }),
});

export type SendForm = Yup.InferType<typeof schema>;
