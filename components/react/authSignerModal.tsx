import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { SignData } from "@cosmos-kit/web3auth";
import { SignDoc } from "@chalabi/manifestjs/dist/codegen/cosmos/tx/v1beta1/tx";
import {
  TxBody,
  AuthInfo,
} from "@chalabi/manifestjs/dist/codegen/cosmos/tx/v1beta1/tx";
import { decodePubkey } from "@cosmjs/proto-signing";
import { useWallet, useChain } from "@cosmos-kit/react";
import Image from "next/image";

type DisplayDataToSignProps = {
  data: SignData;
  address: string;
};

const DisplayDataToSign = ({ data, address }: DisplayDataToSignProps) => {
  const decodeBodyBytes = (bodyBytes: Uint8Array) => {
    try {
      const decodedBody = TxBody.decode(bodyBytes);
      return {
        messages: decodedBody.messages.map((msg) => ({
          typeUrl: msg.typeUrl,
          value: Buffer.from(msg.value).toString("base64"),
        })),
        memo: decodedBody.memo,
        timeoutHeight: decodedBody.timeoutHeight.toString(),
        extensionOptions: decodedBody.extensionOptions,
        nonCriticalExtensionOptions: decodedBody.nonCriticalExtensionOptions,
      };
    } catch (error) {
      console.error("Failed to decode bodyBytes:", error);
      return "Failed to decode bodyBytes";
    }
  };

  const decodeAuthInfoBytes = (authInfoBytes: Uint8Array) => {
    try {
      const decodedAuthInfo = AuthInfo.decode(authInfoBytes);
      return {
        signerInfos: decodedAuthInfo.signerInfos.map((signerInfo) => ({
          publicKey: signerInfo.publicKey
            ? decodePubkey(signerInfo.publicKey)
            : null,
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
      console.error("Failed to decode authInfoBytes:", error);
      return "Failed to decode authInfoBytes";
    }
  };

  const formatValue = (value: any): string => {
    if (value instanceof Uint8Array) {
      return Buffer.from(value).toString("base64");
    }
    if (typeof value === "object" && value !== null) {
      if ("bodyBytes" in value && "authInfoBytes" in value) {
        const decodedValue = {
          ...value,
          bodyBytes: decodeBodyBytes(value.bodyBytes),
          authInfoBytes: decodeAuthInfoBytes(value.authInfoBytes),
        };
        return JSON.stringify(
          decodedValue,
          (_, v) => (typeof v === "bigint" ? v.toString() : v),
          2
        );
      }
      return JSON.stringify(
        value,
        (_, v) => (typeof v === "bigint" ? v.toString() : v),
        2
      );
    }
    if (typeof value === "bigint") {
      return value.toString();
    }
    return String(value);
  };

  return (
    <div className="p-4 z-[100] flex flex-col w-full gap-3">
      <div className="flex flex-col gap-1">
        <a>Address</a>
        <pre className="bg-base-200 p-4 rounded-md text-sm overflow-auto max-h-48 ">
          {address}
        </pre>
      </div>
      <div className="flex flex-col gap-1">
        <a>Tx Info</a>
        <pre className="bg-base-200 p-4 rounded-md text-sm overflow-auto max-h-96 ">
          {formatValue(data.value)}
        </pre>
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
  const { address } = useChain("manifest");
  const walletIcon = wallet.wallet?.logo;
  const walletName = wallet.wallet?.prettyName;

  return (
    <Transition.Root show={visible} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[9999] overflow-y-auto"
        onClose={onClose}
      >
        <div className="fixed top-0 right-0 p-4 max-w-md w-full">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="bg-base-300 rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-base-300 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-l border-r border-t border-1 border-base-200 rounded-tr-md rounded-tl-md">
                <div className="sm:flex sm:items-start">
                  <div className="sm:flex sm:flex-row sm:justify-between w-full border-b pb-2 border-gray-600">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium"
                    >
                      <div className="flex flex-row justify-between w-full items-center gap-3">
                        <Image
                          src={walletIcon?.toString() ?? ""}
                          alt="Wallet type logo"
                          width={32}
                          height={32}
                          className="flex-shrink-0 aspect-1"
                        />
                        <h3 className="leading-6 text-xl">
                          {walletName?.toString()} Direct Signer
                        </h3>
                      </div>
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      X
                    </button>
                  </div>
                </div>
                <DisplayDataToSign data={data} address={address ?? ""} />
              </div>

              <div className="bg-base-100 py-3 px-6 flex flex-row-reverse justify-center gap-4 w-full border-l border-r border-b rounded-br-md rounded-bl-md border-1 border-base-200 items-center">
                <button
                  type="button"
                  className="w-1/2  justify-center rounded-md border btn btn-primary shadow-sm  text-sm "
                  onClick={() => {
                    approve();
                    onClose();
                  }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className=" w-1/2  justify-center rounded-md border btn btn-secondary shadow-sm text-sm"
                  onClick={() => {
                    reject();
                    onClose();
                  }}
                >
                  Reject
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SignModal;
