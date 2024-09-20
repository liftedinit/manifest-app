import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { useBalance } from '@/hooks/useQueries';
import { shiftDigits } from '@/utils';
import ProfileAvatar from '@/utils/identicon';
import { ExtendedGroupType } from '@/hooks/useQueries';
import { UpdateGroupModal } from './updateGroupModal';

interface GroupInfoProps {
  group: ExtendedGroupType | null;
  policyAddress: string;
  address: string;
  onUpdate: () => void;
}

export function GroupInfo({ group, policyAddress, address, onUpdate }: GroupInfoProps) {
  if (!group || !group.policies || group.policies.length === 0) return null;

  const policy = group.policies[0];
  const votingPeriod = policy?.decision_policy?.windows?.voting_period;
  const votingPeriodDays = votingPeriod
    ? Math.floor(parseInt(votingPeriod.slice(0, -1)) / 86400)
    : 0;

  const threshold = policy?.decision_policy?.threshold ?? '0';

  const renderAuthors = () => {
    const authors = group.ipfsMetadata?.authors;
    if (!authors) return <InfoItem label="Author" value="No author information" />;

    if (typeof authors === 'string') {
      if (authors.startsWith('manifest1')) {
        return (
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Address" value={authors} isAddress={true} />
          </div>
        );
      }
      return <InfoItem label="Author" value={authors} />;
    }

    if (Array.isArray(authors)) {
      const manifestAddresses = authors.filter(author => author.startsWith('manifest1'));
      if (manifestAddresses.length > 0) {
        return (
          <div className="grid grid-cols-2 gap-4">
            {manifestAddresses.map((author, index) => (
              <InfoItem key={index} label="Address" value={author} isAddress={true} />
            ))}
          </div>
        );
      }
      return (
        <div>
          {authors.map((author, index) => (
            <InfoItem key={index} label={`Author ${index + 1}`} value={author} />
          ))}
        </div>
      );
    }

    return <InfoItem label="Author" value="Invalid author information" />;
  };

  return (
    <dialog id="group-info-modal" className="modal">
      <div className="modal-box bg-[#FFFFFF] dark:bg-[#1D192D] rounded-[24px] max-h-['574px'] max-w-[542px] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <ProfileAvatar walletAddress={policyAddress} size={40} />
            <h3 className="font-bold text-lg">{group.ipfsMetadata?.title}</h3>
          </div>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost">✕</button>
          </form>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-semibold">Info</span>
          <button
            className="btn btn-gradient text-white rounded-[12px] h-[52px] w-[140px]"
            onClick={() => {
              const modal = document.getElementById('update-group-modal') as HTMLDialogElement;
              if (modal) modal.showModal();
            }}
          >
            Update
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold dark:text-[#FFFFFF99] text-[#00000099]">
            Group Information
          </h4>
          <InfoItem label="Voting period" value={`${votingPeriodDays} days`} />
          <InfoItem label="Qualified Majority" value={threshold} />
          <InfoItem
            label="Description"
            value={group.ipfsMetadata?.details ?? 'No description'}
            isProposal={true}
          />

          <h4 className="font-semibold mt-6">Authors</h4>
          {renderAuthors()}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
      <UpdateGroupModal group={group} policyAddress={policyAddress} address={address} />
    </dialog>
  );
}

function InfoItem({
  label,
  value,
  isAddress = false,
  isProposal = false,
}: {
  label: string;
  value?: string;
  isAddress?: boolean;
  isProposal?: boolean;
}) {
  return (
    <div
      className={`dark:bg-[#FFFFFF0F] bg-[#0000000A] p-3 rounded-lg ${isProposal ? 'flex flex-col' : 'flex flex-row justify-between items-center'}`}
    >
      <span className="text-sm dark:text-[#FFFFFF66] text-[#00000066]">
        {isAddress ? '' : label}
      </span>
      {value && (
        <div
          className={`text-sm dark:text-[#FFFFFF99] text-[#00000099] ${isProposal ? 'mt-2' : ''}`}
        >
          {isAddress ? (
            <>
              <span className="text-sm text-[#FFFFFF66] block mb-1">Address</span>
              <TruncatedAddressWithCopy address={value} slice={12} />
            </>
          ) : (
            value
          )}
        </div>
      )}
    </div>
  );
}
