import { truncateString } from '@/utils';

/**
 * Special list of names for accounts based on the name of the service.
 */
const specialUsernames: Record<string, string> = Object.assign(Object.create(null), {
  LEDGER: 'Ledger HSM',
});

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
  let name = specialUsernames[walletName?.toUpperCase()] ?? (username || 'Anonymous');
  if (truncated) {
    name = truncateString(name);
  }

  return (
    <p className={className} title={username || 'Anonymous'}>
      {name}
    </p>
  );
};
