import { Dialog } from '@headlessui/react';
import React from 'react';

import { SignModal } from '@/components';
import { useTx } from '@/hooks';

import env from '../../config/env';

export interface ModalDialogProps extends React.PropsWithChildren {
  open: boolean;
  onClose?: () => boolean | void;

  style?: React.CSSProperties;
  className?: string;
  panelClassName?: string;
  title?: React.ReactNode;
  disabled?: boolean;
  icon?: React.ComponentType<{ className: string }>;
}

export interface SigningModalDialogProps extends ModalDialogProps {}

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
  ...props
}: SigningModalDialogProps) => {
  const { isSigning } = useTx(env.chain);

  const handleClose = () => {
    if (!isSigning) {
      onClose && onClose();
      return true;
    }
    return false;
  };

  return (
    <ModalDialog open={open} onClose={handleClose} disabled={isSigning} {...props}>
      {children}

      <SignModal />
    </ModalDialog>
  );
};

/**
 * A modal dialog that is used for general purposes. This is styled for the Manifest App.
 *
 * @todo remove `panelClassName` and `disabled` props and use `size` and a different approach for
 *       disabling the buttons during signing in general.
 * @param open Whether the modal is open.
 * @param onClose Callback to close the modal.
 * @param panelClassName The class name for the dialog panel.
 * @param disabled Whether the dialog's X close button is disabled.
 * @param title The title of the dialog.
 * @param style The style of the dialog.
 * @param className The CSS classes for the dialog.
 * @param children The content of the dialog.
 */
export const ModalDialog = ({
  open,
  onClose,
  panelClassName,
  disabled,
  title,
  style,
  className,
  children,
  icon: Icon,
}: ModalDialogProps) => {
  const [opened, setOpened] = React.useState(open);
  if (open && !opened) {
    setOpened(true);
  }
  function handleClose(value: any) {
    if (onClose && onClose() === false) {
      setOpened(true);
      return;
    }
    setOpened(false);
  }

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
      <div className="fixed inset-0 bg-black/30 " aria-hidden="true" />

      <Dialog.Panel
        className={`${panelClassName} modal-box mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg relative`}
        aria-label="modal"
      >
        <form method="dialog" onSubmit={handleClose}>
          <button
            role="button"
            aria-label="Close"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]"
            disabled={disabled}
          >
            ✕
          </button>
        </form>

        {title && (
          <h3
            role="heading"
            aria-label="Title"
            className="flex flex-row gap-2 items-center text-xl font-semibold text-[#161616] dark:text-white mb-6"
          >
            {Icon ? <Icon className="w-8 h-8 text-primary" /> : undefined}
            {title}
          </h3>
        )}

        {children}
      </Dialog.Panel>
    </Dialog>
  );
};
