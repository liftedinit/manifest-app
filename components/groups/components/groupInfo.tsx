import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { useBalance } from '@/hooks/useQueries';
import { shiftDigits } from '@/utils';
import Link from 'next/link';

export function GroupInfo({
  group,
  address,
  policyAddress,
}: Readonly<{
  group: any;
  address: string;
  policyAddress: string;
}>) {
  const { balance } = useBalance(policyAddress);

  if (!group) return null;

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{group.ipfsMetadata?.title}</h2>
      <div className="grid grid-cols-2 gap-4">
        <InfoItem label="Authors" value={group.ipfsMetadata?.authors} />
        <InfoItem label="Policy Address" value={policyAddress} isCopyable />
        <InfoItem
          label="Balance"
          value={`${balance?.amount ? shiftDigits(balance.amount, -6) : '0'} MFX`}
        />
        <InfoItem
          label="Threshold"
          value={`${group.policies[0]?.decision_policy?.threshold ?? '0'} / ${
            group.total_weight ?? '0'
          }`}
        />
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Active Proposals</h3>
        {/* Add a list or table of active proposals here */}
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Group Members</h3>
        {/* Add a list or table of group members here */}
      </div>
      <div className="mt-6 flex justify-between">
        <Link href={`/groups/submit-proposal/${policyAddress}`} legacyBehavior>
          <a className="btn btn-primary">New Proposal</a>
        </Link>
        <button className="btn btn-secondary">Leave Group</button>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  isCopyable = false,
}: {
  label: string;
  value: string;
  isCopyable?: boolean;
}) {
  return (
    <div>
      <span className="font-semibold">{label}:</span>{' '}
      {isCopyable ? <TruncatedAddressWithCopy address={value} slice={12} /> : <span>{value}</span>}
    </div>
  );
}
