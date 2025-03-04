import { decodePubkey } from '@cosmjs/proto-signing';
import { useChain, useWallet } from '@cosmos-kit/react';
import { SignData } from '@cosmos-kit/web3auth';
import { Dialog } from '@headlessui/react';
import { MsgSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';
import {
  MsgCreateGroupWithPolicy,
  MsgSubmitProposal,
  MsgUpdateGroupMembers,
  MsgUpdateGroupMetadata,
  MsgUpdateGroupPolicyDecisionPolicy,
  MsgUpdateGroupPolicyMetadata,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { AuthInfo, TxBody } from '@liftedinit/manifestjs/dist/codegen/cosmos/tx/v1beta1/tx';
import {
  MsgCancelUpgrade,
  MsgSoftwareUpgrade,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';
import {
  MsgBurnHeldBalance,
  MsgPayout,
} from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import {
  MsgCreateDenom,
  MsgSetDenomMetadata,
} from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import { MsgSetPower } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';

import env from '@/config/env';
import { useTheme } from '@/contexts';
import { Web3AuthContext } from '@/contexts/web3AuthContext';
import { getRealLogo } from '@/utils';

import { ArrowRightIcon } from '../icons';

type DisplayDataToSignProps = {
  data: SignData;
  address: string;
};

// Message decoder registry
const messageDecoders: Record<string, (value: Uint8Array) => any> = {
  '/cosmos.bank.v1beta1.MsgSend': (value: Uint8Array) => {
    const decoded = MsgSend.decode(value);
    return { ...decoded };
  },
  '/cosmos.group.v1.MsgCreateGroupWithPolicy': (value: Uint8Array) => {
    const decoded = MsgCreateGroupWithPolicy.decode(value);
    return { ...decoded };
  },
  '/cosmos.group.v1.MsgSubmitProposal': (value: Uint8Array) => {
    const decoded = MsgSubmitProposal.decode(value);
    return { ...decoded };
  },
  '/cosmos.group.v1.MsgUpdateGroupMetadata': (value: Uint8Array) => {
    const decoded = MsgUpdateGroupMetadata.decode(value);
    return { ...decoded };
  },
  '/cosmos.group.v1.MsgUpdateGroupPolicyMetadata': (value: Uint8Array) => {
    const decoded = MsgUpdateGroupPolicyMetadata.decode(value);
    return { ...decoded };
  },
  '/cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicy': (value: Uint8Array) => {
    const decoded = MsgUpdateGroupPolicyDecisionPolicy.decode(value);
    return { ...decoded };
  },
  '/cosmos.group.v1.MsgUpdateGroupMembers': (value: Uint8Array) => {
    const decoded = MsgUpdateGroupMembers.decode(value);
    return { ...decoded };
  },
  '/cosmos.upgrade.v1beta1.MsgCancelUpgrade': (value: Uint8Array) => {
    const decoded = MsgCancelUpgrade.decode(value);
    return { ...decoded };
  },
  '/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade': (value: Uint8Array) => {
    const decoded = MsgSoftwareUpgrade.decode(value);
    return { ...decoded };
  },
  '/strangelove_ventures.poa.v1.MsgSetPower': (value: Uint8Array) => {
    const decoded = MsgSetPower.decode(value);
    return { ...decoded };
  },
  '/liftedinit.manifest.v1.MsgPayout': (value: Uint8Array) => {
    const decoded = MsgPayout.decode(value);
    return { ...decoded };
  },
  '/liftedinit.manifest.v1.MsgBurnHeldBalance': (value: Uint8Array) => {
    const decoded = MsgBurnHeldBalance.decode(value);
    return { ...decoded };
  },
  '/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata': (value: Uint8Array) => {
    const decoded = MsgSetDenomMetadata.decode(value);
    return { ...decoded };
  },
  '/osmosis.tokenfactory.v1beta1.MsgCreateDenom': (value: Uint8Array) => {
    const decoded = MsgCreateDenom.decode(value);
    return { ...decoded };
  },
};

const DisplayDataToSign = ({
  data,
  address,
  className,
  txInfoClassName,
  theme,
}: DisplayDataToSignProps & {
  className?: string;
  txInfoClassName?: string;
  theme?: string;
}) => {
  const [isTxInfoExpanded, setIsTxInfoExpanded] = useState(false);

  const decodeBodyBytes = (bodyBytes: Uint8Array) => {
    try {
      const decodedBody = TxBody.decode(bodyBytes);
      return {
        messages: decodedBody.messages.map(msg => {
          const base64Value = Buffer.from(msg.value).toString('base64');

          try {
            // Check if we have a specific decoder for this message type
            if (messageDecoders[msg.typeUrl]) {
              return {
                typeUrl: msg.typeUrl,
                value: messageDecoders[msg.typeUrl](msg.value),
              };
            }

            // Fallback to generic base64 decoding
            const decodedValue = Buffer.from(base64Value, 'base64').toString('utf8');
            try {
              return {
                typeUrl: msg.typeUrl,
                value: JSON.parse(decodedValue),
              };
            } catch {
              return {
                typeUrl: msg.typeUrl,
                value: decodedValue,
              };
            }
          } catch (error) {
            console.error(`Failed to decode message of type ${msg.typeUrl}:`, error);
            return {
              typeUrl: msg.typeUrl,
              value: base64Value,
            };
          }
        }),
        memo: decodedBody.memo,
        timeoutHeight: decodedBody.timeoutHeight.toString(),
        extensionOptions: decodedBody.extensionOptions,
        nonCriticalExtensionOptions: decodedBody.nonCriticalExtensionOptions,
      };
    } catch (error) {
      console.error('Failed to decode bodyBytes:', error);
      return 'Failed to decode bodyBytes';
    }
  };

  const decodeAuthInfoBytes = (authInfoBytes: Uint8Array) => {
    try {
      const decodedAuthInfo = AuthInfo.decode(authInfoBytes);
      return {
        signerInfos: decodedAuthInfo.signerInfos.map(signerInfo => ({
          publicKey: signerInfo.publicKey ? decodePubkey(signerInfo.publicKey) : null,
          modeInfo: signerInfo.modeInfo,
          sequence: signerInfo.sequence.toString(),
        })),
        fee: {
          amount: decodedAuthInfo.fee?.amount,
          gasLimit: decodedAuthInfo.fee?.gasLimit.toString(),
          payer: decodedAuthInfo.fee?.payer,
          granter: decodedAuthInfo.fee?.granter,
        },
      };
    } catch (error) {
      console.error('Failed to decode authInfoBytes:', error);
      return 'Failed to decode authInfoBytes';
    }
  };

  const formatValue = (value: any, theme: string) => {
    if (value instanceof Uint8Array) {
      return Buffer.from(value).toString('base64');
    }
    if (typeof value === 'object' && value !== null) {
      let v = value;
      if ('bodyBytes' in value && 'authInfoBytes' in value) {
        v = {
          ...value,
          bodyBytes: decodeBodyBytes(value.bodyBytes),
          authInfoBytes: decodeAuthInfoBytes(value.authInfoBytes),
        };
      }

      return (
        <SyntaxHighlighter
          language="json"
          style={theme === 'dark' ? oneDark : oneLight}
          customStyle={{
            backgroundColor: 'transparent',
            padding: '1rem',
            borderRadius: '0.5rem',
          }}
        >
          {JSON.stringify(v, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)}
        </SyntaxHighlighter>
      );
    }
    return String(value);
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-row justify-between">
          <span>
            <span className="font-bold">Sender:</span> {address}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setIsTxInfoExpanded(!isTxInfoExpanded)}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <div className="flex items-center gap-2 flex-row justify-between">
            <span>Transaction Details</span>
            {isTxInfoExpanded ? (
              <ArrowRightIcon size={12} style={{ transform: 'rotate(90deg)' }} />
            ) : (
              <ArrowRightIcon size={12} style={{ transform: 'rotate(180deg)' }} />
            )}
          </div>
        </button>
        {isTxInfoExpanded && (
          <div className={txInfoClassName}>{formatValue(data.value, theme ?? 'light')}</div>
        )}
      </div>
    </div>
  );
};

/**
 * Sign modal component. Use this component to insert the signing modal at the appropriate
 * location in your app's component tree. This component will automatically show the modal
 * when a sign request is received.
 * @constructor
 */
export const SignModal = ({ id, testing }: { id?: string; testing?: boolean }) => {
  const { wallet } = useWallet();
  const { prompt, promptId, isSigning } = useContext(Web3AuthContext);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<SignData | undefined>(undefined);

  const isLedgerWallet = wallet?.mode === 'ledger';

  useEffect(() => {
    if (promptId === id && prompt !== undefined) {
      setVisible(true);
      setData(prompt.signData);
    } else {
      setVisible(false);
    }
  }, [promptId, id, prompt]);

  if (!isSigning || !visible) {
    return null;
  }

  const approve = () => prompt?.resolve(true);
  const reject = () => prompt?.resolve(false);

  if (isLedgerWallet) {
    return <LedgerSignModalInner onClose={() => {}} />;
  } else {
    return (
      <PromptSignModalInner
        visible={visible}
        onClose={reject}
        data={data}
        reject={reject}
        approve={approve}
      />
    );
  }
};

export interface LedgerSignModalInnerProps {
  onClose: () => void;
}

/**
 * A signing modal that is displayed when a sign request is received, when the user
 * is using a Ledger wallet. This should not be cancellable (as the user is expected to
 * approve/reject on his Ledger device).
 * @constructor
 */
export const LedgerSignModalInner: React.FC<LedgerSignModalInnerProps> = ({ onClose }) => {
  return (
    <Dialog open onClose={onClose} className="modal modal-open top-0 right-0 z-[9999]">
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30" aria-hidden="true" />

      <Dialog.Panel className="modal-box max-w-lg w-full dark:bg-[#1D192D] bg-[#FFFFFF] rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">Ledger HSM</h3>

        <p className="mt-2 text-sm leading-6 font-light dark:text-gray-400 text-gray-600 ">
          It seems you are using a Ledger hardware wallet. Please approve or reject the transaction
          on your device.
        </p>
      </Dialog.Panel>
    </Dialog>
  );
};

export interface SignModalInnerProps {
  visible: boolean;
  data?: SignData;
  onClose: () => void;
  reject?: () => void;
  approve?: () => void;
}

/**
 * The actual signing modal (with transaction info) that is displayed when a sign request is
 * received.
 * @param visible Whether the modal is visible.
 * @param data The transaction data to sign. This will be displayed to the user.
 * @param onClose Callback when the modal is closed, whether it was approved or rejected.
 * @param reject Callback when the user rejects the transaction.
 * @param approve Callback when the user approves the transaction.
 * @constructor
 */
export const PromptSignModalInner: React.FC<SignModalInnerProps> = ({
  visible,
  data,
  onClose,
  reject,
  approve,
}) => {
  const { wallet } = useWallet();
  const { address } = useChain(env.chain);
  const { theme } = useTheme();
  const walletIcon = wallet?.logo;
  const walletIconString = walletIcon?.toString();

  function handleReject() {
    reject?.();
    onClose();
  }

  function handleApprove() {
    approve?.();
    onClose();
  }

  if (!visible) return null;
  return (
    <Dialog open onClose={onClose} className="modal modal-open top-0 right-0 z-[9999]">
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30" aria-hidden="true" />

      <Dialog.Panel className="modal-box max-w-lg w-full dark:bg-[#1D192D] bg-[#FFFFFF] rounded-lg shadow-xl">
        <div className="flex justify-between items-center pb-4">
          <div className="flex items-center gap-3">
            {walletIconString && (
              <Image
                src={getRealLogo(walletIconString, theme === 'dark')}
                alt="Wallet type logo"
                className="w-8 h-8"
                width={32}
                height={32}
              />
            )}
            <h3 className="text-xl font-semibold">Approve transaction?</h3>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <DisplayDataToSign
          data={data ?? ({} as SignData)}
          address={address ?? ''}
          theme={theme}
          className="space-y-4"
          txInfoClassName="p-3 rounded-md text-sm overflow-auto h-[32rem] dark:bg-[#E0E0FF0A] bg-[#E0E0FF0A] dark:border-[#FFFFFF33] border-[#00000033] border"
        />

        <div className="modal-action mt-6 flex justify-between gap-4">
          <button
            role="button"
            aria-label="Reject"
            className="btn btn-error flex-1 rounded-[12px] focus:outline-none"
            onClick={handleReject}
          >
            Reject
          </button>
          <button
            role="button"
            aria-label="Approve"
            className="btn btn-gradient flex-1 rounded-[12px]"
            onClick={handleApprove}
          >
            Approve
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};
