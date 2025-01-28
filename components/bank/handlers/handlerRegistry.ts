import React from 'react';
import { QuestionIcon } from '@/components/icons';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { TxMessage } from '../types';

export type Handler = (
  tx: TxMessage,
  address: string,
  metadata?: MetadataSDKType[]
) => {
  icon: React.ComponentType;
  message: string;
};

const handlerRegistry: { [key: string]: Handler } = {};

export function registerHandler(typeUrl: string, handler: Handler) {
  handlerRegistry[typeUrl] = handler;
}

export function getHandler(typeUrl: string): Handler {
  return handlerRegistry[typeUrl] || { icon: QuestionIcon, message: 'Unknown transaction type' };
}
