import { describe, test, afterEach, expect } from 'bun:test';
import React from 'react';
import {render, screen, fireEvent, cleanup, waitFor, within} from '@testing-library/react';
import { ValidatorDetailsModal } from '@/components/admins/modals/validatorModal';
import matchers from '@testing-library/jest-dom/matchers';
import {mockActiveValidators} from "@/tests/mock";
import {renderWithChainProvider} from "@/tests/render";

expect.extend(matchers);

const validator = mockActiveValidators[0];
const modalId = 'test-modal';
const admin = 'manifest1adminaddress';

function renderWithProps(props = {}) {
  return renderWithChainProvider(<ValidatorDetailsModal validator={validator} modalId={modalId} admin={admin} {...props} />);
}

describe('ValidatorDetailsModal Component', () => {
  afterEach(cleanup);

  test('renders modal with correct details', () => {
    renderWithProps();
    expect(screen.getByText('Validator Details')).toBeInTheDocument();
    expect(screen.getByText('Validator One')).toBeInTheDocument();
    expect(screen.getByText('security1@foobar.com')).toBeInTheDocument();
    const detailsContainer = screen.getByLabelText('details')
    expect(within(detailsContainer).getByText('details1')).toBeInTheDocument();
  });

  test('updates input field correctly', () => {
    renderWithProps();
    const input = screen.getByPlaceholderText('1000');
    fireEvent.change(input, { target: { value: 2000 } });
    expect(input).toHaveValue(2000);
  });

  test('enables update button when input is valid', () => {
    renderWithProps();
    const input = screen.getByPlaceholderText('1000');
    fireEvent.change(input, { target: { value: 2000 } });
    const updateButton = screen.getByText('update');
    expect(updateButton).toBeEnabled();
  });

  // // TODO: Why is this test failing?
  // // https://github.com/capricorn86/haVyppy-dom/issues/1184
  // test('closes modal when close button is clicked', async () => {
  //   renderWithProps();
  //   const closeButton = screen.getByText('✕');
  //   fireEvent.click(closeButton);
  //   await waitFor(() => expect(screen.queryByText('Validator Details')).not.toBeInTheDocument());
  // });
});