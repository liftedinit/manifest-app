import { Dialog } from '@headlessui/react';
import React from 'react';

interface DescriptionModalProps {
  open?: boolean;
  onClose: () => void;
  details: string;
  type?: 'group' | 'validator';
}

export function DescriptionModal({
  open,
  onClose,
  details,
  type,
}: Readonly<DescriptionModalProps>) {
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="modal modal-open mx-auto fixed flex p-0 m-0 top-0 z-[9999]"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <Dialog.Panel>
        <form method="dialog" className="modal-box ">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            aria-label="x-close"
            onClick={onClose}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg">
            {type === 'validator' ? 'Validator' : 'Group'}&nbsp;Description
          </h3>

          <div className="divider divider-horizon -mt-0 -mb-2"></div>
          <div className="py-4 flex flex-col gap-4">
            <p className="">{details}</p>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
