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
  addContact: (contact: Contact) => boolean;
  updateContact: (index: ContactIndex, contact: Contact) => void;
  removeContact: (index: ContactIndex) => void;
  importContacts: (contacts: Contact[]) => Promise<boolean>;
  exportContacts: () => string;
}

export const ContactsContext = createContext<ContactsContextType>({
  contacts: [],
  addContact: () => false,
  updateContact: () => {},
  removeContact: () => {},
  importContacts: async () => false,
  exportContacts: () => '{}',
});

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useLocalStorage<Contact[]>(STORAGE_KEY, []);

  const findIndex = (index: ContactIndex) => {
    return typeof index === 'number'
      ? index
      : contacts.findIndex(c => c.name === index.name || c.address === index.address);
  };

  const updateContact = (index: ContactIndex, updatedContact: Contact) => {
    const toUpdate = findIndex(index);
    const c = ContactSchema.validateSync(updatedContact);

    setContacts(contacts.map((contact, i) => (i === toUpdate ? c : contact)));
  };

  const addContact = (contact: Contact, rethrow = false) => {
    try {
      contact = ContactSchema.validateSync(contact);
    } catch (error) {
      if (rethrow) {
        throw error;
      }
      return false;
    }

    if (contacts.some(c => c.address === contact.address)) {
      updateContact(contact, contact);
    } else {
      setContacts([...contacts, contact]);
    }
    return true;
  };

  const removeContact = (index: ContactIndex) => {
    const toRemove = findIndex(index);
    const newContacts = contacts.filter((_, i) => i !== toRemove);
    setContacts(newContacts);
  };

  const importContacts = async (newContacts: Contact[]) => {
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
  };

  const exportContacts = () => JSON.stringify(contacts);

  return (
    <ContactsContext.Provider
      value={{ contacts, addContact, removeContact, updateContact, importContacts, exportContacts }}
    >
      {children}
    </ContactsContext.Provider>
  );
};

export function useContacts() {
  return useContext(ContactsContext);
}
