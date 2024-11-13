import { describe, test, expect, afterEach } from 'bun:test';
import React from 'react';
import { render, screen, cleanup, getDefaultNormalizer } from '@testing-library/react';
import StepIndicator from '@/components/react/StepIndicator';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

describe('StepIndicator Component', () => {
  afterEach(cleanup);

  const steps = [
    { label: 'Step 1', step: 1 },
    { label: 'Step 2', step: 2 },
    { label: 'Step 3', step: 3 },
  ];

  test('renders steps correctly', () => {
    render(<StepIndicator currentStep={1} steps={steps} />);
    const normalizer = getDefaultNormalizer({ collapseWhitespace: true, trim: true });
    expect(screen.getByText('1. Step 1', { normalizer })).toBeInTheDocument();
    expect(screen.getByText('2. Step 2', { normalizer })).toBeInTheDocument();
    expect(screen.getByText('3. Step 3', { normalizer })).toBeInTheDocument();
  });

  test('highlights the current step correctly', () => {
    render(<StepIndicator currentStep={2} steps={steps} />);
    const normalizer = getDefaultNormalizer({ collapseWhitespace: true, trim: true });
    const spanElement = screen.getByText('2. Step 2', { normalizer });
    const divParent = spanElement.closest('div');
    expect(divParent).toHaveClass('text-black');
  });

  test('display the step before the current step correctly', () => {
    render(<StepIndicator currentStep={2} steps={steps} />);
    const normalizer = getDefaultNormalizer({ collapseWhitespace: true, trim: true });
    const spanElement = screen.getByText('1. Step 1', { normalizer });
    const divParent = spanElement.closest('div');
    expect(divParent).toHaveClass('text-gray-400');
  });

  test('display the step after the current step correctly', () => {
    render(<StepIndicator currentStep={2} steps={steps} />);
    const normalizer = getDefaultNormalizer({ collapseWhitespace: true, trim: true });
    const spanElement = screen.getByText('3. Step 3', { normalizer });
    const divParent = spanElement.closest('div');
    expect(divParent).toHaveClass('text-gray-400');
  });
});
