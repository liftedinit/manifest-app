import { DeliverTxResponse, StdFee, isDeliverTxSuccess } from '@cosmjs/stargate';
import { useChain } from '@cosmos-kit/react';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { useContext } from 'react';

import env from '@/config/env';
import { useToast } from '@/contexts/toastContext';
import { Web3AuthContext } from '@/contexts/web3AuthContext';

interface Msg {
  typeUrl: string;
  value: any;
}

export interface TxOptions {
  fee?: StdFee | (() => Promise<StdFee | undefined | null>) | null;
  memo?: string;
  onSuccess?: () => void;
  returnError?: boolean;
  simulate?: boolean;
}

const extractSimulationErrorMessage = (errorMessage: string): string => {
  // This regex looks for the specific error message
  const match = errorMessage.match(/message index: \d+: (.+?)(?=\s*\[|$)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  // If no match is found, return a generic error message
  return 'An error occurred during simulation';
};

export const useTx = (chainName: string, promptId?: string) => {
  const { isSigning, setIsSigning, setPromptId } = useContext(Web3AuthContext);
  const { address, getSigningStargateClient, estimateFee } = useChain(chainName);
  const { setToastMessage } = useToast();
  const explorerUrl = chainName === env.osmosisChain ? env.osmosisExplorerUrl : env.explorerUrl;

  const tx = async (msgs: Msg[], options: TxOptions) => {
    if (!address) {
      setToastMessage({
        type: 'alert-error',
        title: 'Wallet not connected',
        description: 'Please connect your wallet.',
        bgColor: '#e74c3c',
      });
      return options.returnError ? { error: 'Wallet not connected' } : undefined;
    }

    setIsSigning(true);
    setPromptId(promptId);

    try {
      const client = await getSigningStargateClient();

      if (options.simulate) {
        try {
          const simulateResult = await client.simulate(address, msgs, options.memo || '');
          return {
            success: true,
            result: simulateResult,
          };
        } catch (simError: any) {
          const cleanErrorMessage = extractSimulationErrorMessage(simError.message);
          console.error('Simulation error:', simError.message); // Log full error
          setToastMessage({
            type: 'alert-error',
            title: 'Simulation Failed',
            description: cleanErrorMessage,
            bgColor: '#e74c3c',
          });
          return {
            success: false,
            error: cleanErrorMessage, // Return clean error for UI
          };
        }
      }

      // Get fee first and exit early if it fails
      let fee = undefined;
      if (options.fee) {
        fee = typeof options.fee === 'function' ? await options.fee() : options.fee;
      } else {
        fee = await estimateFee(msgs);
      }

      if (!fee) {
        // Return early since estimateFee already showed an error toast
        return options.returnError ? { error: 'Fee estimation failed' } : undefined;
      }

      const signed = await client.sign(address, msgs, fee, options.memo || '');

      setToastMessage({
        type: 'alert-info',
        title: 'Broadcasting',
        description: 'Transaction is signed and is being broadcasted...',
        bgColor: '#3498db',
      });
      const res: DeliverTxResponse = await client.broadcastTx(
        Uint8Array.from(TxRaw.encode(signed).finish())
      );

      if (isDeliverTxSuccess(res)) {
        if (options.onSuccess) options.onSuccess();

        if (msgs.filter(msg => msg.typeUrl === '/cosmos.group.v1.MsgSubmitProposal').length > 0) {
          const submitProposalEvent = res.events.find(
            event => event.type === 'cosmos.group.v1.EventSubmitProposal'
          );
          const proposalId = submitProposalEvent?.attributes
            .find(attr => attr.key === 'proposal_id')
            ?.value.replace(/"/g, '');

          setToastMessage({
            type: 'alert-success',
            title: 'Proposal Submitted',
            description: `Proposal submitted successfully`,
            link: `/groups?policyAddress=${msgs[0].value.groupPolicyAddress}&tab=proposals&proposalId=${proposalId}`,
            explorerLink: `${explorerUrl}/transaction/${res?.transactionHash}`,
            bgColor: '#2ecc71',
          });
        } else {
          setToastMessage({
            type: 'alert-success',
            title: 'Transaction Successful',
            description: `Transaction completed successfully`,
            link: `${explorerUrl}/transaction/${res?.transactionHash}`,
            bgColor: '#2ecc71',
          });
        }
        return options.returnError ? { error: null } : undefined;
      } else {
        setToastMessage({
          type: 'alert-error',
          title: 'Transaction Failed',
          description: res?.rawLog || 'Unknown error',
          bgColor: '#e74c3c',
        });
        return options.returnError ? { error: res?.rawLog || 'Unknown error' } : undefined;
      }
    } catch (e: any) {
      console.error('Failed to broadcast or simulate: ', e);
      const errorMessage = options.simulate ? extractSimulationErrorMessage(e.message) : e.message;
      setToastMessage({
        type: 'alert-error',
        title: options.simulate ? 'Simulation Failed' : 'Transaction Failed',
        description: errorMessage,
        bgColor: '#e74c3c',
      });
      return options.returnError ? { error: errorMessage } : undefined;
    } finally {
      setIsSigning(false);
      setPromptId(undefined);
    }
  };

  return { tx, isSigning };
};
