import React from "react";
import { ProposalFormData, ProposalAction } from "@/helpers/formReducer";
import Link from "next/link";
import { PiAddressBook } from "react-icons/pi";

export default function ProposalDetails({
  nextStep,
  formData,
  dispatch,
  address,
}: Readonly<{
  nextStep: () => void;
  formData: ProposalFormData;
  dispatch: React.Dispatch<ProposalAction>;
  address: string;
}>) {
  const updateField = (field: keyof ProposalFormData, value: any) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  return (
    <section className="">
      <div className="lg:flex  mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:mb-6 leading-tight ">
              Proposal
            </h1>
            <form className="min-h-[330px]">
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
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium "
                  >
                    Proposer
                  </label>
                  <div className="flex flex-row justify-between items-center">
                    {" "}
                    <input
                      type="text"
                      placeholder="List of authors"
                      className="input input-bordered rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none w-full max-w-xs"
                      value={formData.proposers}
                      onChange={(e) => updateField("proposers", e.target.value)}
                    />{" "}
                    <button
                      aria-label={"address-btn"}
                      onClick={(e) => {
                        e.preventDefault();
                        updateField("proposers", address);
                      }}
                      className="btn btn-primary rounded-tr-lg rounded-br-lg  rounded-bl-none rounded-tl-none "
                    >
                      <PiAddressBook className="w-6 h-6" />
                    </button>
                  </div>
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
                    onChange={(e) => updateField("summary", e.target.value)}
                  ></textarea>
                </div>
              </div>
            </form>

            <button
              onClick={nextStep}
              className="w-full mt-4 btn px-5 py-2.5 sm:py-3.5 btn-primary"
              disabled={
                !formData.title || !formData.proposers || !formData.summary
              }
            >
              Next: Proposal Messages
            </button>
            <div className="flex space-x-3 ga-4 mt-6">
              <Link href={"/groups"} legacyBehavior>
                <button className="btn btn-neutral py-2.5 sm:py-3.5 w-1/2 ">
                  <span className="hidden sm:inline">Back: Groups Page</span>
                  <span className="sm:hidden">Back: Groups</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
