// ToastContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { Toast, ToastMessage } from '@/components/toast';

interface ToastContextType {
  toastMessage: ToastMessage | null;
  setToastMessage: (message: ToastMessage | null) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  return (
    <ToastContext.Provider value={{ toastMessage, setToastMessage }}>
      {children}
      <Toast toastMessage={toastMessage} setToastMessage={setToastMessage} />
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
