import React from 'react';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import DOMPurify from 'dompurify';
import { QuestionIcon } from '@/components/icons/QuestionIcon';
import { TxMessage } from '../types';

// The HTML message returned by this handler builder is sanitized.
export function createSenderReceiverHandler({
  iconSender,
  iconReceiver,
  successSender,
  failSender,
  successReceiver,
  failReceiver,
}: {
  iconSender: React.ComponentType;
  iconReceiver?: React.ComponentType;
  successSender:
    | string
    | ((tx: TxMessage, address: string, metadata?: MetadataSDKType[]) => string);
  failSender: string | ((tx: TxMessage, address: string, metadata?: MetadataSDKType[]) => string);
  successReceiver:
    | string
    | ((tx: TxMessage, address: string, metadata?: MetadataSDKType[]) => string);
  failReceiver?: string | ((tx: TxMessage, address: string) => string);
}) {
  const sanitizeMessage = (msg: string) => DOMPurify.sanitize(msg);

  return (tx: TxMessage, address: string, metadata?: MetadataSDKType[]) => {
    const isSender = tx.sender === address;
    const hasError = !!tx.error;

    iconSender = iconSender ?? QuestionIcon;
    iconReceiver = iconReceiver ?? iconSender ?? QuestionIcon;

    const resolveMessage = (
      msg: string | ((tx: TxMessage, address: string, metadata?: MetadataSDKType[]) => string)
    ) => (typeof msg === 'function' ? msg(tx, address, metadata) : msg);

    const successSenderMsg = sanitizeMessage(resolveMessage(successSender));
    const failSenderMsg = sanitizeMessage(resolveMessage(failSender));
    const successReceiverMsg = sanitizeMessage(resolveMessage(successReceiver));
    const failReceiverMsg = sanitizeMessage(resolveMessage(failReceiver ?? 'Anomaly detected'));

    return {
      icon: isSender ? iconSender : iconReceiver,
      message: hasError
        ? isSender
          ? failSenderMsg
          : failReceiverMsg
        : isSender
          ? successSenderMsg
          : successReceiverMsg,
    };
  };
}
