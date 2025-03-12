import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import React from 'react';

import ValidatorList from '@/components/admins/components/validatorList';
import { clearAllMocks, mockRouter } from '@/tests';
import { mockActiveValidators, mockPendingValidators } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

const renderWithProps = (props = {}) => {
  const defaultProps = {
    admin: 'admin1',
    activeValidators: mockActiveValidators,
    pendingValidators: mockPendingValidators,
    isLoading: false,
  };
  return renderWithChainProvider(<ValidatorList {...defaultProps} {...props} />);
};

describe('ValidatorList', () => {
  beforeEach(() => {
    mockRouter();
  });
  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

  test('renders correctly', () => {
    renderWithProps();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Validator One')).toBeInTheDocument();
    expect(screen.getByText('Validator Two')).toBeInTheDocument();
  });

  test('search functionality works', () => {
    renderWithProps();
    fireEvent.change(screen.getByPlaceholderText('Search for a validator...'), {
      target: { value: 'Validator One' },
    });
    expect(screen.getByText('Validator One')).toBeInTheDocument();
    expect(screen.queryByText('Validator Two')).not.toBeInTheDocument();
  });

  test('active/pending toggle works', () => {
    renderWithProps();
    fireEvent.click(screen.getByText('Pending'));
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Validator Three')).toBeInTheDocument();
  });

  test('clicking on a validator row opens the modal', async () => {
    renderWithProps();
    fireEvent.click(screen.getByText('Validator One'));
    await waitFor(() => {
      expect(screen.getByText('Validator Details')).toBeInTheDocument();
      expect(screen.getByText('SECURITY CONTACT')).toBeInTheDocument();
      expect(screen.getByText('OPERATOR ADDRESS')).toBeInTheDocument();
    });
  });

  test('remove button works and shows the warning modal', async () => {
    renderWithProps();
    const allRemoveButtons = screen.getAllByTestId('remove-validator');
    fireEvent.click(allRemoveButtons[0]);
    await waitFor(() =>
      expect(screen.getByText('Are you sure you want to remove the validator')).toBeInTheDocument()
    );
  });
});
