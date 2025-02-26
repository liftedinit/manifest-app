import { useChain } from '@cosmos-kit/react';
import { Dialog } from '@headlessui/react';
import React from 'react';
import { MdContacts } from 'react-icons/md';

import { Contacts, TextInput } from '@/components';
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
        name={name}
        value={value}
        disabled={disabled}
        rightElement={
          <div className="flex gap-2">
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
          </div>
        }
        {...props}
      />

      {!disabled && showContacts && (
        <Dialog
          className={`modal modal-open fixed flex p-0 m-0 z-1`}
          style={{
            height: '100vh',
            width: '100vw',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClose={() => setShowContacts(false)}
          open={showContacts}
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <Dialog.Panel className="modal-box bg-secondary rounded-[24px] p-6">
            <Contacts
              onClose={() => setShowContacts(false)}
              currentAddress={address ?? ''}
              onSelect={address => {
                setValue(address);
                onChange?.({ target: { name, value: address } } as any);
              }}
              selectionMode
            />
          </Dialog.Panel>
        </Dialog>
      )}
    </>
  );
};
