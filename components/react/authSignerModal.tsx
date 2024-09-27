import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SignData } from '@cosmos-kit/web3auth';
import { SignDoc } from '@chalabi/manifestjs/dist/codegen/cosmos/tx/v1beta1/tx';
import { TxBody, AuthInfo } from '@chalabi/manifestjs/dist/codegen/cosmos/tx/v1beta1/tx';
import { decodePubkey } from '@cosmjs/proto-signing';
import { useWallet, useChain } from '@cosmos-kit/react';
import Image from 'next/image';

type DisplayDataToSignProps = {
  data: SignData;
  address: string;
};

const DisplayDataToSign = ({
  data,
  address,
  className,
  addressClassName,
  txInfoClassName,
}: DisplayDataToSignProps & {
  className?: string;
  addressClassName?: string;
  txInfoClassName?: string;
}) => {
  const decodeBodyBytes = (bodyBytes: Uint8Array) => {
    try {
      const decodedBody = TxBody.decode(bodyBytes);
      return {
        messages: decodedBody.messages.map(msg => ({
          typeUrl: msg.typeUrl,
          value: Buffer.from(msg.value).toString('base64'),
        })),
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

  const formatValue = (value: any): string => {
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
        return JSON.stringify(
          decodedValue,
          (_, v) => (typeof v === 'bigint' ? v.toString() : v),
          2
        );
      }
      return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
    }
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return String(value);
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Address</span>
        <pre className={addressClassName}>{address}</pre>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Tx Info</span>
        <pre className={txInfoClassName}>{formatValue(data.value)}</pre>
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
  onClose: () => void;
  data: SignData;
  approve: () => void;
  reject: () => void;
}) => {
  const wallet = useWallet();
  const { address } = useChain('manifest');
  const walletIcon = wallet.wallet?.logo;
  const walletName = wallet.wallet?.prettyName;

  useEffect(() => {
    const modal = document.getElementById('sign-modal') as HTMLDialogElement;
    if (visible) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [visible]);

  const walletIconString = walletIcon?.toString() ?? '';

  return (
    <dialog id="sign-modal" className="modal top-0 right-0">
      <div className="modal-box max-w-lg w-full dark:bg-[#1D192D] bg-[#FFFFFF] rounded-lg shadow-xl">
        <div className="flex justify-between items-center pb-4">
          <div className="flex items-center gap-3">
            <img src={walletIconString} alt="Wallet type logo" className="w-8 h-8" />
            <h3 className="text-xl font-semibold">{walletName?.toString()} Direct Signer</h3>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <DisplayDataToSign
          data={data}
          address={address ?? ''}
          className="space-y-4"
          addressClassName="p-3 rounded-md text-sm overflow-auto h-12 dark:bg-[#E0E0FF0A] bg-[#E0E0FF0A] dark:border-[#FFFFFF33] border-[#00000033] border"
          txInfoClassName="p-3 rounded-md text-sm overflow-auto h-[32rem] dark:bg-[#E0E0FF0A] bg-[#E0E0FF0A] dark:border-[#FFFFFF33] border-[#00000033] border"
        />

        <div className="modal-action mt-6 flex justify-between gap-4">
          <button
            className="btn flex-1 rounded-[12px] focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A]"
            onClick={() => {
              reject();
              onClose();
            }}
          >
            Reject
          </button>
          <button
            className="btn btn-gradient flex-1 rounded-[12px]"
            onClick={() => {
              approve();
              onClose();
            }}
          >
            Approve
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default SignModal;
