import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import { FormData } from "@/helpers";
import Link from "next/link";

export default function Success({
  formData,
  prevStep,
}: {
  formData: FormData;
  prevStep: () => void;
}) {
  const renderAuthors = () => {
    if (formData.authors.startsWith("manifest")) {
      return <TruncatedAddressWithCopy address={formData.authors} slice={14} />;
    } else if (formData.authors.includes(",")) {
      return (
        <div className="flex flex-wrap gap-2">
          {formData.authors.split(",").map((author, index) => (
            <div key={index}>
              {author.trim().startsWith("manifest") ? (
                <TruncatedAddressWithCopy address={author.trim()} slice={14} />
              ) : (
                <span>{author.trim()}</span>
              )}
            </div>
          ))}
        </div>
      );
    } else {
      return <span>{formData.authors}</span>;
    }
  };

  return (
    <section className="lg:max-h-[90vh] max-h-screen lg:mt-1 mt-12  flex items-center justify-center ">
      <div className="max-w-2xl mx-auto bg-base-300 shadow-lg rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Success!</h1>
        <p className="text-lg mb-2 text-pretty">
          Your transaction was successfully signed and broadcasted.
        </p>
        <p className="text-md text-gray-300 mb-6 text-pretty">
          You may now interact with your group by adding members, submitting or
          voting on proposals, and changing group parameters.
        </p>
        <p className="text-md text-gray-300 mb-6 text-pretty">
          Remember to fund your group by sending tokens to the policy address{" "}
          <span>
            <TruncatedAddressWithCopy address="address" slice={24} />
          </span>
        </p>
        <div className="border-t border-gray-700 pt-4">
          <h2 className="text-2xl font-semibold mb-4">Group Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-light text-gray-400">TITLE</h3>
              <p className="text-lg font-medium">{formData.title}</p>
            </div>
            <div>
              <h3 className="text-md font-light text-gray-400">AUTHORS</h3>
              <p className="text-lg font-medium">{renderAuthors()}</p>
            </div>
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-md font-light text-gray-400">SUMMARY</h3>
              <p className="text-lg font-medium">{formData.summary}</p>
            </div>
            <div className="col-span-1 md:col-span-2 max-h-28 overflow-y-auto">
              <h3 className="text-md font-light text-gray-400">DESCRIPTION</h3>
              <p className="text-lg font-medium">{formData.description}</p>
            </div>
            <div>
              <h3 className="text-md font-light text-gray-400">FORUM LINK</h3>
              <p className="text-lg font-medium">{formData.forumLink}</p>
            </div>
            <div>
              <h3 className="text-md font-light text-gray-400">
                VOTING PERIOD
              </h3>
              <p className="text-lg font-medium">
                {formData.votingPeriod.seconds.toString()} seconds
              </p>
            </div>
            <div>
              <h3 className="text-md font-light text-gray-400">
                VOTING THRESHOLD
              </h3>
              <p className="text-lg font-medium">{formData.votingThreshold}</p>
            </div>
          </div>
          <div className="mt-6">
            <div className=" w-full   justify-between items-center">
              <Link href={"/groups"} legacyBehavior>
                <button className="btn btn-md btn-secondary w-full">
                  Back to Groups Page
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
