/* eslint-disable @next/next/no-img-element */
import type { ChainWalletBase, WalletModalProps } from 'cosmos-kit';
import { WalletStatus } from 'cosmos-kit';
import React, { useCallback, Fragment, useState, useMemo, useEffect } from 'react';
import { Dialog, Transition, Portal } from '@headlessui/react';
import {
  Connected,
  Connecting,
  Error,
  NotExist,
  QRCodeView,
  WalletList,
  Contacts,
  EmailInput,
  SMSInput,
} from './views';
import { useRouter } from 'next/router';
import { ToastProvider } from '@/contexts/toastContext';
import { Web3AuthClient, Web3AuthWallet } from '@cosmos-kit/web3auth';
import { useDeviceDetect } from '@/hooks';
import { State, ExpiredError } from '@cosmos-kit/core';

export enum ModalView {
  WalletList,
  QRCode,
  Connecting,
  Connected,
  Error,
  NotExist,
  Contacts,
  EmailInput,
  SMSInput,
}

export const TailwindModal: React.FC<
  WalletModalProps & {
    showContacts?: boolean;
    onSelect?: (address: string) => void;
    currentAddress?: string;
    showMemberManagementModal?: boolean;
    showMessageEditModal?: boolean;
  }
> = ({
  isOpen,
  setOpen,
  walletRepo,
  showContacts = false,
  onSelect,
  currentAddress,
  showMemberManagementModal = false,
  showMessageEditModal = false,
}) => {
  const [currentView, setCurrentView] = useState<ModalView>(ModalView.WalletList);
  const [qrWallet, setQRWallet] = useState<ChainWalletBase | undefined>();
  const [selectedWallet, setSelectedWallet] = useState<ChainWalletBase | undefined>();
  const [qrState, setQRState] = useState<State>(State.Init);
  const [qrMessage, setQrMessage] = useState<string>('');

  const current = walletRepo?.current;
  const currentWalletData = current?.walletInfo;

  const walletStatus = current?.walletStatus || WalletStatus.Disconnected;
  const currentWalletName = current?.walletName;
  const { isMobile } = useDeviceDetect();

  useEffect(() => {
    if (isOpen) {
      if (showContacts) {
        setCurrentView(ModalView.Contacts);
      } else {
        switch (walletStatus) {
          case WalletStatus.Disconnected:
            setCurrentView(ModalView.WalletList);
            break;
          case WalletStatus.Connecting:
            if (current?.walletInfo.mode === 'wallet-connect' && !isMobile) {
              setCurrentView(ModalView.QRCode);
            } else {
              setCurrentView(ModalView.Connecting);
            }
            break;
          case WalletStatus.Connected:
            setCurrentView(ModalView.Connected);
            break;
          case WalletStatus.Error:
            setCurrentView(ModalView.Error);
            break;
          case WalletStatus.Rejected:
            setCurrentView(ModalView.Error);
            break;
          case WalletStatus.NotExist:
            setCurrentView(ModalView.NotExist);
            break;
        }
      }
    }
  }, [isOpen, walletStatus, currentWalletName, showContacts, current?.walletInfo.mode, isMobile]);

  useEffect(() => {
    if (currentView === ModalView.QRCode && qrWallet) {
      (qrWallet.client as any)?.setActions?.({
        qrUrl: {
          state: (s: State) => setQRState(s),
          message: (msg: string) => setQrMessage(msg),
        },
        onError: (err: Error) => {
          if (err.message?.includes('No matching key')) {
            setQRState(State.Error);
            setQrMessage(err.message);
            qrWallet.setMessage?.(err.message);
          }
        },
      });
    }
  }, [currentView, qrWallet]);

  const onWalletClicked = useCallback(
    (name: string) => {
      const wallet = walletRepo?.getWallet(name);

      if (wallet?.walletInfo.prettyName === 'Email') {
        setCurrentView(ModalView.EmailInput);
        return;
      }
      if (wallet?.walletInfo.prettyName === 'SMS') {
        setCurrentView(ModalView.SMSInput);
        return;
      }

      setTimeout(() => {
        if (
          wallet?.walletInfo.name === 'cosmos-extension-metamask' &&
          wallet.message?.includes("Cannot read properties of undefined (reading 'request')")
        ) {
          setCurrentView(ModalView.NotExist);
          setSelectedWallet(wallet);
        } else if (wallet?.isWalletNotExist) {
          setCurrentView(ModalView.NotExist);
          setSelectedWallet(wallet);
        }
      }, 1);

      if (wallet?.walletInfo.mode === 'wallet-connect') {
        if (isMobile) {
          setCurrentView(ModalView.Connecting);
          walletRepo?.connect(name).catch(error => {
            console.error('Wallet connection error:', error);
            setCurrentView(ModalView.Error);
          });
          return;
        }

        setQRWallet(wallet);
        setCurrentView(ModalView.QRCode);

        const timeoutId = setTimeout(() => {
          if (wallet?.walletStatus === WalletStatus.Connecting) {
            wallet.disconnect();
            setCurrentView(ModalView.Error);
          }
        }, 30000);

        walletRepo
          ?.connect(name)
          .then(() => {
            if (wallet?.walletStatus === WalletStatus.Connected) {
              setCurrentView(ModalView.Connected);
            }
          })
          .catch(error => {
            console.error('Wallet connection error:', error);
            setCurrentView(ModalView.QRCode);
            setQRState(State.Error);
            setQrMessage(error.message);
          })
          .finally(() => {
            clearTimeout(timeoutId);
          });

        if (qrState === State.Pending && !wallet?.qrUrl?.data) {
          setCurrentView(ModalView.Connecting);
        }
      } else {
        setQRWallet(undefined);

        setCurrentView(ModalView.Connecting);

        const timeoutId = setTimeout(() => {
          if (wallet?.walletStatus === WalletStatus.Connecting) {
            wallet.disconnect();
            setCurrentView(ModalView.Error);
          }
        }, 30000);

        walletRepo
          ?.connect(name)
          .catch(error => {
            console.error('Wallet connection error:', error);
            setCurrentView(ModalView.Error);
          })
          .finally(() => {
            clearTimeout(timeoutId);
          });
      }
    },
    [walletRepo, isMobile, qrState, currentView]
  );

  useEffect(() => {
    if (!isOpen) {
      if (qrWallet?.walletStatus === WalletStatus.Connecting) {
        qrWallet.disconnect();
        setQRWallet(undefined);
      }
      setQRState(State.Init);
      setQrMessage('');
    }
  }, [isOpen, qrWallet]);

  const onCloseModal = useCallback(() => {
    if (qrWallet?.walletStatus === WalletStatus.Connecting) {
      qrWallet.disconnect();
    }
    setOpen(false);
  }, [setOpen, qrWallet]);

  const onReturnToWalletList = useCallback(() => {
    if (qrWallet?.walletStatus === WalletStatus.Connecting) {
      qrWallet.disconnect();
      setQRWallet(undefined);
    }
    setCurrentView(ModalView.WalletList);
  }, [qrWallet]);

  const _render = useMemo(() => {
    switch (currentView) {
      case ModalView.WalletList:
        return (
          <WalletList
            onClose={onCloseModal}
            onWalletClicked={onWalletClicked}
            wallets={walletRepo?.wallets || []}
          />
        );
      case ModalView.EmailInput:
        return (
          <EmailInput
            onClose={onCloseModal}
            onReturn={() => setCurrentView(ModalView.WalletList)}
            onSubmit={async email => {
              try {
                const emailWallet = walletRepo?.wallets.find(
                  w => w.walletInfo.prettyName === 'Email'
                ) as Web3AuthWallet | undefined;

                if (emailWallet?.client instanceof Web3AuthClient) {
                  emailWallet.client.setLoginHint(email);
                  await walletRepo?.connect(emailWallet.walletInfo.name);
                } else {
                  console.error('Email wallet or client not found');
                }
              } catch (error) {
                console.error('Email login error:', error);
                // Handle the error appropriately in your UI
              }
            }}
          />
        );

      case ModalView.SMSInput:
        return (
          <SMSInput
            onClose={onCloseModal}
            onReturn={() => setCurrentView(ModalView.WalletList)}
            onSubmit={phone => {
              const smsWallet = walletRepo?.wallets.find(w => w.walletInfo.prettyName === 'SMS') as
                | Web3AuthWallet
                | undefined;

              if (smsWallet?.client instanceof Web3AuthClient) {
                smsWallet.client.setLoginHint(phone);
                walletRepo?.connect(smsWallet.walletInfo.name);
              }
            }}
          />
        );
      case ModalView.Connected:
        return (
          <Connected
            onClose={onCloseModal}
            onReturn={() => setCurrentView(ModalView.WalletList)}
            disconnect={() => current?.disconnect()}
            name={currentWalletData?.prettyName!}
            logo={currentWalletData?.logo!.toString() ?? ''}
            username={current?.username}
            address={current?.address}
          />
        );
      case ModalView.Connecting:
        let subtitle: string;
        if (currentWalletData!?.mode === 'wallet-connect') {
          subtitle = `Approve ${currentWalletData!.prettyName} connection request on your mobile device.`;
        } else {
          subtitle = `Open the ${
            currentWalletData!?.prettyName
          } browser extension to connect your wallet.`;
        }

        return (
          <Connecting
            onClose={onCloseModal}
            onReturn={() => setCurrentView(ModalView.WalletList)}
            name={currentWalletData?.prettyName!}
            logo={currentWalletData?.logo!.toString() ?? ''}
            title="Requesting Connection"
            subtitle={subtitle}
          />
        );
      case ModalView.QRCode:
        return (
          <QRCodeView onClose={onCloseModal} onReturn={onReturnToWalletList} wallet={qrWallet!} />
        );
      case ModalView.Error:
        return (
          <Error
            currentWalletName={currentWalletName ?? ''}
            onClose={onCloseModal}
            onReturn={() => setCurrentView(ModalView.WalletList)}
            logo={currentWalletData?.logo!.toString() ?? ''}
            onReconnect={() => onWalletClicked(currentWalletData?.name!)}
          />
        );
      case ModalView.NotExist:
        return (
          <NotExist
            onClose={onCloseModal}
            onReturn={() => setCurrentView(ModalView.WalletList)}
            onInstall={() => {
              const link = selectedWallet?.downloadInfo?.link;
              if (link) window.open(link, '_blank', 'noopener,noreferrer');
            }}
            logo={selectedWallet?.walletInfo.logo?.toString() ?? ''}
            name={selectedWallet?.walletInfo.prettyName ?? ''}
          />
        );
      case ModalView.Contacts:
        return (
          <Contacts
            onClose={onCloseModal}
            onReturn={walletRepo ? () => setCurrentView(ModalView.WalletList) : undefined}
            selectionMode={Boolean(onSelect)}
            onSelect={onSelect}
            currentAddress={currentAddress}
            showMessageEditModal={showMessageEditModal}
          />
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center p-6 gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Reconnecting your wallet...</p>
            <div className="loading loading-ring w-8 h-8 text-primary" />
          </div>
        );
    }
  }, [
    currentView,
    onCloseModal,
    onWalletClicked,
    walletRepo,
    currentWalletData,
    current,
    onSelect,
    currentAddress,
    showMessageEditModal,
    selectedWallet,
    qrState,
    qrMessage,
    qrWallet,
    onReturnToWalletList,

    currentWalletName,
  ]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Portal>
        <Dialog as="div" className="relative z-[9999]" onClose={onCloseModal}>
          <div className="fixed inset-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel
                    className={`relative transform overflow-hidden rounded-xl dark:bg-[#1D192D] bg-[#FFFF] px-4 pt-2.5 pb-4 [min-height:18rem] text-left shadow-xl transition-all sm:my-8 sm:w-full ${
                      currentView === ModalView.WalletList ? 'sm:max-w-sm' : 'sm:max-w-2xl'
                    } sm:p-4`}
                  >
                    <ToastProvider>
                      <div className="h-full">{_render}</div>
                    </ToastProvider>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Portal>
    </Transition.Root>
  );
};
