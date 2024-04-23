import React, { useState, useEffect } from "react";
import ConfirmationForm from "@/components/groups/forms/groups/ConfirmationForm";
import GroupDetails from "@/components/groups/forms/groups/GroupDetailsForm";
import GroupPolicyForm from "@/components/groups/forms/groups/GroupPolicyForm";
import MemberInfoForm from "@/components/groups/forms/groups/MemberInfoForm";

const initialMember = { address: "", name: "", weight: "" };

export default function CreateGroup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [animation, setAnimation] = useState("opacity-0");
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    summary: "",
    description: "",
    forumLink: "",
    votingPeriod: "",
    votingThreshold: "",
    members: [initialMember],
  });

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

  const handleDataChange = (newData: {
    title: string;
    authors: string;
    summary: string;
    description: string;
    forumLink: string;
    votingPeriod: string;
    votingThreshold: string;
    members: { address: string; name: string; weight: string }[];
  }) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };
  console.log(formData);
  return (
    <div
      className={`flex justify-center items-center min-h-screen ${animation}`}
    >
      {currentStep === 1 && (
        <GroupDetails
          formData={formData}
          onDataChange={handleDataChange}
          nextStep={nextStep}
        />
      )}
      {currentStep === 2 && (
        <GroupPolicyForm
          formData={formData}
          onDataChange={handleDataChange}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {currentStep === 3 && (
        <MemberInfoForm
          formData={formData}
          onDataChange={handleDataChange}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {currentStep === 4 && (
        <ConfirmationForm
          formData={formData}
          prevStep={prevStep}
          nextStep={nextStep}
        />
      )}
    </div>
  );
}
