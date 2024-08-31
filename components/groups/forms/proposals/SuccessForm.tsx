import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { ProposalFormData } from '@/helpers';
import Link from 'next/link';

export default function ProposalSuccess({
  formData,
  prevStep,
}: Readonly<{
  formData: ProposalFormData;
  prevStep: () => void;
}>) {
  const renderProposers = () => {
    if (formData.proposers.startsWith('manifest')) {
      return <TruncatedAddressWithCopy address={formData.proposers} slice={14} />;
    } else if (formData.proposers.includes(',')) {
      return (
        <div className="flex flex-wrap gap-2">
          {formData.proposers.split(',').map((proposer, index) => (
            <div key={index}>
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
      return <span>{formData.proposers}</span>;
    }
  };

  return (
    <section className="lg:max-h-[90vh] max-h-screen lg:mt-1 mt-12  flex items-center justify-center ">
      <div className="max-w-2xl mx-auto bg-base-300 shadow-lg rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Proposal Submitted Successfully!</h1>
        <p className="text-lg mb-2 text-pretty">
          Your proposal has been successfully submitted to the group.
        </p>
        <p className="text-md text-gray-300 mb-6 text-pretty">
          Group members can now vote on your proposal. The voting period will last for the duration
          specified in the group&apos;s settings.
        </p>
        <div className="border-t border-gray-700 pt-4">
          <h2 className="text-2xl font-semibold mb-4">Proposal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-light text-gray-400">TITLE</h3>
              <p className="text-lg font-medium">{formData.title}</p>
            </div>
            <div>
              <h3 className="text-md font-light text-gray-400">PROPOSER(S)</h3>
              {/*
                TODO: Verify the render is correct.
                      I changed the <p> to a <div> here because <div> (in TruncatedAddressWithCopy) cannot be a descendant of <p>
              */}
              <div className="text-lg font-medium">{renderProposers()}</div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-md font-light text-gray-400">SUMMARY</h3>
              <p className="text-lg font-medium">{formData.metadata.summary}</p>
            </div>
            <div className="col-span-1 md:col-span-2 max-h-28 overflow-y-auto">
              <h3 className="text-md font-light text-gray-400">DETAILS</h3>
              <p className="text-lg font-medium">{formData.metadata.details}</p>
            </div>
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-md font-light text-gray-400">MESSAGES</h3>
              {formData.messages.map((message, index) => (
                <div key={index} className="mb-2">
                  <p className="text-md font-medium">Type: {message.type}</p>
                  {/* You can add more specific message details here if needed */}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full justify-between items-center">
              <Link href="/groups" legacyBehavior>
                <button className="btn btn-md btn-secondary w-full">Back to Groups Page</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
