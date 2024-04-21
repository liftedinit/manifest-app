import { Coin } from "@cosmjs/stargate";
import Link from "next/link";

export default function ProposalDetails({
  nextStep,
  formData,
  onDataChange,
}: {
  nextStep: () => void;
  formData: {
    title: string;
    proposers: string;
    summary: string;
    messages: [
      {
        from_address: string;
        to_address: string;
        amount: Coin[];
      }
    ];
    metadata: {
      title: string;
      authors: string;
      summary: string;
      details: string;
    };
  };
  onDataChange: (newData: {
    title: string;
    proposers: string;
    summary: string;
    messages: [
      {
        from_address: string;
        to_address: string;
        amount: Coin[];
      }
    ];
    metadata: {
      title: string;
      authors: string;
      summary: string;
      details: string;
    };
  }) => void;
}) {
  return (
    <section className="">
      <div className="lg:flex min-h-screen mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <ol className="flex flex-wrap justify-between items-center text-md font-medium text-center  mb-10">
              <li className="flex-1">
                <div className="text-center mb-2">1</div>
                <div>Info</div>
              </li>
              <li className="flex-1">
                <div className="text-center mb-2">2</div>
                <div>
                  <span>Messages</span>
                </div>
              </li>
              <li className="flex-1">
                <div className="text-cente mb-2">3</div>
                <div>Metadata</div>
              </li>
              <li className="flex-1">
                <div className="text-center mb-2">4</div>
                <div>Confirmation</div>
              </li>
            </ol>
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight  sm:mb-6 leding-tight ">
              Proposal
            </h1>
            <form className=" min-h-[330px]">
              <div className="grid gap-5 my-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="full-name"
                    className="block mb-2 text-sm font-medium"
                  >
                    Proposal Title
                  </label>
                  <input
                    type="text"
                    placeholder="Title"
                    className="input input-bordered w-full max-w-xs"
                    value={formData?.title}
                    onChange={(e) =>
                      onDataChange({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium "
                  >
                    Proposers
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. manifest123, manifest456"
                    className="input input-bordered w-full max-w-xs"
                    value={formData?.proposers}
                    onChange={(e) =>
                      onDataChange({ ...formData, proposers: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium  "
                  >
                    Summary
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full max-w-xs"
                    placeholder="Short Bio"
                    value={formData?.summary}
                    onChange={(e) =>
                      onDataChange({ ...formData, summary: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>
            </form>

            <button
              onClick={nextStep}
              className="w-full  mt-4 btn px-5 py-2.5 sm:py-3.5 btn-primary"
            >
              Next: Proposal Messages
            </button>
            <div className="flex space-x-3 ga-4 mt-6">
              <Link href={"/groups"} legacyBehavior>
                <button className=" btn btn-neutral  py-2.5 sm:py-3.5  w-1/2 ">
                  Back: Groups Page
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
