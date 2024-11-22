import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ProposalFormData,
  ProposalAction,
  Message,
  MessageFields,
  SendMessage,
} from '@/helpers/formReducer';
import * as initialMessages from './messages';

import { TextInput } from '@/components/react/inputs';
import { Formik, Form, Field, FieldProps, FormikProps } from 'formik';
import Yup from '@/utils/yupExtensions';
import { ArrowRightIcon, MinusIcon, SearchIcon, PlusIcon } from '@/components/icons';
import { FiEdit } from 'react-icons/fi';
import { useTokenBalances, useTokenBalancesResolved, useTokenFactoryDenomsMetadata } from '@/hooks';
import { DenomImage } from '@/components/factory';
import { PiCaretDownBold } from 'react-icons/pi';
import { shiftDigits, truncateString } from '@/utils';
import { CombinedBalanceInfo } from '@/utils/types';
import Decimal from 'decimal.js';
import { MFX_TOKEN_DATA } from '@/utils/constants';
import { MdContacts } from 'react-icons/md';
import { TailwindModal } from '@/components/react';

// Define the prop types for CustomSendMessageFields
interface CustomSendMessageFieldsProps {
  policyAddress: string;
  address: string;
  message: SendMessage;
  index: number;
  handleChange: (field: string, value: any) => void;
  updateValidity: (index: number, isValid: boolean) => void;
  combinedBalances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  currentAddress?: string;
}

export default function ProposalMessages({
  policyAddress,
  address,
  formData,
  dispatch,
  nextStep,
  prevStep,
}: Readonly<{
  policyAddress: string;
  address: string;
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

  const [isMessageValidArray, setIsMessageValidArray] = useState<boolean[]>(
    formData.messages.map(() => false)
  );

  const updateMessageValidity = (index: number, isValid: boolean) => {
    setIsMessageValidArray(prevState => {
      const newState = [...prevState];
      newState[index] = isValid;
      return newState;
    });
  };

  const checkFormValidity = useCallback(() => {
    const valid = formData.messages.length > 0 && isMessageValidArray.every(isValid => isValid);

    setIsFormValid(valid);
  }, [formData.messages.length, isMessageValidArray]);

  useEffect(() => {
    checkFormValidity();
  }, [isMessageValidArray, checkFormValidity]);

  const handleAddMessage = () => {
    // Create a properly initialized send message with all required fields
    const newMessage: SendMessage = {
      type: 'send',
      from_address: policyAddress,
      to_address: address,
      amount: {
        denom: 'umfx',
        amount: '0',
      },
    };

    // Add the new message
    dispatch({
      type: 'ADD_MESSAGE',
      message: newMessage,
    });

    setVisibleMessages([...visibleMessages, false]);
    setIsMessageValidArray([...isMessageValidArray, false]);
  };

  const handleRemoveMessage = (index: number) => {
    dispatch({ type: 'REMOVE_MESSAGE', index });
    setVisibleMessages(visibleMessages.filter((_, i) => i !== index));
    setIsMessageValidArray(isMessageValidArray.filter((_, i) => i !== index));
    if (editingMessageIndex === index) {
      setEditingMessageIndex(null);
    } else if (editingMessageIndex !== null && editingMessageIndex > index) {
      setEditingMessageIndex(editingMessageIndex - 1);
    }
  };

  const handleChangeMessage = (index: number, field: MessageFields | '', value: any) => {
    if (field === '') {
      // Handle complete message update
      dispatch({ type: 'UPDATE_MESSAGE', index, message: value });
    } else {
      // Handle individual field updates
      let updatedMessage = { ...formData.messages[index] };

      if (field === 'type') {
        switch (value) {
          case 'send':
            updatedMessage = {
              ...initialMessages.initialSendMessage,
              type: value,
              amount: {
                denom: 'umfx',
                amount: '0',
              },
              from_address: policyAddress,
              to_address: address,
            };
            dispatch({ type: 'UPDATE_MESSAGE', index, message: updatedMessage });
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
              sender: policyAddress,
              validator_address: '',
            };
            break;
          case 'removePendingValidator':
            updatedMessage = {
              ...initialMessages.initialRemovePendingMessage,
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
            updatedMessage = {
              // @ts-ignore
              ...initialMessages[`initial${value.charAt(0).toUpperCase() + value.slice(1)}Message`],
              type: value,
            };
            // Set sender/from fields to policyAddress
            if ('sender' in updatedMessage) {
              updatedMessage.sender = policyAddress;
            }
            if ('from_address' in updatedMessage) {
              updatedMessage.from_address = policyAddress;
            }
            break;
        }
      } else {
        // For field updates, automatically set sender/from fields
        if (field.includes('sender') || field.includes('from')) {
          value = policyAddress;
        }
        if (updatedMessage.type === 'send') {
          updatedMessage = {
            ...updatedMessage,
            [field]: value,
            from_address: policyAddress,
          };
        } else {
          (updatedMessage as any)[field] = value;
        }
      }
      dispatch({ type: 'UPDATE_MESSAGE', index, message: updatedMessage });
    }
  };

  const renderInputs = (
    object: Record<string, any>,
    handleChange: (field: string, value: any) => void,
    path = '',
    index: number
  ) => {
    const generateValidationSchema = (obj: Record<string, any>): any => {
      return Yup.object().shape(
        Object.entries(obj).reduce((schema: Record<string, any>, [key, value]) => {
          if (key === 'type') return schema;

          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            schema[key] = generateValidationSchema(value);
          } else {
            schema[key] = Yup.string().required(
              `${key.charAt(0).toUpperCase() + key.slice(1)} is required`
            );

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
        validate={values => {
          const isValid = validationSchema.isValidSync(values);
          updateMessageValidity(index, isValid);
        }}
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

    if (message.type === 'send') {
      return (
        <CustomSendMessageFields
          policyAddress={policyAddress}
          address={address}
          message={message as SendMessage}
          index={index}
          handleChange={handleChange}
          updateValidity={updateMessageValidity}
          combinedBalances={combinedBalances}
          isBalancesLoading={isBalancesLoading}
          currentAddress={address}
        />
      );
    } else {
      return (
        <div className="p-1 rounded-lg">
          {renderInputs(message, (field, value) => handleChange(field, value), '', index)}
        </div>
      );
    }
  };

  const openMessageTypeModal = (index: number) => {
    setEditingMessageIndex(index);
    (document.getElementById('message_type_modal') as HTMLDialogElement)?.showModal();
  };

  const selectMessageType = (type: string) => {
    if (editingMessageIndex !== null) {
      handleChangeMessage(editingMessageIndex, 'type', type);
    }
    (document.getElementById('message_type_modal') as HTMLDialogElement)?.close();
  };

  const openMessageModal = (index: number) => {
    setEditingMessageIndex(index);
    (document.getElementById('message_edit_modal') as HTMLDialogElement)?.showModal();
  };

  const closeMessageModal = () => {
    setEditingMessageIndex(null);
    (document.getElementById('message_edit_modal') as HTMLDialogElement)?.close();
  };

  const isMessageValid = React.useCallback((message: Message): boolean => {
    if (!message || Object.keys(message).length === 0) return false;
    if (!message.type) return false;

    const checkFields = (obj: any): boolean => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (!checkFields(obj[key])) return false;
        } else if (obj[key] === '' || obj[key] === undefined || obj[key] === null) {
          return false;
        }
      }
      return true;
    };

    return checkFields(message);
  }, []);

  // Import necessary hooks and states for token balances and metadata
  const { balances, isBalancesLoading } = useTokenBalances(policyAddress);
  const { balances: resolvedBalances } = useTokenBalancesResolved(policyAddress);
  const { metadatas } = useTokenFactoryDenomsMetadata();

  // Combine balances with metadata
  const combinedBalances = useMemo(() => {
    if (!balances || !resolvedBalances || !metadatas) return [];

    // Find 'umfx' balance (mfx token)
    const mfxCoreBalance = balances.find(b => b.denom === 'umfx');
    const mfxResolvedBalance = resolvedBalances.find(rb => rb.denom === 'mfx');

    // Create combined balance for 'mfx'
    const mfxCombinedBalance: CombinedBalanceInfo | null = mfxCoreBalance
      ? {
          denom: mfxResolvedBalance?.denom || 'mfx',
          coreDenom: 'umfx',
          amount: mfxCoreBalance.amount,
          metadata: MFX_TOKEN_DATA,
        }
      : null;

    // Process other balances
    const otherBalances = balances
      .filter(coreBalance => coreBalance.denom !== 'umfx')
      .map((coreBalance): CombinedBalanceInfo => {
        const resolvedBalance = resolvedBalances.find(
          rb => rb.denom === coreBalance.denom || rb.denom === coreBalance.denom.split('/').pop()
        );
        const metadata = metadatas.metadatas.find(m => m.base === coreBalance.denom);

        return {
          denom: resolvedBalance?.denom || coreBalance.denom,
          coreDenom: coreBalance.denom,
          amount: coreBalance.amount,
          metadata: metadata || null,
        };
      });

    // Combine 'mfx' with other balances
    return mfxCombinedBalance ? [mfxCombinedBalance, ...otherBalances] : otherBalances;
  }, [balances, resolvedBalances, metadatas]);

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
      <div className="flex gap-6 mt-6 mx-auto w-full">
        <button onClick={prevStep} className="btn btn-neutral py-2.5 sm:py-3.5 w-[calc(50%-12px)]">
          <span className="hidden sm:inline">Prev: Proposal Details</span>
          <span className="sm:hidden">Prev: Details</span>
        </button>
        <button
          onClick={nextStep}
          className="w-[calc(50%-12px)] btn py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
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
                  className="dropdown-content z-[1] menu p-2 mt-2 shadow bg-base-300 rounded-box w-full"
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
            {editingMessageIndex !== null && formData.messages[editingMessageIndex]
              ? formData.messages[editingMessageIndex].type.charAt(0).toUpperCase() +
                formData.messages[editingMessageIndex].type.slice(1)
              : 'Message'}{' '}
            Message
          </h3>
          {editingMessageIndex !== null && formData.messages[editingMessageIndex] && (
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

const CustomSendMessageFields: React.FC<CustomSendMessageFieldsProps> = ({
  policyAddress,
  address,
  message,
  index,
  handleChange,
  updateValidity,
  combinedBalances,
  isBalancesLoading,
  currentAddress,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  const filteredBalances = combinedBalances?.filter(token => {
    const displayName = token.metadata?.display ?? token.denom;
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const initialSelectedToken = useMemo(() => {
    return (
      combinedBalances?.find(token => token.coreDenom === message.amount.denom) ||
      combinedBalances?.find(token => token.denom === 'umfx') ||
      combinedBalances?.[0] ||
      null
    );
  }, [combinedBalances, message.amount.denom]);

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .typeError('Amount must be a number')
      .required('Amount is required')
      .positive('Amount must be positive'),
    to_address: Yup.string().required('Recipient address is required').manifestAddress(),
    denom: Yup.string().required('Denomination is required'),
    selectedToken: Yup.object().required('Please select a token'),
  });

  const formatAmount = (amount: number, decimals: number) => {
    return amount.toFixed(decimals).replace(/\.?0+$/, '');
  };

  // Update initial values to include the from and to addresses
  const initialValues = {
    amount: message.amount.amount
      ? new Decimal(message.amount.amount)
          .div(new Decimal(10).pow(initialSelectedToken?.metadata?.denom_units[1]?.exponent ?? 6))
          .toString()
      : '',
    from_address: policyAddress,
    to_address: address,
    selectedToken: initialSelectedToken,
    denom: message.amount.denom || '',
  };

  return (
    <div style={{ borderRadius: '24px' }} className="text-sm w-full h-full p-2">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={() => {}}
        validateOnChange={true}
        enableReinitialize={true}
        validate={values => {
          const isValid = validationSchema.isValidSync(values);
          updateValidity(index, isValid);

          // Create complete message object with all required fields
          const updatedMessage: SendMessage = {
            type: 'send',
            from_address: values.from_address,
            to_address: values.to_address,
            amount: {
              denom: values.selectedToken?.coreDenom || 'umfx',
              amount: values.amount
                ? new Decimal(values.amount)
                    .times(
                      new Decimal(10).pow(
                        values.selectedToken?.metadata?.denom_units[1]?.exponent ?? 6
                      )
                    )
                    .toFixed(0)
                : '0',
            },
          };

          // Update the entire message object
          handleChange('', updatedMessage);
        }}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form className="space-y-6 flex flex-col items-center mx-auto">
            <div className="w-full space-y-4">
              {/* Amount Input with Token Selector */}
              <div className="w-full">
                <label className="label">
                  <span className="label-text text-md font-medium text-[#00000099] dark:text-[#FFFFFF99]">
                    Amount
                  </span>
                </label>
                <div className="relative">
                  <input
                    className="input input-md border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full pr-24 dark:text-[#FFFFFF] text-[#161616]"
                    name="amount"
                    placeholder="0.00"
                    style={{ borderRadius: '12px' }}
                    value={values.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0) {
                        setFieldValue('amount', value);

                        if (values.selectedToken) {
                          const exponent =
                            values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
                          const amountMinimalUnits = new Decimal(value)
                            .times(new Decimal(10).pow(exponent))
                            .toFixed(0);

                          handleChange('amount.amount', amountMinimalUnits);
                        } else {
                          handleChange('amount.amount', value);
                        }
                      }
                    }}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (!/[\d.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />

                  <div className="absolute inset-y-1 right-1 flex items-center">
                    <div className="dropdown dropdown-end h-full">
                      <label
                        aria-label="token-selector"
                        tabIndex={0}
                        className="btn btn-sm h-full px-3 bg-[#FFFFFF] dark:bg-[#FFFFFF0F] border-none hover:bg-transparent"
                      >
                        {values.selectedToken?.metadata ? (
                          <DenomImage denom={values.selectedToken?.metadata} />
                        ) : null}
                        {(() => {
                          const tokenDisplayName =
                            values.selectedToken?.metadata?.display ??
                            values.selectedToken?.denom ??
                            'Select';
                          return tokenDisplayName.startsWith('factory')
                            ? tokenDisplayName.split('/').pop()?.toUpperCase()
                            : truncateString(tokenDisplayName, 10).toUpperCase();
                        })()}
                        <PiCaretDownBold className="ml-1" />
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-20 p-2 shadow bg-base-300 rounded-lg w-full mt-1 max-h-[12.5rem] min-w-44 overflow-y-auto dark:text-[#FFFFFF] text-[#161616]"
                      >
                        <li className="bg-base-300 z-30 hover:bg-transparent h-full mb-2">
                          <div className="px-2 py-1 relative">
                            <input
                              type="text"
                              placeholder="Search tokens..."
                              className="input input-sm w-full pr-8 focus:outline-none focus:ring-0 border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A]"
                              onChange={e => setSearchTerm(e.target.value)}
                              style={{ boxShadow: 'none', borderRadius: '8px' }}
                            />
                            <SearchIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </li>
                        {isBalancesLoading ? (
                          <li>
                            <a className="block px-4 py-2">Loading tokens...</a>
                          </li>
                        ) : (
                          filteredBalances?.map(token => (
                            <li
                              key={token.coreDenom}
                              onClick={() => {
                                setFieldValue('selectedToken', token);
                                setFieldValue('denom', token.coreDenom);
                                handleChange('amount.denom', token.coreDenom);
                                // Reset amount when token changes
                                setFieldValue('amount', '');
                                handleChange('amount.amount', '');
                              }}
                              className="hover:bg-[#E0E0FF33] dark:hover:bg-[#FFFFFF0F] cursor-pointer rounded-lg"
                              aria-label={token.metadata?.display}
                            >
                              <a className="flex flex-row items-center gap-2 px-2 py-2">
                                <DenomImage denom={token?.metadata} />
                                <span className="truncate">
                                  {token.metadata?.display.startsWith('factory')
                                    ? token.metadata?.display.split('/').pop()?.toUpperCase()
                                    : truncateString(
                                        token.metadata?.display ?? '',
                                        10
                                      ).toUpperCase()}
                                </span>
                              </a>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="text-xs mt-1 flex justify-between text-[#00000099] dark:text-[#FFFFFF99]">
                  <div className="flex flex-row gap-1 ml-1">
                    <span>
                      Balance:{' '}
                      {values.selectedToken
                        ? (() => {
                            const exponent =
                              values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
                            const amount = Number(
                              shiftDigits(values.selectedToken.amount, -exponent)
                            ).toLocaleString(undefined, {
                              maximumFractionDigits: exponent,
                            });
                            return Number(amount) < 0.01 ? '< 0.01' : amount;
                          })()
                        : '0'}
                    </span>

                    <span className="">
                      {(() => {
                        const tokenDisplayName =
                          values.selectedToken?.metadata?.display ??
                          values.selectedToken?.denom ??
                          'Select';
                        return tokenDisplayName.startsWith('factory')
                          ? tokenDisplayName.split('/').pop()?.toUpperCase()
                          : truncateString(tokenDisplayName, 10).toUpperCase();
                      })()}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-primary"
                      onClick={() => {
                        if (!values.selectedToken) return;

                        const exponent =
                          values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
                        const maxAmount =
                          Number(values.selectedToken.amount) / Math.pow(10, exponent);

                        let adjustedMaxAmount = maxAmount;
                        if (values.selectedToken.denom === 'umfx') {
                          adjustedMaxAmount = Math.max(0, maxAmount - 0.1);
                        }

                        const decimals =
                          values.selectedToken.metadata?.denom_units[1]?.exponent ?? 6;
                        const formattedAmount = formatAmount(adjustedMaxAmount, decimals);

                        setFieldValue('amount', formattedAmount);

                        // Set the amount in minimal units
                        const amountMinimalUnits = new Decimal(formattedAmount)
                          .times(new Decimal(10).pow(exponent))
                          .toFixed(0);
                        handleChange('amount.amount', amountMinimalUnits);
                      }}
                    >
                      MAX
                    </button>
                  </div>
                  {errors.amount && touched.amount && (
                    <div className="text-red-500 text-xs">{errors.amount}</div>
                  )}
                </div>
              </div>

              {/* Editable To Address Input */}
              <TextInput
                label="Send To"
                name="to_address"
                placeholder="Enter recipient address"
                value={values.to_address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const newAddress = e.target.value;
                  setFieldValue('to_address', newAddress);
                  handleChange('to_address', newAddress);
                }}
                className="input-md w-full"
                style={{ borderRadius: '12px' }}
                rightElement={
                  <button
                    type="button"
                    aria-label="contacts-btn"
                    onClick={() => {
                      (document.getElementById('message_edit_modal') as HTMLDialogElement)?.close();
                      setIsContactsOpen(true);
                    }}
                    className="btn btn-primary btn-sm text-white"
                  >
                    <MdContacts className="w-5 h-5" />
                  </button>
                }
              />
              {/* Fixed From Address Input */}
              <TextInput
                label="From Address"
                name="from_address"
                value={policyAddress}
                className="input-md w-full"
                style={{ borderRadius: '12px' }}
                disabled={true}
              />
            </div>
            {/* Display validation errors */}
            {Object.keys(errors).map(key => {
              const errorKey = key as keyof typeof errors;
              const touchedKey = key as keyof typeof touched;
              return touched[touchedKey] && errors[errorKey] ? (
                <div key={key} className="text-red-500 text-xs">
                  {typeof errors[errorKey] === 'string'
                    ? (errors[errorKey] as string)
                    : JSON.stringify(errors[errorKey])}
                </div>
              ) : null;
            })}
          </Form>
        )}
      </Formik>
      <TailwindModal
        isOpen={isContactsOpen}
        setOpen={setIsContactsOpen}
        showContacts={true}
        showMessageEditModal={true}
        onSelect={(selectedAddress: string) => {
          // Update only the to_address
          handleChange('to_address', selectedAddress);
          setIsContactsOpen(false);
        }}
        currentAddress={currentAddress}
      />
    </div>
  );
};
