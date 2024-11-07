import React, { createContext, useContext, useState } from 'react';

interface ContactsModalContextType {
  isContactsOpen: boolean;
  setContactsOpen: (open: boolean) => void;
}

const ContactsModalContext = createContext<ContactsModalContextType | undefined>(undefined);

export function ContactsModalProvider({ children }: { children: React.ReactNode }) {
  const [isContactsOpen, setContactsOpen] = useState(false);

  return (
    <ContactsModalContext.Provider value={{ isContactsOpen, setContactsOpen }}>
      {children}
    </ContactsModalContext.Provider>
  );
}

export function useContactsModal() {
  const context = useContext(ContactsModalContext);
  if (context === undefined) {
    throw new Error('useContactsModal must be used within a ContactsModalProvider');
  }
  return context;
}
