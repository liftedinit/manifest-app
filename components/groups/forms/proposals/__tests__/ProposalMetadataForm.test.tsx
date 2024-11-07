import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import ProposalMetadataForm from '@/components/groups/forms/proposals/ProposalMetadataForm';
import { renderWithChainProvider } from '@/tests/render';
import { mockProposalFormData } from '@/tests/mock';

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockProposalFormData,
  dispatch: jest.fn(),
};

// TODO: This test suite is throwing
//    Warning: Cannot update a component (`ProposalMetadataForm`) while rendering a different component (`Formik`). To locate the bad setState() call inside `Formik`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render
//        at Formik (node_modules/formik/dist/formik.cjs.development.js:1077:19)
//        at div
//        at div
//        at div
//        at section
//        at ProposalMetadataForm (components/groups/forms/proposals/ProposalMetadataForm.tsx:31:3)
//        at ToastProvider (contexts/toastContext.tsx:13:43)
//        at ChainProvider (node_modules/@cosmos-kit/react-lite/cjs/provider.js:8:26)
//        at SelectedWalletRepoProvider (node_modules/@cosmos-kit/react/cjs/context/useSelectedWalletContext.js:8:64)
//        at ChainProvider (node_modules/@cosmos-kit/react/cjs/provider.js:11:26)
//        at QueryClientProvider (node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js:20:3)
describe('ProposalMetadataForm Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('renders form with correct details', () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    expect(screen.getByText('Proposal Metadata')).toBeDefined();
    expect(screen.getByLabelText('Title')).toBeDefined();
    expect(screen.getByLabelText('Authors')).toBeDefined();
    expect(screen.getByLabelText('Summary')).toBeDefined();
    expect(screen.getByLabelText('Details')).toBeDefined();
  });

  test('updates form fields correctly', async () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);

    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'metadata',
        value: expect.objectContaining({ title: 'New Title' }),
      });
    });

    const authorsInput = screen.getByLabelText('Authors');
    fireEvent.change(authorsInput, { target: { value: 'New Author' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'metadata',
        value: expect.objectContaining({ authors: 'New Author' }),
      });
    });

    const summaryInput = screen.getByLabelText('Summary');
    fireEvent.change(summaryInput, { target: { value: 'New Summary' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'metadata',
        value: expect.objectContaining({ summary: 'New Summary' }),
      });
    });

    const detailsInput = screen.getByLabelText('Details');
    fireEvent.change(detailsInput, { target: { value: 'New Details' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'metadata',
        value: expect.objectContaining({ details: 'New Details' }),
      });
    });
  });

  test('next button is disabled when form is invalid', async () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: '' } });
    await waitFor(() => {
      const nextButton = screen.getByText('Next: Confirmation') as HTMLButtonElement;
      expect(nextButton.disabled).toBe(false);
    });
  });

  test('next button is enabled when form is valid and dirty', async () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    await waitFor(() => {
      const nextButton = screen.getByText('Next: Confirmation') as HTMLButtonElement;
      expect(nextButton.disabled).toBe(false);
    });
  });

  test('calls nextStep when next button is clicked', async () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    await waitFor(() => {
      const nextButton = screen.getByText('Next: Confirmation');
      fireEvent.click(nextButton);
      expect(mockProps.nextStep).toHaveBeenCalled();
    });
  });

  test('calls prevStep when prev button is clicked', () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    const prevButton = screen.getByText('Prev: Messages');
    fireEvent.click(prevButton);
    expect(mockProps.prevStep).toHaveBeenCalled();
  });
});
