import { Dialog } from '@headlessui/react';
import React from 'react';

import { SignModal } from '@/components';
import { useTx } from '@/hooks';

import env from '../../config/env';

export interface ModalDialogProps extends React.PropsWithChildren {
  open: boolean;
  onClose?: () => void;

  style?: React.CSSProperties;
  className?: string;
  panelClassName?: string;
  title?: React.ReactNode;
}

/**
 * A modal dialog that is used for signing transactions. This dialog will
 * not be closable while a transaction is being signed.
 * @param isOpen  Whether the modal is open.
 * @param onClose Callback to close the modal.
 * @param children  The content of the modal.
 * @constructor
 */
export const SigningModalDialog = ({
  open,
  children,
  onClose,
  title,
  style,
  className,
  panelClassName,
}: ModalDialogProps) => {
  const { isSigning } = useTx(env.chain);
  const [opened, setOpened] = React.useState(open);

  if (open && !opened) {
    setOpened(true);
  }

  const handleClose = () => {
    if (!isSigning) {
      setOpened(false);
      onClose && onClose();
    }
  };

  return (
    <Dialog
      open={opened}
      className={`modal ${open ? 'modal-open' : ''} fixed flex p-0 m-0 top-0 left-0 ${className}`}
      onClose={handleClose}
      style={{
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        ...style,
      }}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <Dialog.Panel
        className={`${panelClassName} modal-box mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg relative`}
        aria-label="modal"
      >
        <form method="dialog" onSubmit={handleClose}>
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]"
            disabled={isSigning}
          >
            ✕
          </button>
        </form>

        {title && (
          <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">{title}</h3>
        )}

        {children}

        <SignModal />
      </Dialog.Panel>
    </Dialog>
  );
};
