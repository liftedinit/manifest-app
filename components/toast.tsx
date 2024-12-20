import React, { useEffect, useState, useRef } from 'react';

import Link from 'next/link';
import Confetti from 'react-confetti';
import { CloseIcon, CopyIcon, BroadcastingIcon } from './icons';

export interface ToastMessage {
  type: string;
  title: string;
  description?: string;
  link?: string;
  bgColor?: string;
}

interface ToastProps {
  toastMessage: ToastMessage | null;
  setToastMessage: (msg: ToastMessage | null) => void;
}

export const Toast: React.FC<ToastProps> = ({ toastMessage, setToastMessage }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [prevMessage, setPrevMessage] = useState<ToastMessage | null>(null);

  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastMessage) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setToastMessage(null), 300);
      }, 9700);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  useEffect(() => {
    if (toastMessage && (!prevMessage || toastMessage.type !== prevMessage.type)) {
      setPrevMessage(toastMessage);
    }
  }, [toastMessage, prevMessage]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setToastMessage(null), 300);
  };

  if (!toastMessage) {
    return null;
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'alert-success':
        return 'border-[#87FFA9]';
      case 'alert-error':
        return 'border-[#FF17A2]';
      case 'alert-warning':
        return 'border-[#FFFF87]';
      case 'alert-info':
      default:
        return 'border-[#A087FF]';
    }
  };

  const toastContent = (
    <div
      className="fixed inset-0 pointer-events-none flex items-end justify-end p-4"
      style={{
        zIndex: 2147483647,
        position: 'fixed',
      }}
    >
      <div className="toast toast-end toast-bottom flex flex-col justify-start items-center text-left pointer-events-auto">
        <div
          ref={toastRef}
          style={{
            borderRadius: '30px',
            position: 'relative',
          }}
          className={`alert ${toastMessage.type} w-96 relative
            transition-all duration-300 ease-in-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            ${prevMessage && prevMessage.type !== toastMessage.type ? 'animate-pulse' : ''}
            bg-white dark:bg-[#0E0A1F] border-2 ${getBorderColor(toastMessage.type)}
            text-black dark:text-white shadow-lg overflow-hidden`}
        >
          {toastMessage.type === 'alert-success' && (
            <Confetti
              width={384}
              height={160}
              gravity={0.04}
              wind={0.001}
              recycle={false}
              numberOfPieces={600}
            />
          )}
          <button
            type="button"
            className="p-2 text-[#161616] dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-[#00000033] absolute top-2 right-2 transition-colors duration-200 z-10"
            onClick={handleClose}
          >
            <CloseIcon className="w-3 h-3" aria-hidden="true" />
          </button>
          <div className="flex flex-col w-full h-full overflow-hidden">
            <div className="flex flex-row items-center gap-2 mb-2">
              {toastMessage.type === 'alert-info' && (
                <BroadcastingIcon className="w-6 h-6" aria-hidden="true" />
              )}
              <h3 className="text-lg font-semibold">{toastMessage.title}</h3>
            </div>
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pr-2">
              <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {toastMessage.description}
              </div>
              {toastMessage.link && (
                <Link
                  href={toastMessage.link}
                  className="text-primary hover:text-primary/60 dark:text-primary  underline mt-[0.1rem] inline-block transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Block explorer link
                </Link>
              )}
            </div>
            {toastMessage.type === 'alert-error' && (
              <button
                type="button"
                id="copyButton3"
                className="p-1 text-[#161616] dark:text-white absolute bottom-2 right-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#00000033] transition-colors duration-200"
                onClick={() => {
                  navigator.clipboard.writeText(toastMessage.description || '');
                  const button = document.getElementById('copyButton3');
                  if (button) {
                    const originalContent = button.innerHTML;
                    button.innerHTML =
                      '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
                    setTimeout(() => {
                      button.innerHTML = originalContent;
                    }, 2000);
                  }
                }}
              >
                <CopyIcon className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? toastContent : null;
};
