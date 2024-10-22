import { useState, useEffect, useCallback } from 'react';
import { Contact } from '@/utils/types';
import Yup from '@/utils/yupExtensions';

const STORAGE_KEY = 'manifest.contacts';

const ContactSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').noProfanity(),
  address: Yup.string().required('Address is required').manifestAddress(),
});

const ContactsArraySchema = Yup.array().of(ContactSchema);

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const storedContacts = localStorage.getItem(STORAGE_KEY);
    if (storedContacts) {
      try {
        setContacts(JSON.parse(storedContacts));
      } catch (error) {
        console.error('Failed to parse contacts from localStorage', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveContacts = useCallback((newContacts: Contact[]) => {
    setContacts(newContacts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newContacts));
    } catch (error) {
      console.error('Failed to save contacts to localStorage', error);
    }
  }, []);

  const addContact = useCallback(
    (contact: Contact) => {
      saveContacts([...contacts, contact]);
    },
    [contacts, saveContacts]
  );

  const updateContact = useCallback(
    (index: number, updatedContact: Contact) => {
      const newContacts = contacts.map((contact, i) => (i === index ? updatedContact : contact));
      saveContacts(newContacts);
    },
    [contacts, saveContacts]
  );

  const removeContact = useCallback(
    (index: number) => {
      const newContacts = contacts.filter((_, i) => i !== index);
      saveContacts(newContacts);
    },
    [contacts, saveContacts]
  );

  const importContacts = useCallback(
    async (newContacts: Contact[]) => {
      try {
        await ContactsArraySchema.validate(newContacts);
        saveContacts([...contacts, ...newContacts]);
        return true;
      } catch (error) {
        console.error('Invalid contacts format', error);
        return false;
      }
    },
    [contacts, saveContacts]
  );

  const exportContacts = useCallback(() => {
    return JSON.stringify(contacts);
  }, [contacts]);

  return { contacts, addContact, updateContact, removeContact, importContacts, exportContacts };
}
