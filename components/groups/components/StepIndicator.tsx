import React, { ReactNode } from 'react';

export default function StepIndicator({
  currentStep,
  steps,
}: Readonly<{
  currentStep: number;
  steps: { label: ReactNode; step: number }[];
}>) {
  return (
    <div className="flex items-stretch h-[52px] dark:bg-[#FFFFFF0F] bg-[#0000000A] w-full rounded-[10000px] p-1">
      {steps.map(({ label, step }) => (
        <div
          key={step}
          className={`flex items-center justify-center flex-1 text-center transition-all ${
            step === currentStep
              ? 'dark:bg-[#FFFFFF1F] bg-[#FFFFFF] dark:text-white text-black rounded-[80px]'
              : 'text-gray-400 text-[#00000099]'
          }`}
        >
          <span className="px-6">
            {step}.&nbsp;{label}
          </span>
        </div>
      ))}
    </div>
  );
}
