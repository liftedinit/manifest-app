import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, mock, test } from 'bun:test';

import { ModalDialog, SigningModalDialog } from '@/components';
import { renderWithWeb3AuthProvider } from '@/tests/render';

describe('ModalDialog', () => {
  afterEach(cleanup);

  test('renders correctly', () => {
    const mockup = render(<ModalDialog open={true} onClose={jest.fn()} />);

    expect(document.querySelector('[inert]')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Title' })).not.toBeInTheDocument();
  });

  test('renders correctly when closed', () => {
    const mockup = render(<ModalDialog open={false} onClose={jest.fn()} />);

    expect(document.querySelector('[inert]')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders title', () => {
    const mockup = render(
      <ModalDialog open={true} onClose={jest.fn()} title={<span>TITLE HERE</span>} />
    );

    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('TITLE HERE')).toBeInTheDocument();
  });

  test('renders children', () => {
    const mockup = render(
      <ModalDialog open={true} onClose={jest.fn()}>
        <div>CHILDREN HERE</div>
      </ModalDialog>
    );

    expect(screen.getByText('CHILDREN HERE')).toBeInTheDocument();
  });

  test('closes on clicking the close button', () => {
    const onClose = jest.fn();
    const mockup = render(<ModalDialog open={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  test('closes on Escape key press', () => {
    const onClose = jest.fn();
    const mockup = render(<ModalDialog open={true} onClose={onClose} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

describe('SigningModalDialog', () => {
  beforeEach(() => {
    // Mock next/router
    const m = jest.fn();
    mock.module('next/router', () => ({
      useRouter: m.mockReturnValue({
        query: {},
        push: jest.fn(),
      }),
    }));
  });

  afterEach(cleanup);

  test('render the SignModal component', async () => {
    const resolve = jest.fn();
    const mockup = renderWithWeb3AuthProvider(
      <SigningModalDialog open={true} onClose={jest.fn()}>
        <div>CHILDREN HERE</div>
      </SigningModalDialog>,
      {
        setIsSigning(isSigning: boolean): void {},
        setPromptId(id: string | undefined): void {},
        wallets: [],
        isSigning: true,
        prompt: { signData: {} as any, resolve },
      }
    );

    expect(document.querySelector('[inert]')).toBeInTheDocument();
    expect(screen.getByText('CHILDREN HERE')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    );
  });

  test('disable close button while signing', async () => {
    const resolve = jest.fn();
    const mockup = renderWithWeb3AuthProvider(
      <SigningModalDialog open={true} onClose={jest.fn()} />,
      {
        setIsSigning(isSigning: boolean): void {},
        setPromptId(id: string | undefined): void {},
        wallets: [],
        isSigning: true,
        prompt: undefined,
      }
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
  });

  test('enable close button while NOT signing', async () => {
    const resolve = jest.fn();
    const mockup = renderWithWeb3AuthProvider(
      <SigningModalDialog open={true} onClose={jest.fn()} />,
      {
        setIsSigning(isSigning: boolean): void {},
        setPromptId(id: string | undefined): void {},
        wallets: [],
        isSigning: false,
        prompt: undefined,
      }
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  });
});
