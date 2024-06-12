import React from "react";

export default function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: { label: string; step: number }[];
}) {
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
