import React, { useState } from 'react';
import { ProposalFormData, ProposalAction, Message, MessageFields } from '@/helpers/formReducer';
import * as initialMessages from './messages';

import { TextInput } from '@/components/react/inputs';
import { Formik, Form, Field, FieldProps, FormikProps } from 'formik';
import Yup from '@/utils/yupExtensions';
import { ArrowRightIcon, ArrowUpIcon, MinusIcon, SearchIcon, PlusIcon } from '@/components/icons';
import { FiEdit } from 'react-icons/fi';
export default function ProposalMessages({
  formData,
  dispatch,
  nextStep,
  prevStep,
}: Readonly<{
  nextStep: () => void;
  prevStep: () => void;
  formData: ProposalFormData;
  dispatch: React.Dispatch<ProposalAction>;
}>) {
  const [isFormValid, setIsFormValid] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<boolean[]>(
    formData.messages.map(() => false)
  );
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const messageCategories = [
    'All',
    'Admins',
    'Group Management',
    'Proposal Actions',
    'Financial',
    'System',
  ];

  const messageTypes = [
    { name: 'send', category: 'Financial' },

    { name: 'removeValidator', category: 'Admins' },
    { name: 'removePendingValidator', category: 'Admins' },
    { name: 'updatePoaParams', category: 'System' },
    { name: 'updateStakingParams', category: 'System' },
    { name: 'setPower', category: 'Group Management' },
    { name: 'updateManifestParams', category: 'System' },
    { name: 'payoutStakeholders', category: 'Financial' },
    { name: 'updateGroupAdmin', category: 'Group Management' },
    { name: 'updateGroupMetadata', category: 'Group Management' },
    { name: 'updateGroupPolicyAdmin', category: 'Group Management' },

    { name: 'vote', category: 'Proposal Actions' },
    { name: 'withdrawProposal', category: 'Proposal Actions' },
    { name: 'exec', category: 'Proposal Actions' },
    { name: 'leaveGroup', category: 'Group Management' },
    { name: 'multiSend', category: 'Financial' },
    { name: 'softwareUpgrade', category: 'System' },
    { name: 'cancelUpgrade', category: 'System' },
  ];

  const filteredMessageTypes = messageTypes.filter(
    type =>
      (selectedCategory === 'All' || type.category === selectedCategory) &&
      type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkFormValidity = () => {
    const valid = formData.messages.length > 0 && formData.messages.some(isMessageValid);
    setIsFormValid(valid);
  };

  const handleAddMessage = () => {
    dispatch({
      type: 'ADD_MESSAGE',
      message: initialMessages.initialSendMessage,
    });
    setVisibleMessages([...visibleMessages, false]);
    checkFormValidity();
  };

  const handleRemoveMessage = (index: number) => {
    dispatch({ type: 'REMOVE_MESSAGE', index });
    setVisibleMessages(visibleMessages.filter((_, i) => i !== index));
    checkFormValidity();
  };

  const handleChangeMessage = (index: number, field: MessageFields, value: any) => {
    let updatedMessage = { ...formData.messages[index] };

    if (field === 'type') {
      switch (value) {
        case 'send':
          updatedMessage = {
            ...initialMessages.initialSendMessage,
            type: value,
          };
          break;
        case 'customMessage':
          updatedMessage = {
            ...initialMessages.initialCustomMessage,
            type: value,
          };
          break;
        case 'removeValidator':
          updatedMessage = {
            ...initialMessages.initialRemoveValidatorMessage,
            type: value,
            sender: '',
            validator_address: '',
          };
          break;
        case 'removePendingValidator':
          updatedMessage = {
            ...initialMessages.initialRemovePendingMessage,
            type: value,
          };
          break;
        case 'updatePoaParams':
          updatedMessage = {
            ...initialMessages.initialUpdatePoaParamsMessage,
            type: value,
          };
          break;
        case 'updateStakingParams':
          updatedMessage = {
            ...initialMessages.initialUpdateStakingParamsMessage,
            type: value,
          };
          break;
        case 'setPower':
          updatedMessage = {
            ...initialMessages.initialSetPowerMessage,
            type: value,
          };
          break;
        case 'updateManifestParams':
          updatedMessage = {
            ...initialMessages.initialUpdateManifestParamsMessage,
            type: value,
          };
          break;
        case 'payoutStakeholders':
          updatedMessage = {
            ...initialMessages.initialPayoutStakeholdersMessage,
            type: value,
          };
          break;
        case 'updateGroupAdmin':
          updatedMessage = {
            ...initialMessages.initialUpdateGroupAdminMessage,
            type: value,
          };
          break;
        case 'updateGroupMembers':
          updatedMessage = {
            ...initialMessages.initialUpdateGroupMembersMessage,
            type: value,
          };
          break;
        case 'updateGroupMetadata':
          updatedMessage = {
            ...initialMessages.initialUpdateGroupMetadataMessage,
            type: value,
          };
          break;
        case 'updateGroupPolicyAdmin':
          updatedMessage = {
            ...initialMessages.initialUpdateGroupPolicyAdminMessage,
            type: value,
          };
          break;
        case 'createGroupWithPolicy':
          updatedMessage = {
            ...initialMessages.initialCreateGroupWithPolicyMessage,
            type: value,
          };
          break;
        case 'submitProposal':
          updatedMessage = {
            ...initialMessages.initialSubmitProposalMessage,
            type: value,
          };
          break;
        case 'vote':
          updatedMessage = {
            ...initialMessages.initialVoteMessage,
            type: value,
          };
          break;
        case 'withdrawProposal':
          updatedMessage = {
            ...initialMessages.initialWithdrawProposalMessage,
            type: value,
          };
          break;
        case 'exec':
          updatedMessage = {
            ...initialMessages.initialExecMessage,
            type: value,
          };
          break;
        case 'leaveGroup':
          updatedMessage = {
            ...initialMessages.initialLeaveGroupMessage,
            type: value,
          };
          break;
        case 'multiSend':
          updatedMessage = {
            ...initialMessages.initialMultiSendMessage,
            type: value,
          };
          break;
        case 'softwareUpgrade':
          updatedMessage = {
            ...initialMessages.initialSoftwareUpgradeMessage,
            type: value,
          };
          break;
        case 'cancelUpgrade':
          updatedMessage = {
            ...initialMessages.initialCancelUpgradeMessage,
            type: value,
          };
          break;
        default:
          break;
      }
    } else {
      (updatedMessage as any)[field as string] = value;
    }
    dispatch({ type: 'UPDATE_MESSAGE', index, message: updatedMessage });
    checkFormValidity();
  };

  const renderInputs = (
    object: Record<string, any>,
    handleChange: (field: string, value: any) => void,
    path = ''
  ) => {
    const generateValidationSchema = (obj: Record<string, any>): any => {
      return Yup.object().shape(
        Object.entries(obj).reduce((schema: Record<string, any>, [key, value]) => {
          if (key === 'type') return schema;

          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            schema[key] = generateValidationSchema(value);
          } else {
            schema[key] = Yup.string()
              .required(`${key.charAt(0).toUpperCase() + key.slice(1)} is required`)
              .noProfanity();

            if (
              key.includes('address') ||
              key === 'sender' ||
              key === 'admin' ||
              key === 'new_admin'
            ) {
              schema[key] = schema[key].manifestAddress().required('Address is required');
            } else if (key.includes('amount')) {
              schema[key] = Yup.number()
                .positive('Amount must be positive')
                .required('Amount is required');
            }
          }
          return schema;
        }, {})
      );
    };

    const validationSchema = generateValidationSchema(object);

    const renderField = (fieldPath: string, fieldValue: any, formikProps: FormikProps<any>) => {
      const { setFieldValue } = formikProps;
      if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue)) {
        return (
          <div key={fieldPath} className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-primary">
              {fieldPath
                .split('.')
                .pop()
                ?.replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </h3>
            <div className="pl-4 border-l-2 border-primary">
              {Object.entries(fieldValue).map(([key, value]) =>
                renderField(`${fieldPath}.${key}`, value, formikProps)
              )}
            </div>
          </div>
        );
      } else if (typeof fieldValue === 'boolean') {
        return (
          <Field key={fieldPath} name={fieldPath}>
            {({ field }: FieldProps) => (
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value}
                  className="checkbox checkbox-primary checkbox-sm mr-2"
                  onChange={e => {
                    field.onChange(e);
                    handleChange(fieldPath, e.target.checked);
                    setFieldValue(fieldPath, e.target.checked);
                  }}
                />
                <span className="capitalize">
                  {fieldPath
                    .split('.')
                    .pop()
                    ?.replace(/_/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </span>
              </label>
            )}
          </Field>
        );
      } else {
        return (
          <Field key={fieldPath} name={fieldPath}>
            {({ field }: FieldProps) => (
              <div className="mb-4">
                <TextInput
                  label={
                    fieldPath
                      .split('.')
                      .pop()
                      ?.replace(/_/g, ' ')
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ') ?? ''
                  }
                  placeholder={`Enter ${fieldPath
                    .split('.')
                    .pop()
                    ?.replace(/_/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}`}
                  {...field}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(e);
                    handleChange(fieldPath, e.target.value);
                    setFieldValue(fieldPath, e.target.value);
                  }}
                />
              </div>
            )}
          </Field>
        );
      }
    };

    return (
      <Formik
        initialValues={object}
        validationSchema={validationSchema}
        onSubmit={() => {}}
        validateOnChange={true}
      >
        {(formikProps: FormikProps<typeof object>) => (
          <Form>
            {Object.entries(object).map(
              ([key, value]) => key !== 'type' && renderField(key, value, formikProps)
            )}
          </Form>
        )}
      </Formik>
    );
  };

  const renderMessageFields = (message: Message, index: number) => {
    interface Message {
      [key: string]: any;
    }

    const handleChange = (field: string, value: any) => {
      const fieldPath = field.split('.');
      let updatedMessage: any = { ...formData.messages[index] };

      let current = updatedMessage;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = value;

      dispatch({ type: 'UPDATE_MESSAGE', index, message: updatedMessage });
    };

    return (
      <div className="p-1 rounded-lg">
        {renderInputs(message, (field, value) => handleChange(field, value))}
      </div>
    );
  };

  const openMessageTypeModal = (index: number) => {
    setEditingMessageIndex(index);
    document.getElementById('message_type_modal')?.showModal();
  };

  const selectMessageType = (type: string) => {
    if (editingMessageIndex !== null) {
      handleChangeMessage(editingMessageIndex, 'type', type);
    }
    document.getElementById('message_type_modal')?.close();
  };

  const openMessageModal = (index: number) => {
    setEditingMessageIndex(index);
    document.getElementById('message_edit_modal')?.showModal();
  };

  const closeMessageModal = () => {
    setEditingMessageIndex(null);
    document.getElementById('message_edit_modal')?.close();
  };

  const isMessageValid = (message: Message): boolean => {
    if (!message || Object.keys(message).length === 0) return false;

    const checkFields = (obj: any): boolean => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (!checkFields(obj[key])) return false;
        } else if (obj[key] === '' || obj[key] === undefined) {
          return false;
        }
      }
      return true;
    };

    return checkFields(message);
  };

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
          <div className="w-full">
            <div className="flex justify-between items-center border-b-[0.5px] mb-4 dark:border-[#FFFFFF99] sm:mb-6 border-b-[black] pb-4">
              <h1 className="text-xl font-extrabold tracking-tight  leading-tight  dark:text-[#FFFFFF99]  ">
                Proposal Messages
              </h1>
              <button
                type="button"
                className="btn btn-sm btn-primary text-white"
                onClick={handleAddMessage}
                aria-label="add-message-btn"
              >
                <PlusIcon className="text-lg" />
                <span className="ml-1">Add Message</span>
              </button>
            </div>

            <div className="min-h-[330px] flex flex-col gap-4">
              <div className="overflow-y-auto max-h-[550px] ">
                {formData.messages.map((message, index) => (
                  <div key={index} className="bg-[#FFFFFF] dark:bg-[#E0E0FF0A] rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">#{index + 1}</span>
                        <button
                          className="btn btn-sm rounded-[12px] ml-4 border-none dark:bg-[#FFFFFF0F] bg-[#0000000A]"
                          onClick={() => openMessageTypeModal(index)}
                        >
                          {message.type
                            .replace(/([A-Z])/g, ' $1')
                            .trim()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ') || 'Select Type'}
                          <ArrowRightIcon className="ml-2 text-primary rotate-180" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-error btn-sm"
                          onClick={() => handleRemoveMessage(index)}
                          aria-label="remove-message-btn"
                        >
                          <MinusIcon className="text-lg text-white" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => openMessageModal(index)}
                          disabled={!message.type}
                          aria-label="edit-message-btn"
                        >
                          <FiEdit className="text-lg text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex space-x-3 mt-6 mx-auto w-full">
        <button onClick={prevStep} className="btn btn-neutral py-2.5 sm:py-3.5 w-1/2">
          <span className="hidden sm:inline">Prev: Proposal Details</span>
          <span className="sm:hidden">Prev: Details</span>
        </button>
        <button
          onClick={nextStep}
          className="w-1/2 btn py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
          disabled={!isFormValid}
        >
          Next: Proposal Metadata
        </button>
      </div>

      {/* Message Type Selection Modal */}
      <dialog id="message_type_modal" className="modal">
        <div className="modal-box bg-[#FFFFFF] dark:bg-[#1D192D] rounded-[24px] max-w-4xl h-full max-h-[700px] p-6">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="text-lg font-semibold mb-4">Select Message Type</h3>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="label">
                <span className="label-text">Search</span>
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search message types"
                  className="input dark:text-[#FFFFFF99] text-[#161616] border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full 
                  autofill:bg-[#E0E0FF0A] autofill:dark:bg-[#E0E0FF0A]
                  focus:bg-[#E0E0FF0A] focus:dark:bg-[#E0E0FF0A] pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 md:flex-initial">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <div className="dropdown w-full dropdown-end cursor-pointer">
                <label
                  tabIndex={0}
                  className="btn min-w-[200px] dark:text-[#FFFFFF99] text-[#161616] border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full flex items-center justify-between"
                >
                  {selectedCategory}
                  <ArrowRightIcon className="text-xs dark:text-[#FFFFFF99] text-[#161616] -rotate-90" />
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-full"
                >
                  {messageCategories.map(category => (
                    <li key={category}>
                      <a onClick={() => setSelectedCategory(category)}>{category}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-h-[500px] overflow-y-auto">
            {filteredMessageTypes.map(type => (
              <div
                key={type.name}
                className="bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] border border-base-300 rounded-lg shadow-sm p-4"
              >
                <h4 className="text-lg font-semibold mb-2">
                  {type.name.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-sm text-base-content opacity-70 mb-4">{type.category}</p>
                <button
                  onClick={() => selectMessageType(type.name)}
                  className="w-full btn btn-primary"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Message Edit Modal */}
      <dialog id="message_edit_modal" className="modal">
        <div className="modal-box bg-[#FFFFFF] dark:bg-[#1D192D] rounded-[24px] max-w-4xl p-6">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={closeMessageModal}
            >
              ✕
            </button>
          </form>
          <h3 className="text-xl font-extrabold tracking-tight leading-tight border-b-[0.5px] dark:border-[#FFFFFF99] border-b-[black] pb-4 mb-4">
            Edit{' '}
            {formData.messages[editingMessageIndex ?? 0].type.charAt(0).toUpperCase() +
              formData.messages[editingMessageIndex ?? 0].type.slice(1)}{' '}
            Message
          </h3>
          {editingMessageIndex !== null && (
            <div className="overflow-y-auto max-h-[600px]">
              {renderMessageFields(formData.messages[editingMessageIndex], editingMessageIndex)}
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeMessageModal}>close</button>
        </form>
      </dialog>
    </section>
  );
}
