import React, { ReactNode } from "react";

export default function StepIndicator({
  currentStep,
  steps,
}: Readonly<{
  currentStep: number;
  steps: { label: ReactNode; step: number }[];
}>) {
  return (
    <ul className="steps w-full">
      {steps.map(({ label, step }) => (
        <li
          key={step}
          className={`step ${step <= currentStep ? "step-primary" : ""}`}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
