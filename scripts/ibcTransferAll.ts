// This script is used to transfer all tokens on manifest to destination chain then print out a list of tokens that can be used in the chain-registry
// you can run this script by providing a mnemonic as an environment variable: `WALLET_MNEMONIC="..." bun run ibc-transfer`
// ENV's:
// DESTINATION_RPC_URL: the rpc url of the destination chain
// DESTINATION_CHAIN: the name of the destination chain
// DESTINATION_PREFIX: the prefix of the destination chain
// SOURCE_CHANNEL: the channel id of the source chain
// DESTINATION_CHANNEL: the channel id of the destination chain
// You can provide the above env's in the command in the same fashion as the mnemonic or they will be set to default values
// Axelar example:
// WALLET_MNEMONIC="" DESTINATION_CHAIN="axelar-testnet-lisbon-3" DESTINATION_PREFIX="axelar" SOURCE_CHANNEL="channel-3" DESTINATION_CHANNEL="channel-591" DESTINATION_RPC_URL="https://axelar-testnet-rpc.polkachu.com/"  bun run ibc-transfer
// Axlear query only:
// QUERY_ONLY=true WALLET_MNEMONIC="" DESTINATION_CHAIN="axelar-testnet-lisbon-3" DESTINATION_PREFIX="axelar" SOURCE_CHANNEL="channel-3" DESTINATION_CHANNEL="channel-591" DESTINATION_RPC_URL="https://axelar-testnet-rpc.polkachu.com/" QUERY_ONLY="true" bun run ibc-transfer
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import { ibc } from '@liftedinit/manifestjs';
import { MsgTransfer } from '@liftedinit/manifestjs/dist/codegen/ibc/applications/transfer/v1/tx';
import * as fs from 'fs';
import * as path from 'path';

// Environment Configuration
const env = {
  rpcUrl: 'https://nodes.liftedinit.tech/manifest/testnet/rpc',
  destinationRpcUrl: process.env.DESTINATION_RPC_URL || 'https://rpc.osmotest5.osmosis.zone',
  chain: 'manifest-testnet',
  destinationChain: process.env.DESTINATION_CHAIN || 'osmo-test-5',
  destinationPrefix: process.env.DESTINATION_PREFIX || 'osmo',
  sourceChannel: process.env.SOURCE_CHANNEL || 'channel-0',
  destinationChannel: process.env.DESTINATION_CHANNEL || 'channel-10016',
};

// Add option for query-only mode at the top with other constants
const QUERY_ONLY = process.env.QUERY_ONLY === 'true';

// IBC Configuration
const getIbcInfo = (fromChain: string, toChain: string) => {
  // Default configuration
  return {
    source_port: 'transfer',
    source_channel: env.sourceChannel,
  };
};

// Configuration
const MANIFEST_RPC = env.rpcUrl;
const DESTINATION_RPC = env.destinationRpcUrl;
const SOURCE_CHAIN = env.chain;
const TARGET_CHAIN = env.destinationChain;

// Helper function to format token info for asset list
function formatTokenForAssetList(ibcDenom: string, denomTrace: any, originalDenom: string) {
  const tokenName = originalDenom.split('/').pop()?.replace('u', '') || '';
  const displayName = tokenName.toUpperCase();

  return {
    description: `${displayName} Token on Manifest Ledger Testnet`,
    denom_units: [
      {
        denom: ibcDenom,
        exponent: 0,
      },
      {
        denom: tokenName,
        exponent: 6,
      },
    ],
    type_asset: 'ics20',
    base: ibcDenom,
    name: displayName,
    display: tokenName,
    symbol: displayName,
    traces: [
      {
        type: 'ibc',
        counterparty: {
          chain_name: 'manifesttestnet',
          base_denom: originalDenom,
          channel_id: env.sourceChannel,
        },
        chain: {
          channel_id: env.destinationChannel,
          path: `${denomTrace.path}/${originalDenom}`,
        },
      },
    ],
    images: [
      {
        image_sync: {
          chain_name: 'manifesttestnet',
          base_denom: originalDenom,
        },
        png: `https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.png`,
        svg: `https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.svg`,
      },
    ],
    logo_URIs: {
      png: `https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.png`,
      svg: `https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/manifesttestnet/images/mfx.svg`,
    },
  };
}

// Update the getDenomTrace function
async function getDenomTrace(hash: string) {
  try {
    const { createRPCQueryClient } = ibc.ClientFactory;
    const client = await createRPCQueryClient({
      rpcEndpoint: DESTINATION_RPC,
    });

    const response = await client.ibc.applications.transfer.v1.denomTrace({
      hash: hash,
    });

    console.log('Denom trace response:', response);
    return response.denomTrace;
  } catch (error: any) {
    console.error('Error fetching denom trace:', {
      error: error.message,
      hash: hash,
    });
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
  const destinationWallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: env.destinationPrefix,
  });

  // Get addresses
  const [manifestAccount] = await manifestWallet.getAccounts();
  const [destinationAccount] = await destinationWallet.getAccounts();

  console.log('Manifest address:', manifestAccount.address);
  console.log('Destination address:', destinationAccount.address);

  // Create signing clients
  const manifestClient = await SigningStargateClient.connectWithSigner(
    MANIFEST_RPC,
    manifestWallet
  );
  const destinationClient = await SigningStargateClient.connectWithSigner(
    DESTINATION_RPC,
    destinationWallet
  );

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
          receiver: destinationAccount.address,
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

  // Execute transfers only if not in query-only mode
  if (!QUERY_ONLY && messages.length > 0) {
    try {
      const fee = {
        amount: [{ denom: 'umfx', amount: '5500' }],
        gas: '5000000',
      };

      console.log('\nExecuting IBC transfers...');
      console.log(`Total tokens to transfer: ${messages.length}`);

      // Process each message individually
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        console.log(`\nProcessing transfer ${i + 1} of ${messages.length}`);
        console.log(`Transferring token...`);

        const result = await manifestClient.signAndBroadcast(
          manifestAccount.address,
          [message], // Send single message instead of batch
          fee
        );

        if (result.code !== 0) {
          throw new Error(`Transaction failed with code ${result.code}. Logs: ${result.rawLog}`);
        }

        console.log('Transfer result:', {
          code: result.code,
          hash: result.transactionHash,
        });

        // Add a small delay between transfers to prevent rate limiting
        if (i + 1 < messages.length) {
          console.log('Waiting 5 seconds before next transfer...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      process.exit(1);
    }
  } else if (QUERY_ONLY) {
    console.log('\nQuery-only mode - skipping transfers');
  } else {
    console.log('No tokens to transfer');
  }

  if (!QUERY_ONLY) {
    // Wait a bit for the transfers to complete
    console.log('\nWaiting 1 minute for transfers to complete...');

    await new Promise(resolve => setTimeout(resolve, 60000));
  }

  // Query final balances on Destination
  console.log('\nQuerying Destination balances...');
  const destinationBalances = await destinationClient.getAllBalances(destinationAccount.address);
  console.log('Destination chain balances:', destinationBalances);

  // Query IBC denom traces for each IBC token and format them
  const ibcTokens = destinationBalances.filter(token => token.denom.startsWith('ibc/'));
  const formattedTokens = [];

  if (ibcTokens.length > 0) {
    console.log('\nProcessing IBC Denom Traces:');
    for (const token of ibcTokens) {
      try {
        const hash = token.denom.split('/')[1];
        const denomTrace = await getDenomTrace(hash);
        console.log(`Processing ${token.denom}:`, denomTrace);

        if (denomTrace) {
          // Extract original denom from the denom trace
          const originalDenom = denomTrace.baseDenom;
          formattedTokens.push(formatTokenForAssetList(token.denom, denomTrace, originalDenom));
        }
      } catch (error) {
        console.error(`Error processing denom trace for ${token.denom}:`, error);
      }
    }

    // Save formatted tokens to file
    if (formattedTokens.length > 0) {
      const outputPath = path.join(__dirname, 'chain-registry-tokens.json');
      fs.writeFileSync(outputPath, JSON.stringify({ tokens: formattedTokens }, null, 2));
      console.log(`\nChain Registry token information saved to ${outputPath}`);
    }
  } else {
    console.log('No IBC tokens found in Destination balances');
  }
}

main().catch(console.error);
