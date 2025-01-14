import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import { cosmos, ibc } from '@liftedinit/manifestjs';
import { MsgTransfer } from '@liftedinit/manifestjs/dist/codegen/ibc/applications/transfer/v1/tx';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Environment Configuration
const env = {
  rpcUrl: 'https://nodes.liftedinit.tech/manifest/testnet/rpc',
  osmosisTestnetRpcUrl: 'https://rpc.osmotest5.osmosis.zone',
  chain: 'manifest-testnet',
  osmosisTestnetChain: 'osmo-test-5',
};

// IBC Configuration
const getIbcInfo = (fromChain: string, toChain: string) => {
  if (fromChain === 'manifest-testnet' && toChain === 'osmo-test-5') {
    return {
      source_port: 'transfer',
      source_channel: 'channel-0',
    };
  }
  throw new Error(`Unsupported chain combination: ${fromChain} -> ${toChain}`);
};

// Configuration
const MANIFEST_RPC = env.rpcUrl;
const OSMOSIS_RPC = env.osmosisRpcUrl;
const SOURCE_CHAIN = env.chain;
const TARGET_CHAIN = env.osmosisChain;

// Helper function to format token info for asset list
function formatTokenForAssetList(ibcDenom: string, denomTrace: any, originalDenom: string) {
  const tokenName = originalDenom.split('/').pop()?.replace('u', '') || '';
  const displayName = tokenName.toUpperCase();

  return {
    description: `${displayName} Token`,
    denom_units: [
      {
        denom: ibcDenom,
        exponent: 0,
        aliases: [originalDenom],
      },
      {
        denom: displayName,
        exponent: 6,
      },
    ],
    type_asset: 'ics20',
    base: ibcDenom,
    name: displayName,
    display: displayName,
    symbol: displayName,
    traces: [
      {
        type: 'ibc',
        counterparty: {
          chain_name: 'manifesttestnet',
          base_denom: originalDenom,
          channel_id: 'channel-0',
        },
        chain: {
          channel_id: 'channel-10016',
          path: denomTrace.path,
        },
      },
    ],
    logo_URIs: {
      png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.png',
      svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.svg',
    },
    images: [
      {
        image_sync: {
          chain_name: 'manifesttestnet',
          base_denom: originalDenom,
        },
        png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.png',
        svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.svg',
      },
    ],
  };
}

// Helper function to query denom trace
async function getDenomTrace(hash: string) {
  try {
    const response = await axios.get(
      `${OSMOSIS_RPC.replace('rpc', 'rest')}/ibc/apps/transfer/v1/denom_traces/${hash}`
    );
    return response.data.denom_trace;
  } catch (error) {
    console.error('Error fetching denom trace:', error);
    return null;
  }
}

async function main() {
  // Get mnemonic from environment or argument
  const mnemonic = process.env.WALLET_MNEMONIC;
  if (!mnemonic) {
    throw new Error('Please provide WALLET_MNEMONIC environment variable');
  }

  // Setup wallets for both chains
  const manifestWallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'manifest',
  });
  const osmosisWallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'osmo',
  });

  // Get addresses
  const [manifestAccount] = await manifestWallet.getAccounts();
  const [osmosisAccount] = await osmosisWallet.getAccounts();

  console.log('Manifest address:', manifestAccount.address);
  console.log('Osmosis address:', osmosisAccount.address);

  // Create signing clients
  const manifestClient = await SigningStargateClient.connectWithSigner(
    MANIFEST_RPC,
    manifestWallet
  );
  const osmosisClient = await SigningStargateClient.connectWithSigner(OSMOSIS_RPC, osmosisWallet);

  // Query balances on Manifest chain
  const balances = await manifestClient.getAllBalances(manifestAccount.address);
  console.log('\nManifest chain balances:', balances);

  // Get IBC info
  const { source_port, source_channel } = getIbcInfo(SOURCE_CHAIN, TARGET_CHAIN);

  // Filter and create IBC transfer messages for each token
  const messages = balances
    .filter(token => token.denom.startsWith('factory/'))
    .map(token => {
      const timeoutInNanos = (Date.now() + 1.2e6) * 1e6;

      return {
        typeUrl: MsgTransfer.typeUrl,
        value: {
          sourcePort: source_port,
          sourceChannel: source_channel,
          sender: manifestAccount.address,
          receiver: osmosisAccount.address,
          token: {
            denom: token.denom,
            amount: '1',
          },
          timeoutHeight: {
            revisionNumber: BigInt(0),
            revisionHeight: BigInt(0),
          },
          timeoutTimestamp: BigInt(timeoutInNanos),
        },
      };
    });

  // Execute transfers
  if (messages.length > 0) {
    try {
      const fee = {
        amount: [{ denom: 'umfx', amount: '5500' }],
        gas: '5000000',
      };

      console.log('\nExecuting IBC transfers...');
      console.log(`Attempting to transfer 1 token each for ${messages.length} different denoms...`);

      const result = await manifestClient.signAndBroadcast(manifestAccount.address, messages, fee);

      if (result.code !== 0) {
        throw new Error(`Transaction failed with code ${result.code}. Logs: ${result.rawLog}`);
      }

      console.log('Transfer result:', {
        code: result.code,
        hash: result.transactionHash,
      });
    } catch (error) {
      console.error('Error during transfer:', error);
      process.exit(1); // Exit with error code
    }
  } else {
    console.log('No tokens to transfer');
  }

  // Wait a bit for the transfers to complete
  console.log('\nWaiting 1 minute for transfers to complete...');
  await new Promise(resolve => setTimeout(resolve, 60000));

  // Query final balances on Osmosis
  const osmosisBalances = await osmosisClient.getAllBalances(osmosisAccount.address);
  console.log('\nOsmosis chain balances:', osmosisBalances);

  // Query IBC denom traces for each IBC token and format them
  const ibcTokens = osmosisBalances.filter(token => token.denom.startsWith('ibc/'));
  const formattedTokens = [];

  if (ibcTokens.length > 0) {
    console.log('\nIBC Denom Traces:');
    for (const token of ibcTokens) {
      try {
        const hash = token.denom.split('/')[1];
        const denomTrace = await getDenomTrace(hash);
        console.log(`${token.denom}:`, denomTrace);

        // Find original denom from balances
        const originalDenom = balances.find(
          b => denomTrace?.base_denom === b.denom || denomTrace?.path.includes(b.denom)
        )?.denom;

        if (originalDenom && denomTrace) {
          formattedTokens.push(formatTokenForAssetList(token.denom, denomTrace, originalDenom));
        }
      } catch (error) {
        console.error(`Error querying denom trace for ${token.denom}:`, error);
      }
    }

    // Save formatted tokens to file
    const outputPath = path.join(__dirname, 'denoms.json');
    fs.writeFileSync(outputPath, JSON.stringify({ tokens: formattedTokens }, null, 2));
    console.log(`\nToken information saved to ${outputPath}`);
  }
}

main().catch(console.error);
