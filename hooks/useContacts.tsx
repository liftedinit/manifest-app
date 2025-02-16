import { useCallback, createContext, ReactNode, useContext } from 'react';
import { Contact } from '@/utils/types';
import Yup from '@/utils/yupExtensions';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const STORAGE_KEY = 'manifest.contacts';

const ContactSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').noProfanity(),
  address: Yup.string().required('Address is required').manifestAddress(),
});

const ContactsArraySchema = Yup.array().of(ContactSchema);

export type ContactIndex = Partial<Contact> | number;

export interface ContactsContextType {
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  updateContact: (index: ContactIndex, contact: Contact) => void;
  removeContact: (index: ContactIndex) => void;
  importContacts: (contacts: Contact[]) => Promise<boolean>;
  exportContacts: () => string;
}

export const ContactsContext = createContext<ContactsContextType>({
  contacts: [],
  addContact: () => {},
  updateContact: () => {},
  removeContact: () => {},
  importContacts: async () => false,
  exportContacts: () => '{}',
});

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useLocalStorage<Contact[]>(STORAGE_KEY, []);

  function findIndex(index: ContactIndex): number {
    return typeof index === 'number' ? index : contacts.findIndex((c) => c.name === index || c.address === index)
  }

  const addContact = useCallback(
    (contact: Contact) => {
      if (contacts.some((c) => c.address === contact.address)) {
        updateContact(contact, contact);
      } else {
        setContacts([...contacts, contact]);
      }
    },
    [contacts, setContacts]
  );

  const removeContact = useCallback(
    (index: ContactIndex) => {
      const toRemove = findIndex(index);
      const newContacts = contacts.filter((_, i) => i !== toRemove);
      setContacts(newContacts);
    },
    [contacts, setContacts]
  );

  const updateContact = useCallback(
    (index: ContactIndex, updatedContact: Contact) => {
      const toUpdate = findIndex(index);
      const newContacts = contacts.map((contact, i) => (i === toUpdate ? updatedContact : contact));
      setContacts(newContacts);
    },
    [contacts, setContacts]
  );

  const importContacts = useCallback(
    async (newContacts: Contact[]) => {
      try {
        await ContactsArraySchema.validate(newContacts);

        for (const contact of newContacts) {
          addContact(contact);
        }
        return true;
      } catch (error) {
        console.error('Invalid contacts format', error);
        return false;
      }
    },
    [contacts, setContacts]
  );

  const exportContacts = useCallback(() => {
    return JSON.stringify(contacts);
  }, [contacts]);

  return (
    <ContactsContext.Provider value={{ contacts, addContact, removeContact, updateContact, importContacts, exportContacts }}>
      {children}
    </ContactsContext.Provider>
  );
};

export function useContacts() {
  return useContext(ContactsContext);
}
