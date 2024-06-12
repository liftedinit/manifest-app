import React, { useState, useEffect, useReducer } from "react";
import { formDataReducer, FormData } from "@/helpers/formReducer";
import ConfirmationForm from "@/components/groups/forms/groups/ConfirmationForm";
import GroupDetails from "@/components/groups/forms/groups/GroupDetailsForm";
import GroupPolicyForm from "@/components/groups/forms/groups/GroupPolicyForm";
import MemberInfoForm from "@/components/groups/forms/groups/MemberInfoForm";
import { Duration } from "@chalabi/manifestjs/dist/codegen/google/protobuf/duration";
import StepIndicator from "@/components/groups/components/StepIndicator";
import { useChain } from "@cosmos-kit/react";
import { chainName } from "@/config";
import { WalletSection } from "@/components";

const initialFormData: FormData = {
  title: "",
  authors: "",
  summary: "",
  description: "",
  forumLink: "",
  votingPeriod: {} as Duration,
  votingThreshold: "",

  members: [{ address: "", name: "", weight: "" }],
};

export default function CreateGroup() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, dispatch] = useReducer(formDataReducer, initialFormData);

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

  const { isWalletConnected } = useChain(chainName);

  const steps = [
    { label: "Details", step: 1 },
    { label: "Policy", step: 2 },
    { label: "Members", step: 3 },
    { label: "Confirmation", step: 4 },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen">
      {!isWalletConnected && (
        <div className="mt-24 p-4 gap-4 flex flex-col max-w-5xl  lg:flex-row md:flex-col sm:flex-col xs:flex-col rounded-md bg-base-200/20 blur-40 shadow-lg transition-opacity duration-300 ease-in-out animate-fadeIn">
          <section className=" transition-opacity duration-300 ease-in-out animate-fadeIn">
            <div className="grid max-w-screen-xl bg-base-100 p-12 rounded-md  mx-auto lg:gap-8 xl:gap-0  lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl ">
                  Connect your wallet!
                </h1>
                <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl text-balance">
                  Use the button below to connect your wallet and create a
                  group.
                </p>
                <WalletSection chainName={chainName} />
              </div>
              <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
                <img src="/groups.svg" alt="groups" />
              </div>
            </div>
          </section>
        </div>
      )}
      {isWalletConnected && (
        <div className="w-full flex flex-col gap-12 justify-between my-auto items-center animate-fadeIn max-w-4xl mt-10">
          <StepIndicator steps={steps} currentStep={currentStep} />
          {currentStep === 1 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <GroupDetails
                formData={formData}
                dispatch={dispatch}
                nextStep={nextStep}
              />
            </div>
          )}
          {currentStep === 2 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <GroupPolicyForm
                formData={formData}
                dispatch={dispatch}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </div>
          )}
          {currentStep === 3 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <MemberInfoForm
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
                formData={formData}
                prevStep={prevStep}
                nextStep={nextStep}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
