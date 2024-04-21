import React, { useState, useEffect } from "react";
import ConfirmationForm from "@/components/groups/forms/groups/ConfirmationForm";
import GroupDetails from "@/components/groups/forms/groups/GroupDetailsForm";
import GroupPolicyForm from "@/components/groups/forms/groups/GroupPolicyForm";
import MemberInfoForm from "@/components/groups/forms/groups/MemberInfoForm";

export default function CreateGroup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [animation, setAnimation] = useState("opacity-0");

  useEffect(() => {
    setAnimation("opacity-50");

    const timeoutId = setTimeout(
      () =>
        setAnimation(
          "opacity-100 translate-y-0 transition-opacity duration-300"
        ),
      10
    );
    return () => clearTimeout(timeoutId);
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < 4) {
      animateOut(() => setCurrentStep(currentStep + 1));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      animateOut(() => setCurrentStep(currentStep - 1));
    }
  };

  const animateOut = (callback: { (): void; (): void; (): void }) => {
    setAnimation("opacity-50  transition-opacity duration-300");
    setTimeout(callback, 200);
  };

  return (
    <div
      className={`flex justify-center items-center min-h-screen ${animation}`}
    >
      {currentStep === 1 && <GroupDetails nextStep={nextStep} />}
      {currentStep === 2 && (
        <GroupPolicyForm nextStep={nextStep} prevStep={prevStep} />
      )}
      {currentStep === 3 && (
        <MemberInfoForm nextStep={nextStep} prevStep={prevStep} />
      )}
      {currentStep === 4 && (
        <ConfirmationForm prevStep={prevStep} nextStep={nextStep} />
      )}
    </div>
  );
}
