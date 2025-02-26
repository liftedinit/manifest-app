import { useChain } from '@cosmos-kit/react';
import { Duration } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/duration';
import React, { useReducer, useState } from 'react';

import { GroupsIcon, WalletNotConnected } from '@/components';
import { SEO } from '@/components';
import ConfirmationForm from '@/components/groups/forms/groups/ConfirmationForm';
import GroupDetails from '@/components/groups/forms/groups/GroupDetailsForm';
import GroupPolicyForm from '@/components/groups/forms/groups/GroupPolicyForm';
import MemberInfoForm from '@/components/groups/forms/groups/MemberInfoForm';
import Success from '@/components/groups/forms/groups/Success';
import StepIndicator from '@/components/react/StepIndicator';
import env from '@/config/env';
import { FormData, formDataReducer } from '@/helpers/formReducer';

const initialFormData: FormData = {
  title: '',
  authors: '',
  description: '',
  votingPeriod: {} as Duration,
  votingThreshold: '',
  members: [{ address: '', name: '' }],
};

export default function CreateGroup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, dispatch] = useReducer(formDataReducer, initialFormData);
  const { address, isWalletConnected } = useChain(env.chain);
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { label: 'Details', step: 1 },
    { label: 'Members', step: 2 },
    { label: 'Policy', step: 3 },
    { label: 'Confirmation', step: 4 },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen w-full ">
      <SEO title="Create a group - Alberto" />
      {!isWalletConnected ? (
        <WalletNotConnected
          description="Use the button below to connect your wallet and create a group."
          icon={<GroupsIcon className="h-60 w-60 text-primary" />}
        />
      ) : (
        <div className="w-full justify-between space-y-8 min-h-screen items-center animate-fadeIn mt-4 overflow-hidden">
          {currentStep != 5 && <StepIndicator steps={steps} currentStep={currentStep} />}

          {currentStep === 1 && (
            <div className="transition-opacity duration-300 animate-fadeIn  mx-auto">
              <GroupDetails
                formData={formData}
                dispatch={dispatch}
                nextStep={nextStep}
                address={address ?? ''}
              />
            </div>
          )}
          {currentStep === 2 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <MemberInfoForm
                formData={formData}
                dispatch={dispatch}
                nextStep={nextStep}
                prevStep={prevStep}
                address={address ?? ''}
              />
            </div>
          )}
          {currentStep === 3 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <GroupPolicyForm
                formData={formData}
                dispatch={dispatch}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </div>
          )}
          {currentStep === 4 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <ConfirmationForm
                address={address ?? ''}
                formData={formData}
                prevStep={prevStep}
                nextStep={nextStep}
              />
            </div>
          )}
          {currentStep === 5 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <Success address={address ?? ''} formData={formData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
