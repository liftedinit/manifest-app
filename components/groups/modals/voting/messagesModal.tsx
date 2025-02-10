import { CloseIcon, defaultFields, importantFields, messageSyntax } from '@/components';
import React from 'react';
import { ProposalSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { useTheme } from '@/contexts';
import { Dialog } from '@headlessui/react';

export function MessagesModal({
  proposal,
  opened,
  onClose,
}: {
  proposal: ProposalSDKType | undefined;
  opened: boolean;
  onClose: () => void;
}) {
  const { theme } = useTheme();

  if (!proposal) return null;

  return (
    <Dialog open={opened} onClose={onClose} className="modal modal-open fixed flex p-0 m-0">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <Dialog.Panel className="modal-box max-w-4xl m-auto" aria-label="proposal-messages-dialog">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">Proposal Messages</h3>
        <div className="overflow-y-auto max-h-[60vh]">
          {proposal.messages?.map((message: any, index: number) => {
            const messageType = message['@type'];
            const fieldsToShow = importantFields[messageType] || defaultFields;

            return (
              <div key={index} className="mb-6 bg-base-300 p-4 rounded-[12px]">
                <h3 aria-label="msg" className="text-lg font-semibold mb-2 text-primary-content">
                  {messageType.split('.').pop().replace('Msg', '')}
                </h3>
                <div className="font-mono">
                  <pre
                    className="whitespace-pre-wrap break-words bg-base-200 p-4 rounded-lg text-sm overflow-x-auto"
                    aria-label="message-json-modal"
                  >
                    {messageSyntax(fieldsToShow, message, theme)}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
