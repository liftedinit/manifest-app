import { afterEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import GroupDetails from '@/components/groups/forms/groups/GroupDetailsForm';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockGroupFormData } from '@/tests/mock';

expect.extend(matchers);

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
    expect(screen.getByLabelText('Group Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Authors')).toBeInTheDocument();
    expect(screen.getByLabelText('Summary')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Forum Link')).toBeInTheDocument();
  });

  test('updates form fields correctly', async () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);

    const titleInput = screen.getByLabelText('Group Title');
    fireEvent.change(titleInput, { target: { value: 'New Group Title' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'title',
        value: 'New Group Title',
      });
    });

    const authorsInput = screen.getByLabelText('Authors');
    fireEvent.change(authorsInput, { target: { value: 'New Author' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'authors',
        value: 'New Author',
      });
    });

    const summaryInput = screen.getByLabelText('Summary');
    fireEvent.change(summaryInput, { target: { value: 'New Summary' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'summary',
        value: 'New Summary',
      });
    });

    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'description',
        value: 'New Description',
      });
    });

    const forumLinkInput = screen.getByLabelText('Forum Link');
    fireEvent.change(forumLinkInput, { target: { value: 'http://newforumlink.com' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'forumLink',
        value: 'http://newforumlink.com',
      });
    });
  });

  test('next button is enabled when form is not dirty but valid', async () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);
    expect(screen.getByText('Next: Group Policy')).toBeEnabled();
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
        authors: '',
        summary: '',
        description: '',
        forumLink: '',
        members: [],
        votingThreshold: '',
      },
    };

    renderWithChainProvider(<GroupDetails {...invalidProps} />);
    const nextButton = screen.getByText('Next: Group Policy');
    await waitFor(() => expect(nextButton).toBeDisabled());

    updateField('Group Title', 'New Group Title');
    await waitFor(() => expect(nextButton).toBeDisabled());
    updateField('Authors', 'New Author');
    await waitFor(() => expect(nextButton).toBeDisabled());
    updateField('Summary', 'New Summary');
    await waitFor(() => expect(nextButton).toBeDisabled());
    updateField('Description', 'New Long Description is Long Enough');
    await waitFor(() => expect(nextButton).toBeEnabled());
  });

  test('next button is enabled when form is valid and dirty', async () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);
    const titleInput = screen.getByLabelText('Group Title');
    fireEvent.change(titleInput, { target: { value: 'New Group Title' } });
    await waitFor(() => {
      expect(screen.getByText('Next: Group Policy')).toBeEnabled();
    });
  });

  test('calls nextStep when next button is clicked', async () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);

    const titleInput = screen.getByLabelText('Group Title');
    fireEvent.change(titleInput, { target: { value: 'New Group Title' } });

    const authorsInput = screen.getByLabelText('Authors');
    fireEvent.change(authorsInput, { target: { value: 'New Author' } });

    const summaryInput = screen.getByLabelText('Summary');
    fireEvent.change(summaryInput, {
      target: { value: 'New summary that is at least 10 characters long' },
    });

    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, {
      target: { value: 'New description that is at least 20 characters long' },
    });

    await waitFor(() => {
      expect(screen.getByText('Next: Group Policy')).toBeEnabled();
    });

    const nextButton = screen.getByText('Next: Group Policy');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockProps.nextStep).toHaveBeenCalled();
    });
  });

  test('updates authors field with address when address button is clicked', async () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);
    const addressButton = screen.getAllByRole('button')[0];
    fireEvent.click(addressButton);
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'authors',
        value: mockProps.address,
      });
    });
  });
});
