import { truncateString } from '@/utils';

/**
 * Special list of names for accounts based on the name of the service.
 */
enum WalletDisplayNames {
  LEDGER = 'Ledger HSM',
}

export const Username = ({
  className,
  truncated,
  username,
  walletName,
}: {
  className?: string;
  truncated?: boolean;
  username?: string;
  walletName?: string;
}) => {
  let name = username || 'Anonymous';
  if (walletName !== undefined) {
    const walletDisplayName = walletName.toUpperCase() as keyof typeof WalletDisplayNames;
    name = WalletDisplayNames[walletDisplayName] ?? (username || 'Anonymous');
  }
  if (truncated) {
    name = truncateString(name);
  }

  return (
    <p className={className} title={username || 'Anonymous'}>
      {name}
    </p>
  );
};
