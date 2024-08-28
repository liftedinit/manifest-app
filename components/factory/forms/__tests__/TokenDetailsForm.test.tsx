import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, cleanup } from '@testing-library/react';
import TokenDetailsForm from '@/components/factory/forms/TokenDetailsForm';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import {mockTokenFormData} from "@/tests/mock";

expect.extend(matchers);

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockTokenFormData,
  dispatch: jest.fn(),
  address: 'cosmos1address',
};

describe('TokenDetailsForm Component', () => {
  afterEach(cleanup);

  test('renders form with correct details', () => {
    renderWithChainProvider(<TokenDetailsForm {...mockProps} />);
    expect(screen.getByText('Subdenom')).toBeInTheDocument();
    expect(screen.getByText('Display')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('URI')).toBeInTheDocument();
    expect(screen.getByText('URI Hash')).toBeInTheDocument();
  });

  // TODO: Make this test pass. Why is the input not being updated?
  // test('updates form fields correctly', () => {
  //   renderWithChainProvider(<TokenDetailsForm {...mockProps} />);
  //   const subdenomInput = screen.getByLabelText('subdenom-input');
  //   fireEvent.change(subdenomInput, { target: { value: 'newsubdenom' } });
  //   expect(subdenomInput).toHaveValue('newsubdenom');
  //
  //   const displayInput = screen.getByLabelText('display-input');
  //   fireEvent.change(displayInput, { target: { value: 'New Display' } });
  //   expect(displayInput).toHaveValue('New Display');
  //
  //   const nameInput = screen.getByLabelText('name-input');
  //   fireEvent.change(nameInput, { target: { value: 'New Name' } });
  //   expect(nameInput).toHaveValue('New Name');
  //
  //   const symbolInput = screen.getByLabelText('symbol-input');
  //   fireEvent.change(symbolInput, { target: { value: 'NS' } });
  //   expect(symbolInput).toHaveValue('NS');
  //
  //   const descriptionInput = screen.getByLabelText('description-input');
  //   fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
  //   expect(descriptionInput).toHaveValue('New Description');
  //
  //   const uriInput = screen.getByLabelText('url-input');
  //   fireEvent.change(uriInput, { target: { value: 'http://newuri.com' } });
  //   expect(uriInput).toHaveValue('http://newuri.com');
  //
  //   const uriHashInput = screen.getByLabelText('uri-hash-input');
  //   fireEvent.change(uriHashInput, { target: { value: 'newurihash' } });
  //   expect(uriHashInput).toHaveValue('newurihash');
  // });

  test('next button is disabled when form is invalid', () => {
    const invalidFormData = { ...mockTokenFormData, subdenom: '' };
    renderWithChainProvider(<TokenDetailsForm {...mockProps} formData={invalidFormData} />);
    const nextButton = screen.getByText('Next: Confirmation');
    expect(nextButton).toBeDisabled();
  });

  test('next button is enabled when form is valid', () => {
    renderWithChainProvider(<TokenDetailsForm {...mockProps} />);
    const nextButton = screen.getByText('Next: Confirmation');
    expect(nextButton).toBeEnabled();
  });
});
