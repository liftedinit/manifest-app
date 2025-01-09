import {
  DeliverTxResponse,
  isDeliverTxSuccess,
  StdFee,
  SigningStargateClient,
} from '@cosmjs/stargate';
import { useChain } from '@cosmos-kit/react';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { useToast } from '@/contexts/toastContext';
import { useState } from 'react';
import env from '@/config/env';

interface Msg {
  typeUrl: string;
  value: any;
}

export interface TxOptions {
  fee?: StdFee | null;
  memo?: string;
  onSuccess?: () => void;
  returnError?: boolean;
  simulate?: boolean;
}

export interface ToastMessage {
  type: string;
  title: string;
  description?: string;
  link?: string;
  explorerLink?: string;
  bgColor?: string;
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

export const useTx = (chainName: string) => {
  const { address, getSigningStargateClient, estimateFee } = useChain(chainName);
  const { setToastMessage } = useToast();
  const [isSigning, setIsSigning] = useState(false);
  const explorerUrl = env.explorerUrl;

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
    let client: SigningStargateClient;
    try {
      client = await getSigningStargateClient();

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

      const signed = await client.sign(
        address,
        msgs,
        options.fee || (await estimateFee(msgs)),
        options.memo || ''
      );

      setToastMessage({
        type: 'alert-info',
        title: 'Broadcasting',
        description: 'Transaction is signed and is being broadcasted...',
        bgColor: '#3498db',
      });
      setIsSigning(true);
      const res: DeliverTxResponse = await client.broadcastTx(
        Uint8Array.from(TxRaw.encode(signed).finish())
      );

      if (isDeliverTxSuccess(res)) {
        if (options.onSuccess) options.onSuccess();
        setIsSigning(false);
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
        setIsSigning(false);
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
      setIsSigning(false);
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
    }
  };

  return { tx, isSigning, setIsSigning };
};
