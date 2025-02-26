import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import React from 'react';

import { DefaultHandler } from '@/components/bank/handlers/defaultHandler';
import { QuestionIcon } from '@/components/icons';

import { TxMessage } from '../types';

export type Handler = (
  tx: TxMessage,
  address: string,
  metadata?: MetadataSDKType[]
) => {
  icon: React.ComponentType;
  message: React.ReactNode;
};

const handlerRegistry: { [key: string]: Handler } = {};

export function registerHandler(typeUrl: string, handler: Handler) {
  handlerRegistry[typeUrl] = handler;
}

export function getHandler(typeUrl: string): Handler {
  return handlerRegistry[typeUrl] || DefaultHandler;
}
