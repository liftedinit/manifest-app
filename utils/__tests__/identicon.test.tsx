import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'bun:test';

import { formatComponent } from '@/tests';
import { ProfileAvatar } from '@/utils';

describe('ProfileAvatar', () => {
  test('renders correctly', () => {
    const mockup = render(
      <ProfileAvatar walletAddress="manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf" />
    );
    expect(screen.getByAltText('Profile Avatar')).toBeInTheDocument();

    expect(formatComponent(mockup.asFragment())).toMatchSnapshot();
  });
});
