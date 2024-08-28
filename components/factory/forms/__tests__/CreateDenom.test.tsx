import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, cleanup } from '@testing-library/react';
import CreateDenom from '@/components/factory/forms/CreateDenom';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import {mockTokenFormData} from "@/tests/mock";

expect.extend(matchers);

const mockProps = {
  nextStep: jest.fn(),
  formData: mockTokenFormData,
  dispatch: jest.fn(),
  address: 'cosmos1address',
};

describe('CreateDenom Component', () => {
  afterEach(cleanup);

  test('renders form with correct details', () => {
    renderWithChainProvider(<CreateDenom {...mockProps} />);
    expect(screen.getByText('Create Denom')).toBeInTheDocument();
    expect(screen.getByText('Token Sub Denom')).toBeInTheDocument();
  });

  // TODO: Make this test pass. Why is the input not being updated?
  // test('updates subdenom input correctly', () => {
  //   renderWithChainProvider(<CreateDenom {...mockProps} />);
  //   const subdenomInput = screen.getByPlaceholderText('udenom');
  //   const subdenomInput = screen.getByLabelText('denom-input');
  //   fireEvent.change(subdenomInput, { target: { value: 'utest' } });
  //   expect(subdenomInput).toHaveValue('utest');
  // });

  // TODO: Make this test pass. Why is the input not being updated?
  // test('shows validation error for invalid subdenom', () => {
  //   renderWithChainProvider(<CreateDenom {...mockProps} />);
  //   const subdenomInput = screen.getByPlaceholderText('udenom');
  //   fireEvent.change(subdenomInput, { target: { value: '1invalid' } });
  //   fireEvent.blur(subdenomInput);
  //   expect(screen.getByText('Subdenom must start with a letter')).toBeInTheDocument();
  // });
  //
  // // TODO: The confirm button should be disabled when the input is invalid
  // test('confirm button is disabled when inputs are invalid', () => {
  //   renderWithChainProvider(<CreateDenom {...mockProps} />);
  //   const confirmButton = screen.getByText('Next: Token Metadata');
  //   expect(confirmButton).toBeDisabled();
  // });
  //
  // // TODO: The confirm button should be enabled when the input is valid
  // test('confirm button is enabled when inputs are valid', () => {
  //   renderWithChainProvider(<CreateDenom {...mockProps} />);
  //   const subdenomInput = screen.getByPlaceholderText('udenom');
  //   fireEvent.change(subdenomInput, { target: { value: 'utest' } });
  //   const confirmButton = screen.getByText('Next: Token Metadata');
  //   expect(confirmButton).toBeEnabled();
  // });
});