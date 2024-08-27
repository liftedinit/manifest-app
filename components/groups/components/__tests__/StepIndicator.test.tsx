import {describe, test, expect, afterEach} from "bun:test"
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import StepIndicator from '@/components/groups/components/StepIndicator';

describe('StepIndicator Component', () => {
  afterEach(cleanup)

  const steps = [
    { label: 'Step 1', step: 1 },
    { label: 'Step 2', step: 2 },
    { label: 'Step 3', step: 3 },
  ];

  test('renders steps correctly', () => {
    render(<StepIndicator currentStep={1} steps={steps} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  test('highlights the current step correctly', () => {
    render(<StepIndicator currentStep={2} steps={steps} />);
    const currentStep = screen.getByText('Step 2');
    expect(currentStep).toHaveClass('step-primary');
  });

  test('highlights the steps before the current step correctly', () => {
    render(<StepIndicator currentStep={2} steps={steps} />);
    const previousStep = screen.getByText('Step 1');
    expect(previousStep).toHaveClass('step-primary');
  });

  test('does not highlight the steps after the current step', () => {
    render(<StepIndicator currentStep={2} steps={steps} />);
    const nextStep = screen.getByText('Step 3');
    expect(nextStep).not.toHaveClass('step-primary');
  });
});