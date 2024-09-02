import React, { useEffect, useState } from 'react';
import { ProposalFormData, ProposalAction, Message, MessageFields } from '@/helpers/formReducer';

import * as initialMessages from './messages';
import { FiArrowUp, FiMinusCircle, FiPlusCircle } from 'react-icons/fi';
import { TextInput } from '@/components/react/inputs';
import { isValidAddress } from '@/utils/string';
import { Formik, Form, Field, FieldProps, FormikProps } from 'formik';

import Yup from '@/utils/yupExtensions';

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

  const isMessageValid = (message: Message): boolean => {
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

  const checkFormValidity = () => {
    const valid = formData.messages.every(isMessageValid);
    setIsFormValid(valid);
  };

  useEffect(() => {
    checkFormValidity();
  }, [formData.messages]);

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

  const toggleVisibility = (index: number) => {
    setVisibleMessages(visibleMessages.map((visible, i) => (i === index ? !visible : visible)));
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
        case 'removePending':
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

  console.log(formData);

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
            schema[key] = Yup.string().required(`${key} is required`);

            if (key.includes('address')) {
              schema[key] = schema[key].test(
                'is-valid-address',
                'Invalid address format, must start with manifest',
                (val: string) => isValidAddress(val)
              );
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
      const { setFieldValue, errors, touched } = formikProps;
      if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue)) {
        return (
          <div key={fieldPath} className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-primary">
              {fieldPath.split('.').pop()?.replace(/_/g, ' ')}
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
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value}
                  className="checkbox checkbox-sm mr-2"
                  onChange={e => {
                    field.onChange(e);
                    handleChange(fieldPath, e.target.checked);
                    setFieldValue(fieldPath, e.target.checked);
                  }}
                />
                <span className="capitalize">{fieldPath.split('.').pop()?.replace(/_/g, ' ')}</span>
              </label>
            )}
          </Field>
        );
      } else {
        return (
          <Field key={fieldPath} name={fieldPath}>
            {({ field }: FieldProps) => (
              <div className="">
                <TextInput
                  label={fieldPath.split('.').pop()?.replace(/_/g, ' ') ?? ''}
                  placeholder={`Enter ${fieldPath.split('.').pop()?.replace(/_/g, ' ')}`}
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
      <div className="bg-base-100 p-6 rounded-lg shadow-inner">
        {renderInputs(message, (field, value) => handleChange(field, value))}
      </div>
    );
  };

  const handleNextStep = () => {
    nextStep();
  };

  const [searchTerm, setSearchTerm] = useState('');
  const filteredMessageTypes = [
    'send',
    'customMessage',
    'removeValidator',
    'removePending',
    'updatePoaParams',
    'updateStakingParams',
    'setPower',
    'updateManifestParams',
    'payoutStakeholders',
    'updateGroupAdmin',
    'updateGroupMembers',
    'updateGroupMetadata',
    'updateGroupPolicyAdmin',
    'createGroupWithPolicy',
    'submitProposal',
    'vote',
    'withdrawProposal',
    'exec',
    'leaveGroup',
    'multiSend',
    'softwareUpgrade',
    'cancelUpgrade',
  ].filter(type => type.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <section className="w-full px-4 sm:px-0">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto w-screen px-6 md:px-0 md:w-[42rem] xl:px-0">
          <div className="w-full">
            <div className="w-full">
              <div className="flex flex-row justify-between items-center mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight  leading-tight">Messages</h1>
                <div className="flex gap-2  ">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={handleAddMessage}
                    aria-label={'add-message-btn'}
                  >
                    <span>
                      <FiPlusCircle className="text-lg text-white" />
                    </span>
                  </button>
                </div>
              </div>

              <div className="min-h-[330px]">
                <div className="overflow-y-auto max-h-[550px] min-h-[330px]">
                  <div className="space-y-6">
                    {formData.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`bg-base-300 shadow rounded-lg p-4 mb-4 animate-fadeIn`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-row items-center gap-4">
                            <span className="text-lg font-bold">#{index + 1}</span>

                            <div className="dropdown">
                              <button tabIndex={0} className="btn m-1 btn-sm btn-neutral">
                                {message.type}
                              </button>
                              <ul
                                tabIndex={0}
                                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-[26.5rem] max-h-56 overflow-y-auto"
                              >
                                <li className="sticky top-0 bg-base-100 z-10 hover:bg-transparent">
                                  <div className="px-2 py-1">
                                    <input
                                      type="text"
                                      placeholder="Search Messages"
                                      className="input input-sm w-full pr-8 focus:outline-none focus:ring-0 border-none bg-transparent"
                                      onChange={e => setSearchTerm(e.target.value)}
                                      style={{ boxShadow: 'none' }}
                                    />
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                      />
                                    </svg>
                                  </div>
                                </li>
                                {filteredMessageTypes.map(type => (
                                  <li key={type}>
                                    <button
                                      aria-label={`message-type-btn-${type}`}
                                      onClick={() => handleChangeMessage(index, 'type', type)}
                                    >
                                      {type.replace(/([A-Z])/g, ' $1').trim()}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div>
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              onClick={() => handleRemoveMessage(index)}
                              aria-label={'remove-message-btn'}
                            >
                              <span>
                                <FiMinusCircle className="text-xs text-white" />
                              </span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-primary ml-2"
                              onClick={() => toggleVisibility(index)}
                              disabled={!message.type}
                              aria-label="Toggle message visibility"
                            >
                              <span
                                className={`transition-all duration-400 ${
                                  visibleMessages[index] ? 'rotate-0' : 'rotate-180'
                                }`}
                              >
                                <FiArrowUp className="text-xs" />
                              </span>
                            </button>
                          </div>
                        </div>
                        {visibleMessages[index] && (
                          <div className="mt-4">{renderMessageFields(message, index)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="btn mt-4 btn-primary w-full"
                  disabled={formData.messages.length === 0 || !isFormValid}
                >
                  Next: Proposal Metadata
                </button>
              </div>

              <div className="flex space-x-3 ga-4 mt-6">
                <button
                  onClick={prevStep}
                  className="text-center btn btn-neutral items-center w-1/2 py-2.5 sm:py-3.5 text-sm font-medium focus:outline-none rounded-lg border"
                >
                  <span className="hidden sm:inline">Prev: Proposal Details</span>
                  <span className="sm:hidden"> Prev: Info</span>
                </button>
                <a className="text-center items-center w-1/2 py-2.5 sm:py-3.5 text-sm font-medium"></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
