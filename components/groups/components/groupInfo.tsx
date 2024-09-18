import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { useBalance } from '@/hooks/useQueries';
import { shiftDigits } from '@/utils';
import ProfileAvatar from '@/utils/identicon';

export function GroupInfo({
  group,
  address,
  policyAddress,
  onUpdate,
}: Readonly<{
  group: any;
  address: string;
  policyAddress: string;
  onUpdate: () => void;
}>) {
  if (!group) return null;

  return (
    <div className="modal-box bg-base-300 max-w-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <ProfileAvatar walletAddress={policyAddress} size={40} />
          <h3 className="font-bold text-lg">{group.ipfsMetadata?.title}</h3>
        </div>
        <button
          className="btn btn-sm btn-circle btn-ghost"
          onClick={() => (document.getElementById('group-info-modal') as HTMLDialogElement).close()}
        >
          ✕
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className="text-xl font-semibold">Info</span>
        <button className="btn btn-primary" onClick={onUpdate}>
          Update
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Group Information</h4>
        <InfoItem label="Voting period" value={`${group.policies[0]?.voting_period ?? '0'} days`} />
        <InfoItem
          label="Qualified Majority"
          value={group.policies[0]?.decision_policy?.threshold ?? '0'}
        />
        <InfoItem label="Description" value={group.ipfsMetadata?.description ?? 'No description'} />

        <h4 className="font-semibold mt-6">Authors</h4>
        {typeof group.ipfsMetadata?.authors === 'string' ? (
          <InfoItem label="Author" value={group.ipfsMetadata.authors} />
        ) : Array.isArray(group.ipfsMetadata?.authors) ? (
          group.ipfsMetadata.authors.map((author: string, index: number) => (
            <InfoItem
              key={index}
              label={`Address ${index + 1}`}
              value={author}
              isAddress={author.startsWith('manifest')}
            />
          ))
        ) : (
          <InfoItem label="Author" value="No author information" />
        )}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  isAddress = false,
}: {
  label: string;
  value?: string;
  isAddress?: boolean;
}) {
  return (
    <div className="bg-base-200 p-3 rounded-lg">
      <span className="text-sm text-gray-400">{label}</span>
      {value && (
        <p className="mt-1 text-sm">
          {isAddress ? <TruncatedAddressWithCopy address={value} slice={12} /> : value}
        </p>
      )}
    </div>
  );
}
