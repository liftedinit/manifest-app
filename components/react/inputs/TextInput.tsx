import React from 'react';
import { BaseInput } from './BaseInput';

export const TextInput: React.FC<React.ComponentProps<typeof BaseInput>> = props => (
  <BaseInput type="text" data-1p-ignore {...props} />
);
