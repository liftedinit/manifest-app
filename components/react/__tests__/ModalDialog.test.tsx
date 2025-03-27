import { RenderResult, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';

import { ModalDialog, SigningModalDialog } from '@/components';
import { clearAllMocks, formatComponent, mockRouter } from '@/tests';
import { renderWithWeb3AuthProvider } from '@/tests/render';

/**
 * Match the snapshot of the dialog component. Because <Dialog /> is a portal, we need to
 * format the portal itself to get the correct snapshot.
 * @param name
 */
function snapshot(mockup: RenderResult, name?: string) {
  name = name ? name + ' - ' : '';
  expect(formatComponent(mockup.asFragment())).toMatchSnapshot(`${name}standin`);

  // This will show the portal itself.
  expect(formatComponent(screen.queryByRole('dialog'))).toMatchSnapshot(`${name}portal`);
}

describe('ModalDialog', () => {
  afterEach(cleanup);

  test('renders correctly', () => {
    const mockup = render(
      <ModalDialog open={true} onClose={jest.fn()}>
        Hello World
      </ModalDialog>
    );

    // expect(document.querySelector('[inert]')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Title' })).not.toBeInTheDocument();
    snapshot(mockup);
  });

  test('renders to nothing if not visible', () => {
    const mockup = render(<ModalDialog open={false} onClose={jest.fn()} />);
    expect(mockup.container).toBeEmptyDOMElement();
    snapshot(mockup);
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
    mockRouter();
  });

  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

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
