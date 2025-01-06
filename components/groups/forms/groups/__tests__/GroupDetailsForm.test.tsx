import { afterEach, describe, expect, jest, test, mock } from 'bun:test';
import React from 'react';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import GroupDetails from '@/components/groups/forms/groups/GroupDetailsForm';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { manifestAddr1, mockGroupFormData } from '@/tests/mock';
import { Duration } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/duration';

expect.extend(matchers);

// Mock next/router
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

const mockProps = {
  nextStep: jest.fn(),
  formData: mockGroupFormData,
  dispatch: jest.fn(),
  address: 'manifest1address',
};

describe('GroupDetails Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('renders component with correct details', () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);
    expect(screen.getByText('Group details')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Author name or address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Long Bio')).toBeInTheDocument();
  });

  test('updates form fields correctly', async () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);

    const titleInput = screen.getByPlaceholderText('Title');
    fireEvent.change(titleInput, { target: { value: 'New Group Title' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'title',
        value: 'New Group Title',
      });
    });

    const summaryInput = screen.getByPlaceholderText('Long Bio');
    fireEvent.change(summaryInput, { target: { value: 'New Summary' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'description',
        value: 'New Summary',
      });
    });

    const authorsInput = screen.getByPlaceholderText('Author name or address');
    fireEvent.change(authorsInput, { target: { value: manifestAddr1 } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'authors',
        value: [manifestAddr1],
      });
    });
  });

  test('next button is enabled when form is not dirty but valid', async () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);
    expect(screen.getByText('Next: Group Members')).toBeEnabled();
  });

  test('next button is disabled when form is dirty and invalid', async () => {
    function updateField(field: string, validValue: string) {
      const input = screen.getByLabelText(field);
      fireEvent.change(input, { target: { value: validValue } });
    }

    const invalidProps = {
      ...mockProps,
      formData: {
        ...mockGroupFormData,
        title: '',
        authors: [],
        description: '',
        members: [],
        votingThreshold: '',
        votingPeriod: Duration.fromPartial({ seconds: 1n, nanos: 1 }),
      },
    };

    renderWithChainProvider(<GroupDetails {...invalidProps} />);
    const nextButton = screen.getByText('Next: Group Members');
    await waitFor(() => expect(nextButton).toBeDisabled());

    updateField('Group Title', 'New Group Title');
    await waitFor(() => expect(nextButton).toBeDisabled());
    updateField('Author name or address', manifestAddr1);
    await waitFor(() => expect(nextButton).toBeDisabled());
    updateField('Description', 'New Long Description is Long Enough well well well...');
    await waitFor(() => expect(nextButton).toBeEnabled());
  });

  test('next button is enabled when form is valid and dirty', async () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);
    const titleInput = screen.getByLabelText('Group Title');
    fireEvent.change(titleInput, { target: { value: 'New Group Title' } });
    await waitFor(() => {
      expect(screen.getByText('Next: Group Members')).toBeEnabled();
    });
  });

  test('calls nextStep when next button is clicked', async () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);

    const titleInput = screen.getByLabelText('Group Title');
    fireEvent.change(titleInput, { target: { value: 'New Group Title' } });

    const authorsInput = screen.getByLabelText('Author name or address');
    fireEvent.change(authorsInput, { target: { value: manifestAddr1 } });

    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, {
      target: { value: 'New description that is at least 20 characters long' },
    });

    await waitFor(() => {
      expect(screen.getByText('Next: Group Members')).toBeEnabled();
    });

    const nextButton = screen.getByText('Next: Group Members');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockProps.nextStep).toHaveBeenCalled();
    });
  });
});
