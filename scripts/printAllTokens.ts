// This script prints all the tokens in the manifest testnet chain in a format to be used in the chain-registry

import { cosmos } from '@liftedinit/manifestjs';
import * as fs from 'fs';
import * as path from 'path';

// Environment Configuration
const env = {
  rpcUrl: 'https://nodes.liftedinit.tech/manifest/testnet/rpc',
  chain: 'manifest-testnet',
};

async function getTokenMetadata(denom: string) {
  const { createRPCQueryClient } = cosmos.ClientFactory;
  const client = await createRPCQueryClient({ rpcEndpoint: env.rpcUrl });
  try {
    // Query token metadata using the bank module
    const response = await client.cosmos.bank.v1beta1.denomMetadata({ denom });
    return response.metadata;
  } catch (error) {
    console.error(`Error fetching metadata for ${denom}:`, error);
    return null;
  }
}

function formatTokenInfo(denom: string, metadata: any = null) {
  const tokenName = denom.split('/').pop()?.replace('u', '') || '';
  const displayName = tokenName.toUpperCase();

  return {
    description: metadata?.description || `${displayName} Token`,
    denom_units: [
      {
        denom: denom,
        exponent: 0,
      },
      {
        denom: displayName.toLowerCase(),
        exponent: 6,
      },
    ],
    base: denom,
    name: `${displayName} Token`,
    display: displayName.toLowerCase(),
    symbol: displayName,
    logo_URIs: {
      png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.png',
      svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.svg',
    },
    images: [
      {
        png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.png',
        svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.svg',
      },
    ],
    type_asset: 'factory_token',
  };
}

async function main() {
  // Create client
  const { createRPCQueryClient } = cosmos.ClientFactory;
  const client = await createRPCQueryClient({ rpcEndpoint: env.rpcUrl });

  // Query balances for the specified address
  const address = 'manifest1hj5fveer5cjtn4wd6wstzugjfdxzl0xp8ws9ct';
  const balances = await client.cosmos.bank.v1beta1.allBalances({ address, resolveDenom: false });

  // Filter for factory tokens and format them
  const factoryTokens = balances.balances.filter(token => token.denom.startsWith('factory/'));
  const formattedTokens = [];

  console.log(`Found ${factoryTokens.length} factory tokens`);

  for (const token of factoryTokens) {
    const metadata = await getTokenMetadata(token.denom);
    const formattedToken = formatTokenInfo(token.denom, metadata);
    formattedTokens.push(formattedToken);
  }

  // Save to file
  const outputPath = path.join(__dirname, 'token_metadata.json');
  fs.writeFileSync(outputPath, JSON.stringify({ tokens: formattedTokens }, null, 2));
  console.log(`\nToken metadata saved to ${outputPath}`);
}

main().catch(console.error);
