import { Dialog } from '@headlessui/react';
import { XMarkIcon, ChevronLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useState, useCallback } from 'react';
import { MdContacts } from 'react-icons/md';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput } from '@/components/react/inputs';
import { Contact } from '@/utils/types';
import { TruncatedAddressWithCopy } from '../addressCopy';
import { useContacts } from '@/hooks/useContacts';
import { saveAs } from 'file-saver';
import { useToast } from '@/contexts/toastContext';
import { SearchIcon } from '@/components/icons';

export const Contacts = ({
  onClose,
  onReturn,
  selectionMode = false,
  onSelect,
  currentAddress,
  showMemberManagementModal = false,
  showMessageEditModal = false,
}: {
  onClose: () => void;
  onReturn?: () => void;
  selectionMode?: boolean;
  onSelect?: (address: string) => void;
  currentAddress?: string;
  showMemberManagementModal?: boolean;
  showMessageEditModal?: boolean;
}) => {
  const { contacts, addContact, updateContact, removeContact, importContacts, exportContacts } =
    useContacts();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { setToastMessage } = useToast();

  const ContactSchema = Yup.object().shape({
    name: Yup.string().required('Name is required').noProfanity(),
    address: Yup.string().required('Address is required').manifestAddress(),
  });

  const handleAddContact = useCallback(
    (values: Contact) => {
      addContact(values);
      setIsAdding(false);
    },
    [addContact]
  );

  const handleSaveContact = useCallback(
    (index: number, values: Contact) => {
      updateContact(index, values);
      setEditingIndex(null);
    },
    [updateContact]
  );

  const handleRemoveContact = useCallback(
    (index: number) => {
      removeContact(index);
    },
    [removeContact]
  );

  const handleImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async e => {
          const content = e.target?.result as string;
          try {
            const importedContacts = JSON.parse(content);
            const success = await importContacts(importedContacts);
            if (success) {
              setToastMessage({
                type: 'alert-success',
                title: 'Import Successful',
                description: 'Contacts imported successfully',
              });
            } else {
              setToastMessage({
                type: 'alert-error',
                title: 'Import Failed',
                description: 'Failed to import contacts. Please check the file format.',
              });
            }
          } catch (error) {
            console.error('Error parsing imported file', error);
            setToastMessage({
              type: 'alert-error',
              title: 'Import Failed',
              description: 'Failed to import contacts. Please check the file format.',
            });
          }
        };
        reader.readAsText(file);
      }
    },
    [importContacts, setToastMessage]
  );

  const handleExport = useCallback(() => {
    const blob = new Blob([exportContacts()], { type: 'application/json;charset=utf-8' });
    saveAs(blob, 'contacts.json');
    setToastMessage({
      type: 'alert-success',
      title: 'Export Successful',
      description: 'Contacts exported successfully',
    });
  }, [exportContacts, setToastMessage]);

  const filteredContacts = contacts.filter(
    contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAdding) {
    // Render the add contact form in a separate view
    return (
      <div className="p-2 w-full mx-auto pt-4">
        <div className="flex justify-between items-center -mt-4 mb-6">
          {onReturn ? (
            <button
              type="button"
              className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={onReturn}
            >
              <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
          <Dialog.Title as="h3" className="text-md font-semibold">
            Add Contact
          </Dialog.Title>
          <button
            type="button"
            className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            <XMarkIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <Formik
          initialValues={{ name: '', address: '' }}
          validationSchema={ContactSchema}
          onSubmit={handleAddContact}
        >
          {({ isValid, dirty }) => (
            <Form className="space-y-4">
              <TextInput
                label="Name"
                name="name"
                placeholder="Enter name"
                className="input-md w-full"
                style={{ borderRadius: '12px' }}
              />
              <TextInput
                label="Address"
                name="address"
                placeholder="Enter address"
                className="input-md w-full"
                style={{ borderRadius: '12px' }}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="btn rounded-[12px] focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A] mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-gradient" disabled={!isValid || !dirty}>
                  Add Contact
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    );
  }

  // Main contacts view with search bar and contacts list
  return (
    <div className="p-2 w-full mx-auto pt-4">
      <div className="flex justify-between items-center -mt-4 mb-6">
        {onReturn ? (
          <button
            type="button"
            className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={onReturn}
          >
            <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
        <div className="flex flex-row gap-2 items-center">
          <MdContacts className="w-8 h-8 text-primary" />
          <Dialog.Title as="h3" className="text-md font-semibold">
            {selectionMode ? 'Select Contact' : 'Contacts'}
          </Dialog.Title>
        </div>
        <button
          type="button"
          className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {selectionMode && currentAddress && (
        <button
          onClick={() => {
            if (onSelect) {
              onSelect(currentAddress);
              onClose();
              if (showMemberManagementModal) {
                (
                  document.getElementById('member-management-modal') as HTMLDialogElement
                ).showModal();
              }
              if (showMessageEditModal) {
                (document.getElementById('message_edit_modal') as HTMLDialogElement).showModal();
              }
            }
          }}
          className="btn btn-gradient w-full mb-4"
        >
          Use My Address
        </button>
      )}

      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search contacts..."
          className="input input-md w-full pr-8 bg-[#0000000A] dark:bg-[#FFFFFF0F] text-[#161616] dark:text-white placeholder-[#00000099] dark:placeholder-[#FFFFFF99] focus:outline-none focus:ring-0"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ borderRadius: '12px' }}
        />
        <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00000099] dark:text-[#FFFFFF99]" />
      </div>

      {filteredContacts.length > 0 ? (
        <div className="mb-6 max-h-[37vh] overflow-y-auto space-y-2">
          {filteredContacts.map((contact, index) => {
            if (editingIndex === index && !selectionMode) {
              // Only show edit form if not in selection mode
              return (
                <Formik
                  key={index}
                  initialValues={{ name: contact.name, address: contact.address }}
                  validationSchema={ContactSchema}
                  onSubmit={values => handleSaveContact(index, values)}
                >
                  {({ isValid, dirty }) => (
                    <Form className="space-y-2 p-2 bg-[#0000000A] dark:bg-[#FFFFFF0F] rounded-xl mb-2">
                      <TextInput
                        label="Name"
                        name="name"
                        placeholder="Enter name"
                        className="input-sm w-full"
                        style={{ borderRadius: '12px' }}
                      />
                      <TextInput
                        label="Address"
                        name="address"
                        placeholder="Enter address"
                        className="input-sm w-full"
                        style={{ borderRadius: '12px' }}
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="btn  focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A] btn-xs mr-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-gradient btn-xs"
                          disabled={!isValid || !dirty}
                        >
                          Save
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              );
            } else {
              return (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between p-4 
                    bg-[#0000000A] dark:bg-[#FFFFFF0F] 
                    rounded-[16px] 
                    ${
                      selectionMode
                        ? `
                      cursor-pointer 
                      hover:bg-primary hover:bg-opacity-10
                      dark:hover:bg-primary dark:hover:bg-opacity-10
                  
                      transform transition-all duration-200 
                      
                    `
                        : ''
                    }
                  `}
                  onClick={() => {
                    if (selectionMode && onSelect) {
                      onSelect(contact.address);
                      onClose();
                      if (showMemberManagementModal) {
                        (
                          document.getElementById('member-management-modal') as HTMLDialogElement
                        ).showModal();
                      }
                      if (showMessageEditModal) {
                        (
                          document.getElementById('message_edit_modal') as HTMLDialogElement
                        ).showModal();
                      }
                    }
                  }}
                >
                  <div>
                    <p
                      className={`
                      text-lg font-semibold 
                      text-[#161616] dark:text-white
                      ${selectionMode ? 'group-hover:text-primary' : ''}
                    `}
                    >
                      {contact.name}
                    </p>
                    <p className="text-sm text-[#00000099] dark:text-[#FFFFFF99] xs:block hidden">
                      <TruncatedAddressWithCopy address={contact.address} slice={24} />
                    </p>
                    <p className="text-sm text-[#00000099] dark:text-[#FFFFFF99] xs:hidden block">
                      <TruncatedAddressWithCopy address={contact.address} slice={14} />
                    </p>
                  </div>
                  {!selectionMode && (
                    <div className="flex items-center">
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="ml-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-blue-500"
                      >
                        <PencilIcon className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleRemoveContact(index)}
                        className="ml-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-red-500"
                      >
                        <XMarkIcon className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>
      ) : (
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
          No contacts found.
        </p>
      )}

      {!selectionMode && (
        <>
          <button onClick={() => setIsAdding(true)} className="btn btn-gradient w-full">
            Add New Contact
          </button>

          <div className="flex w-full flex-row gap-2 justify-between mt-6">
            <label className="btn w-[48%] btn-primary btn-outline btn-sm">
              Import Contacts
              <input type="file" className="hidden" onChange={handleImport} accept=".json" />
            </label>
            <button onClick={handleExport} className="btn btn-sm btn-primary w-[48%] btn-outline">
              Export Contacts
            </button>
          </div>
        </>
      )}
    </div>
  );
};
