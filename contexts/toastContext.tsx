// ToastContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Toast, ToastMessage } from '@/components/toast';

interface ToastContextType {
  toastMessage: ToastMessage | null;
  setToastMessage: (message: ToastMessage | null) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ToastContext.Provider value={{ toastMessage, setToastMessage }}>
      {mounted &&
        createPortal(
          <Toast toastMessage={toastMessage} setToastMessage={setToastMessage} />,
          document.body
        )}
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
