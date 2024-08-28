import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import MemberInfoForm from '@/components/groups/forms/groups/MemberInfoForm';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import {mockGroupFormData} from "@/tests/mock";

expect.extend(matchers);

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockGroupFormData,
  dispatch: jest.fn(),
  address: 'cosmos1address',
};

describe('MemberInfoForm Component', () => {
  afterEach(cleanup);

  test('renders component with correct details', () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    expect(screen.getByText('Member Info')).toBeInTheDocument();

    const addr0 = screen.getByLabelText('address-0');
    expect(addr0).toBeInTheDocument();
    expect(addr0).toHaveValue('manifest1member1');

    const addr1 = screen.getByLabelText('address-1');
    expect(addr1).toBeInTheDocument();
    expect(addr1).toHaveValue('manifest1member2');

    const name0 = screen.getByLabelText('name-0');
    expect(name0).toBeInTheDocument();
    expect(name0).toHaveValue('Member 1');

    const name1 = screen.getByLabelText('name-1');
    expect(name1).toBeInTheDocument();
    expect(name1).toHaveValue('Member 2');

    const weight0 = screen.getByLabelText('weight-0');
    expect(weight0).toBeInTheDocument();
    expect(weight0).toHaveValue('1');

    const weight1 = screen.getByLabelText('weight-1');
    expect(weight1).toBeInTheDocument();
    expect(weight1).toHaveValue('2');
  });

  // // TODO: Make this test pass. Why is the input not being updated?
  // test('updates form fields correctly', () => {
  //   renderWithChainProvider(<MemberInfoForm {...mockProps} />);
  //   const addressInput = screen.getByLabelText('address-0');
  //   fireEvent.change(addressInput, { target: { value: 'newaddress' } });
  //   expect(addressInput).toHaveValue('newaddress');
  //
  //   const nameInput = screen.getByLabelText('name-0');
  //   fireEvent.change(nameInput, { target: { value: 'New Name' } });
  //   expect(nameInput).toHaveValue('New Name');
  //
  //   const weightInput = screen.getByLabelText('weight-0');
  //   fireEvent.change(weightInput, { target: { value: '3' } });
  //   expect(weightInput).toHaveValue('3');
  // });

  test('next button is disabled when form is invalid', () => {
    const invalidFormData = { ...mockGroupFormData, members: [{ address: '', name: '', weight: '' }] };
    renderWithChainProvider(<MemberInfoForm {...mockProps} formData={invalidFormData} />);
    const nextButton = screen.getByText('Next: Group Policy');
    expect(nextButton).toBeDisabled();
  });

  test('next button is enabled when form is valid', () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    const nextButton = screen.getByText('Next: Group Policy');
    expect(nextButton).toBeEnabled();
  });

  test('calls nextStep when next button is clicked', () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    const nextButton = screen.getByText('Next: Group Policy');
    fireEvent.click(nextButton);
    expect(mockProps.nextStep).toHaveBeenCalled();
  });

  test('calls prevStep when prev button is clicked', () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    const prevButton = screen.getByText('Prev: Group Policy');
    fireEvent.click(prevButton);
    expect(mockProps.prevStep).toHaveBeenCalled();
  });

  test('increases and decreases number of members correctly', () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    const increaseButton = screen.getByText('+');
    const decreaseButton = screen.getByText('-');
    const memberCountInput = screen.getByLabelText('member-count');

    fireEvent.click(increaseButton);
    expect(memberCountInput).toHaveValue('3');

    fireEvent.click(decreaseButton);
    expect(memberCountInput).toHaveValue('2');
  });
});
