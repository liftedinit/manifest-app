import { EncodeObject } from '@cosmjs/proto-signing';
import { GasPrice, calculateFee } from '@cosmjs/stargate';
import { useChain } from '@cosmos-kit/react';
import { useToast } from '@/contexts/toastContext';

export const useFeeEstimation = (chainName: string) => {
  const { getSigningStargateClient, chain } = useChain(chainName);
  const { setToastMessage } = useToast();

  const gasPrice = chain.fees?.fee_tokens[0].average_gas_price || 0.025;

  const estimateFee = async (
    address: string,
    messages: EncodeObject[],
    modifier?: number,
    memo?: string
  ) => {
    try {
      const stargateClient = await getSigningStargateClient();
      if (!stargateClient) {
        setToastMessage({
          type: 'alert-error',
          title: 'Fee Estimation Error',
          description: 'Unable to connect to the network. Please try again.',
          bgColor: '#e74c3c',
        });
        return null;
      }

      // Check if account exists before simulation
      try {
        const account = await stargateClient.getAccount(address);
        if (!account) {
          setToastMessage({
            type: 'alert-error',
            title: 'Account Error',
            description: `Account ${address} does not exist on chain. Please ensure you have funds in your wallet.`,
            bgColor: '#e74c3c',
          });
          return null;
        }
      } catch (accountError) {
        setToastMessage({
          type: 'alert-error',
          title: 'Account Error',
          description: `Account ${address} does not exist on chain. Please ensure you have funds in your wallet.`,
          bgColor: '#e74c3c',
        });
        return null;
      }

      const gasEstimation = await stargateClient.simulate(address, messages, memo);
      if (!gasEstimation) {
        setToastMessage({
          type: 'alert-error',
          title: 'Fee Estimation Error',
          description: 'Failed to estimate transaction fees. Please try again.',
          bgColor: '#e74c3c',
        });
        return null;
      }

      // Ensure we have a valid gas price
      if (!gasPrice) {
        setToastMessage({
          type: 'alert-error',
          title: 'Configuration Error',
          description: 'Gas price configuration is missing. Please try again later.',
          bgColor: '#e74c3c',
        });
        return null;
      }

      return calculateFee(
        Math.round(gasEstimation * (modifier || 1.5)),
        GasPrice.fromString(`${gasPrice}umfx`)
      );
    } catch (error: any) {
      setToastMessage({
        type: 'alert-error',
        title: 'Fee Estimation Error',
        description: error.message || 'Failed to estimate transaction fees. Please try again.',
        bgColor: '#e74c3c',
      });
      return null;
    }
  };

  return { estimateFee };
};
