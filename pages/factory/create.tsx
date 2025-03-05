import { useChain } from '@cosmos-kit/react';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';

import { SEO, WalletNotConnected } from '@/components';
import ConfirmationForm from '@/components/factory/forms/ConfirmationForm';
import CreateDenom from '@/components/factory/forms/CreateDenom';
import Success from '@/components/factory/forms/Success';
import TokenDetails from '@/components/factory/forms/TokenDetailsForm';
import { FactoryIcon } from '@/components/icons';
import StepIndicator from '@/components/react/StepIndicator';
import env from '@/config/env';
import { TokenFormData, tokenFormDataReducer } from '@/helpers/formReducer';

const initialFormData: TokenFormData = {
  subdenom: '',
  symbol: '',
  label: '',
  description: '',
  uri: '',
  display: '',
  exponent: '',
  base: '',
  name: '',
  uriHash: '',
  denomUnits: [],
  isGroup: false,
  groupPolicyAddress: '',
};

export default function CreateToken() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, dispatch] = useReducer(tokenFormDataReducer, initialFormData);
  const { address, isWalletConnected } = useChain(env.chain);
  const router = useRouter();

  useEffect(() => {
    const { isGroup, groupPolicyAddress } = router.query;
    if (isGroup && typeof isGroup === 'string') {
      // Use the parameter as needed, for example, set it in the form data
      dispatch({ type: 'UPDATE_FIELD', field: 'isGroup', value: isGroup });
    }
    if (groupPolicyAddress && typeof groupPolicyAddress === 'string') {
      dispatch({ type: 'UPDATE_FIELD', field: 'groupPolicyAddress', value: groupPolicyAddress });
    }
  }, [router.query]);

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { label: 'Create Denom', mobileLabel: 'Denom', step: 1 },
    { label: 'Token Metadata', mobileLabel: 'Metadata', step: 2 },
    { label: 'Confirmation', mobileLabel: 'Confirm', step: 3 },
  ];

  return (
    <div className="flex flex-col items-center  w-full">
      <SEO title="Create a token - Alberto" />
      {!isWalletConnected ? (
        <WalletNotConnected
          description="Use the button below to connect your wallet and start creating new tokens."
          icon={<FactoryIcon className="h-60 w-60 text-primary" />}
        />
      ) : (
        <div className="w-full justify-between space-y-8  items-center animate-fadeIn mt-4 overflow-hidden">
          {currentStep != 4 && <StepIndicator steps={steps} currentStep={currentStep} />}

          {currentStep === 1 && (
            <div className="transition-opacity duration-300 animate-fadeIn mx-auto">
              <CreateDenom formData={formData} dispatch={dispatch} nextStep={nextStep} />
            </div>
          )}
          {currentStep === 2 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <TokenDetails
                address={address ?? ''}
                formData={formData}
                dispatch={dispatch}
                prevStep={prevStep}
                nextStep={nextStep}
              />
            </div>
          )}
          {currentStep === 3 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <ConfirmationForm
                formData={formData}
                prevStep={prevStep}
                nextStep={nextStep}
                address={address ?? ''}
              />
            </div>
          )}
          {currentStep === 4 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <Success formData={formData} address={address ?? ''} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
