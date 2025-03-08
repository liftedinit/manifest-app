import { useChain } from '@cosmos-kit/react';
import React from 'react';
import { MdContacts } from 'react-icons/md';

import { ContactsModal, TextInput } from '@/components';
import { BaseInputProps } from '@/components/react/inputs/BaseInput';

import env from '../../../config/env';

export interface AddressInputProps extends BaseInputProps {
  rightElement?: React.ReactNode;
  name: string;
  small?: boolean;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value: initialValue,
  name,
  onChange,
  rightElement,
  disabled,
  small,
  ...props
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [showContacts, setShowContacts] = React.useState(false);
  const { address } = useChain(env.chain);

  return (
    <>
      <TextInput
        onChange={e => {
          setValue(e.target.value);
          onChange?.(e);
        }}
        className="pr-4"
        name={name}
        value={value}
        disabled={disabled}
        rightElement={
          <>
            {!disabled && (
              <button
                type="button"
                onClick={() => setShowContacts(true)}
                className={`btn btn-primary text-white ${small ? 'btn-xs' : 'btn-sm'}`}
              >
                <MdContacts className={small ? 'w-4 h-4' : 'w-5 h-5'} />
              </button>
            )}
            {rightElement}
          </>
        }
        {...props}
      />

      {!disabled && showContacts && (
        <ContactsModal
          open={showContacts}
          onClose={() => setShowContacts(false)}
          onSelect={value => {
            setValue(value);
            onChange?.({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);
            setShowContacts(false);
          }}
          address={address}
        />
      )}
    </>
  );
};
