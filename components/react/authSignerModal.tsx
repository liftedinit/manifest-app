import { useState } from 'react';
import { SignData } from '@cosmos-kit/web3auth';
import { TxBody, AuthInfo } from '@liftedinit/manifestjs/dist/codegen/cosmos/tx/v1beta1/tx';
import { decodePubkey } from '@cosmjs/proto-signing';
import { useWallet, useChain } from '@cosmos-kit/react';
import { getRealLogo } from '@/utils';
import { useTheme } from '@/contexts';
import env from '@/config/env';
import { ArrowRightIcon } from '../icons';
import { objectSyntax } from '../messageSyntax';
import { MsgSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';
import {
  MsgCreateGroupWithPolicy,
  MsgSubmitProposal,
  MsgUpdateGroupMembers,
  MsgUpdateGroupPolicyMetadata,
  MsgUpdateGroupPolicyDecisionPolicy,
  MsgUpdateGroupMetadata,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import {
  MsgCancelUpgrade,
  MsgSoftwareUpgrade,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';
import { MsgSetPower } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import {
  MsgPayout,
  MsgBurnHeldBalance,
} from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';
import {
  MsgSetDenomMetadata,
  MsgCreateDenom,
} from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import { Dialog } from '@headlessui/react';

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
  addressClassName,
  txInfoClassName,
  theme,
}: DisplayDataToSignProps & {
  className?: string;
  addressClassName?: string;
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
      if ('bodyBytes' in value && 'authInfoBytes' in value) {
        const decodedValue = {
          ...value,
          bodyBytes: decodeBodyBytes(value.bodyBytes),
          authInfoBytes: decodeAuthInfoBytes(value.authInfoBytes),
        };
        return objectSyntax(
          JSON.parse(
            JSON.stringify(decodedValue, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
          ),
          theme
        );
      }
      return objectSyntax(
        JSON.parse(JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v))),
        theme
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

const SignModal = ({
  visible,
  onClose,
  data,
  approve,
  reject,
}: {
  visible: boolean;
  onClose?: () => void;
  data: SignData;
  approve: () => void;
  reject: () => void;
}) => {
  onClose = onClose || (() => {});

  const wallet = useWallet();
  const { address } = useChain(env.chain);
  const walletIcon = wallet.wallet?.logo;
  const { theme } = useTheme();

  const walletIconString = walletIcon?.toString() ?? '';

  return (
    <Dialog open={visible} onClose={onClose} className="modal modal-open top-0 right-0 z-[9999]">
      <Dialog.Panel className="modal-box max-w-lg w-full dark:bg-[#1D192D] bg-[#FFFFFF] rounded-lg shadow-xl">
        <div className="flex justify-between items-center pb-4">
          <div className="flex items-center gap-3">
            <img
              src={getRealLogo(walletIconString, theme === 'dark')}
              alt="Wallet type logo"
              className="w-8 h-8"
            />
            <h3 className="text-xl font-semibold">Approve transaction?</h3>
          </div>
          <button
            id={'close-modal'}
            className="btn btn-sm btn-circle btn-ghost"
            onClick={() => {
              debugger;
              reject();
            }}
          >
            ✕
          </button>
        </div>

        <DisplayDataToSign
          data={data}
          address={address ?? ''}
          theme={theme}
          className="space-y-4"
          addressClassName="p-3 rounded-md text-sm overflow-auto h-12 dark:bg-[#E0E0FF0A] bg-[#E0E0FF0A] dark:border-[#FFFFFF33] border-[#00000033] border"
          txInfoClassName="p-3 rounded-md text-sm overflow-auto h-[32rem] dark:bg-[#E0E0FF0A] bg-[#E0E0FF0A] dark:border-[#FFFFFF33] border-[#00000033] border"
        />

        <div className="modal-action mt-6 flex justify-between gap-4">
          <button
            className="btn btn-error flex-1 rounded-[12px] focus:outline-none "
            onClick={() => {
              reject();
            }}
          >
            Reject
          </button>
          <button
            className="btn btn-gradient flex-1 rounded-[12px]"
            onClick={() => {
              approve();
            }}
          >
            Approve
          </button>
        </div>
      </Dialog.Panel>
      <Dialog.Backdrop className="modal-backdrop" />
    </Dialog>
  );
};

export default SignModal;
