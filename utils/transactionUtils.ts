import { useState } from 'react';
import { useTx } from '@/hooks/useTx';
import { osmosis } from '@chalabi/manifestjs';
import { useChain } from '@cosmos-kit/react';
import { DenomUnit } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';

export const useSimulateDenomCreation = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const { tx } = useTx('manifest');
  const { address } = useChain('manifest');

  const simulateDenomCreation = async (subdenom: string): Promise<boolean> => {
    if (!address) {
      console.log('Simulation failed: No address available');
      return false;
    }

    setIsSimulating(true);
    const { createDenom } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

    const msg = createDenom({
      sender: address,
      subdenom: subdenom,
    });

    try {
      console.log(`Simulating denom creation for subdenom: ${subdenom}`);
      const result = await tx([msg], { simulate: true, returnError: true });

      if (result === undefined) {
        console.log('Simulation result is undefined');
        return false;
      }

      if ('error' in result) {
        console.error('Simulation error:', result.error);
        return false;
      }

      console.log('Simulation successful');
      return true;
    } catch (error) {
      console.error('Unexpected error during simulation:', error);
      return false;
    } finally {
      setIsSimulating(false);
    }
  };

  return { simulateDenomCreation, isSimulating };
};

export const useSimulateDenomMetadata = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const { tx } = useTx('manifest');
  const { address } = useChain('manifest');

  const simulateDenomCreation = async (
    subdenom: string,
    fullDenom: string,
    description: string,
    denomUnits: DenomUnit[],
    display: string,
    symbol: string,
    uri: string
  ): Promise<boolean> => {
    if (!address) {
      console.log('Simulation failed: No address available');
      return false;
    }

    setIsSimulating(true);
    const { setDenomMetadata } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

    const msg = setDenomMetadata({
      sender: address,
      metadata: {
        description: description,
        denomUnits: denomUnits,
        base: fullDenom,
        display: display,
        name: display,
        symbol: symbol,
        uri: uri ?? '',
        uriHash: '',
      },
    });

    try {
      console.log(`Simulating metadata creation for subdenom: ${subdenom}`);
      const result = await tx([msg], { simulate: true, returnError: true });

      if (result === undefined) {
        console.log('Simulation result is undefined');
        return false;
      }

      if ('error' in result) {
        console.error('Simulation error:', result.error);
        return false;
      }

      console.log('Simulation successful');
      return true;
    } catch (error) {
      console.error('Unexpected error during simulation:', error);
      return false;
    } finally {
      setIsSimulating(false);
    }
  };

  return { simulateDenomCreation, isSimulating };
};
