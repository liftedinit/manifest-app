import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { useBalance } from '@/hooks/useQueries';
import { shiftDigits } from '@/utils';
import ProfileAvatar from '@/utils/identicon';
import { ExtendedGroupType } from '@/hooks/useQueries';
import { UpdateGroupModal } from './updateGroupModal';
import { ThresholdDecisionPolicySDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';

interface GroupInfoProps {
  modalId: string;
  group: ExtendedGroupType | null;
  policyAddress: string;
  address: string;
  onUpdate: () => void;
}

export function GroupInfo({ modalId, group, policyAddress, address, onUpdate }: GroupInfoProps) {
  if (!group || !group.policies || group.policies.length === 0) return null;

  const policy = group.policies[0];
  const votingPeriod = (group.policies[0]?.decision_policy as ThresholdDecisionPolicySDKType)
    ?.windows?.voting_period;
  const votingPeriodSeconds = (() => {
    try {
      if (!votingPeriod) return 0;
      const seconds = Number(votingPeriod.toString().replace('s', ''));
      if (isNaN(seconds) || seconds < 0) return 0;
      return seconds;
    } catch (error) {
      console.error('Error parsing voting period:', error);
      return 0;
    }
  })();

  const votingPeriodDisplay = (() => {
    try {
      if (votingPeriodSeconds === 0) return 'No voting period';

      if (votingPeriodSeconds >= 86400) {
        const days = Math.floor(votingPeriodSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''}`;
      }
      if (votingPeriodSeconds >= 3600) {
        const hours = Math.floor(votingPeriodSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      }
      const minutes = Math.max(1, Math.floor(votingPeriodSeconds / 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } catch (error) {
      console.error('Error calculating voting period display:', error);
      return 'Invalid voting period';
    }
  })();

  const threshold =
    (policy?.decision_policy as ThresholdDecisionPolicySDKType)?.threshold ??
    'No threshold available';

  function renderAuthors() {
    const authors = group?.ipfsMetadata?.authors;

    if (!authors) {
      return <InfoItem label="Author" value="No author information" />;
    }

    const formatAddress = (author: string, index: number) => (
      <InfoItem key={index} label="Address" value={author} isAddress={true} />
    );

    const formatAuthor = (author: string, index: number) => (
      <InfoItem key={index} label={`Author ${index + 1}`} value={author} />
    );

    if (typeof authors === 'string') {
      if (authors.startsWith('manifest1')) {
        return <div className="grid grid-cols-2 gap-4">{formatAddress(authors, 0)}</div>;
      }
      return formatAuthor(authors, 0);
    }

    if (Array.isArray(authors)) {
      const manifestAddresses = authors.filter(author => author.startsWith('manifest1'));

      if (manifestAddresses.length > 0) {
        return (
          <div className="grid grid-cols-2 gap-4">
            {manifestAddresses.map((author, index) => formatAddress(author, index))}
          </div>
        );
      }

      return <div>{authors.map((author, index) => formatAuthor(author, index))}</div>;
    }

    return <InfoItem label="Author" value="Invalid author information" />;
  }

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box bg-secondary rounded-[24px] max-h-['574px'] max-w-[542px] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <ProfileAvatar walletAddress={policyAddress} size={40} />
            <h3 className="font-bold text-lg">{group.ipfsMetadata?.title}</h3>
          </div>
          <form method="dialog">
            <button className=" absolute top-3 right-3 btn btn-sm btn-circle btn-ghost text-black dark:text-white outline-none">
              ✕
            </button>
          </form>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-semibold text-secondary-content">Info</span>
          <button
            aria-label={'update-btn'}
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
          <InfoItem label="Voting period" value={votingPeriodDisplay} />
          <InfoItem label="Qualified Majority" value={threshold} />

          <InfoItem
            label="Description"
            value={group.ipfsMetadata?.details ?? 'No description'}
            isProposal={true}
          />
          <InfoItem label="Policy Address" value={policyAddress} isAddress={true} />
          <h4 className="font-semibold mt-6 text-secondary-content">Authors</h4>
          {renderAuthors()}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
      <UpdateGroupModal
        group={group}
        policyAddress={policyAddress}
        address={address}
        onUpdate={onUpdate}
      />
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
      className={`dark:bg-[#FFFFFF0F] bg-[#0000000A] p-3 rounded-lg ${
        isProposal || isAddress ? 'flex flex-col' : 'flex flex-row justify-between items-center'
      }`}
    >
      <span className="text-sm dark:text-[#FFFFFF66] text-[#00000066]">
        {isAddress ? '' : label}
      </span>
      {value && (
        <div
          className={`text-sm dark:text-[#FFFFFF99] text-[#00000099] ${isProposal ? 'mt-2' : ''}`}
        >
          {isAddress ? (
            <div>
              <span className="text-sm dark:text-[#FFFFFF66] text-[#00000066] block mb-1">
                Address
              </span>
              <p className="text-sm text-[#00000099] dark:text-[#FFFFFF99] xs:block hidden">
                <TruncatedAddressWithCopy address={value} slice={24} />
              </p>
              <p className="text-sm text-[#00000099] dark:text-[#FFFFFF99] xs:hidden block">
                <TruncatedAddressWithCopy address={value} slice={14} />
              </p>
            </div>
          ) : (
            value
          )}
        </div>
      )}
    </div>
  );
}
