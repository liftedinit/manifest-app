import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { Mock, afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';

import { DenomImage } from '@/components/factory/components/DenomImage';
import { clearAllMocks, formatComponent, mockModule } from '@/tests';

// A cute little candle gif
const uri =
  'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHg1aHVqa3NoMG45bzYwbHR5ODk3b2JqbHhnemlmcXpjOXB0enExMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zHcirZSkw8RSDhawFl/giphy.gif';

const renderWithProps = (props = {}) => {
  const defaultProps = {
    denom: {
      base: 'umfx',
      uri: uri,
    } as MetadataSDKType,
  };
  return render(<DenomImage {...defaultProps} {...props} />);
};

describe('DenomImage', () => {
  let $setTimeout: Mock<typeof setTimeout>;

  beforeEach(() => {
    $setTimeout = spyOn(global, 'setTimeout');

    mockModule('next/image', () => ({
      __esModule: true,
      default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element,jsx-a11y/alt-text
        return <img alt="" {...props} />;
      },
    }));
  });

  afterEach(() => {
    $setTimeout.mockClear();
    clearAllMocks();
    cleanup();
  });

  test('renders loading state correctly', () => {
    const mockup = renderWithProps();
    expect(screen.getByLabelText('denom image skeleton')).toBeInTheDocument();

    expect(formatComponent(mockup.asFragment())).toMatchSnapshot();
  });

  test('renders MFX token image correctly', async () => {
    const mockup = renderWithProps();
    expect($setTimeout).toHaveBeenCalledTimes(1);
    $setTimeout.mock.calls[0][0]();
    await waitFor(() => expect(document.querySelector('[src=/logo.svg]')).toBeInTheDocument());
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot();
  });

  test('renders ProfileAvatar for unsupported URL', async () => {
    const mockup = renderWithProps({
      denom: { base: 'unsupported', uri: 'https://unsupported.com/token.png' },
    });
    expect($setTimeout).toHaveBeenCalledTimes(1);
    $setTimeout.mock.calls[0][0]();
    await waitFor(() => expect(screen.getByAltText('Profile Avatar')).toBeInTheDocument());
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot();
  });

  test('renders image from supported URL', async () => {
    const mockup = renderWithProps({ denom: { base: 'supported', uri: uri } });
    expect($setTimeout).toHaveBeenCalledTimes(1);
    $setTimeout.mock.calls[0][0]();
    await waitFor(() => expect(document.querySelector(`[src="${uri}"]`)).toBeInTheDocument());
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot();
  });
});
