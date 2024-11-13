import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { ProposalFormData } from '@/helpers';
import { useProposalsByPolicyAccount } from '@/hooks';
import Link from 'next/link';
import { useRouter } from 'next/router';
export default function ProposalSuccess({
  formData,
}: Readonly<{
  formData: ProposalFormData;
}>) {
  const router = useRouter();
  const policyAddress = router.query.policyAddress;
  const renderProposers = () => {
    if (formData.proposers.startsWith('manifest')) {
      return <TruncatedAddressWithCopy address={formData.proposers} slice={14} />;
    } else if (formData.proposers.includes(',')) {
      return (
        <div className="grid grid-cols-3 gap-4">
          {formData.proposers.split(',').map((proposer, index) => (
            <div
              key={index}
              className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg flex items-center"
            >
              {proposer.trim().startsWith('manifest') ? (
                <TruncatedAddressWithCopy address={proposer.trim()} slice={14} />
              ) : (
                <span>{proposer.trim()}</span>
              )}
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg flex items-center">
          <span>{formData.proposers}</span>
        </div>
      );
    }
  };

  const { proposals } = useProposalsByPolicyAccount(policyAddress as string);
  const mostRecentProposalCount = proposals[proposals.length - 1]?.id;
  return (
    <section>
      <div className="w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
        <div className="flex justify-center p-4 rounded-[8px] mb-6 w-full dark:bg-[#FAFAFA1F] bg-[#A087FF1F] items-center">
          <h1 className="text-xl text-primary font-bold">Proposal Submitted Successfully!</h1>
        </div>

        <div className="space-y-6">
          <p className="text-lg mb-2">
            Your proposal has been successfully submitted to the group.
          </p>
          <p className="text-md text-gray-400 mb-6">
            Group members can now vote on your proposal. The voting period will last for the
            duration specified in the group&apos;s settings.
          </p>

          {/* Proposal Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Proposal Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg">
                <label className="text-sm text-gray-400">TITLE</label>
                <div>{formData.title}</div>
              </div>
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg">
                <label className="text-sm text-gray-400">SUMMARY</label>
                <div>{formData.metadata.summary}</div>
              </div>
            </div>
          </div>

          {/* Proposers */}
          <div className="max-h-28 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Proposer(s)</h2>
            {renderProposers()}
          </div>

          {/* Details */}
          <div className="max-h-44 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg">
              <p>{formData.metadata.details}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-44 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <div className="grid grid-cols-2 gap-4">
              {formData.messages.map((message, index) => (
                <div key={index} className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Type</div>
                  <div>{message.type}</div>
                  {/* You can add more specific message details here if needed */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-6 mt-6 mx-auto w-full">
        <Link href={`/groups?policyAddress=${policyAddress}`} className="w-[calc(50%-12px)]">
          <button className="btn btn-neutral w-full">Back to Groups Page</button>
        </Link>
        <Link
          href={`/groups?policyAddress=${policyAddress}&proposalId=${mostRecentProposalCount}`}
          className="w-[calc(50%-12px)]"
        >
          <button className="btn btn-gradient w-full text-white">View Proposal</button>
        </Link>
      </div>
    </section>
  );
}
