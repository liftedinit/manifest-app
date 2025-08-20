import { useChain } from '@cosmos-kit/react';
import { osmosis } from '@manifest-network/manifestjs';
import { DenomUnit } from '@manifest-network/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { useState } from 'react';

import env from '@/config/env';
import { useTx } from '@/hooks/useTx';

/**
 * A custom hook that provides functionality to simulate the creation of a denomination.
 */
export const useSimulateDenomCreation = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const { tx } = useTx(env.chain);
  const { address } = useChain(env.chain);

  const simulateDenomCreation = async (subdenom: string): Promise<boolean> => {
    if (!address) {
      console.error('Simulation failed: No address available');
      return false;
    }

    setIsSimulating(true);
    const { createDenom } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

    const msg = createDenom({
      sender: address,
      subdenom: subdenom,
    });

    try {
      const result = await tx([msg], {
        simulate: true,
        returnError: true,
      });

      if (result === undefined) {
        console.error('Simulation result is undefined');
        return false;
      }

      if ('error' in result) {
        throw result.error;
      }

      return result.success;
    } finally {
      setIsSimulating(false);
    }
  };

  return { simulateDenomCreation, isSimulating };
};
