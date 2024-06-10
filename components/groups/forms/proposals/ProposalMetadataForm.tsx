import React from "react";
import { ProposalFormData, ProposalAction } from "@/helpers/formReducer";

export default function ProposalMetadataForm({
  nextStep,
  prevStep,
  formData,
  dispatch,
}: {
  nextStep: () => void;
  prevStep: () => void;
  formData: ProposalFormData;
  dispatch: React.Dispatch<ProposalAction>;
}) {
  const handleChange = (
    field: keyof ProposalFormData["metadata"],
    value: any
  ) => {
    dispatch({
      type: "UPDATE_FIELD",
      field: "metadata",
      value: {
        ...formData.metadata,
        [field]: value,
      },
    });
  };

  return (
    <section className="">
      <div className="lg:flex min-h-screen mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <ol className="flex flex-wrap justify-between items-center text-md font-medium text-center mb-10">
              <li className="flex-1">
                <div className="flex items-center sm:block after:content-['/'] sm:after:hidden after:mx-2 after:font-light">
                  <svg
                    className="w-4 h-4 mr-2 sm:mb-2 sm:w-6 sm:h-6 sm:mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="hidden sm:inline-flex">Info</span>
                </div>
              </li>
              <li className="flex-1">
                <div className="flex items-center sm:block after:content-['/'] sm:after:hidden after:mx-2 after:font-light">
                  <svg
                    className="w-4 h-4 mr-2 sm:mb-2 sm:w-6 sm:h-6 sm:mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="hidden sm:inline-flex">Messages</span>
                </div>
              </li>
              <li className="flex-1">
                <div className="text-center mb-2">3</div>
                <div>Metadata</div>
              </li>
              <li className="flex-1">
                <div className="text-center mb-2">4</div>
                <div>Confirmation</div>
              </li>
            </ol>
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:mb-6 leading-tight">
              Proposal Metadata
            </h1>
            <form className="min-h-[330px]">
              <div className="grid gap-5 my-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered w-full max-w-xs"
                    value={formData.metadata.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="authors"
                    className="block mb-2 text-sm font-medium"
                  >
                    Authors
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered w-full max-w-xs"
                    value={formData.metadata.authors}
                    onChange={(e) => handleChange("authors", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="summary"
                    className="block mb-2 text-sm font-medium"
                  >
                    Summary
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full max-w-xs"
                    placeholder="Short Description"
                    value={formData.metadata.summary}
                    onChange={(e) => handleChange("summary", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="details"
                    className="block mb-2 text-sm font-medium"
                  >
                    Details
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full max-w-xs"
                    placeholder="Long Description"
                    value={formData.metadata.details}
                    onChange={(e) => handleChange("details", e.target.value)}
                  />
                </div>
              </div>
            </form>
            <button
              onClick={nextStep}
              className="w-full mt-4 btn btn-primary"
              disabled={
                !formData.metadata.title ||
                !formData.metadata.authors ||
                !formData.metadata.summary ||
                !formData.metadata.details
              }
            >
              Next: Member Info
            </button>
            <div className="flex space-x-3 ga-4 mt-6">
              <button
                onClick={prevStep}
                className="text-center items-center w-1/2 py-2.5 sm:py-3.5 btn btn-neutral"
              >
                Prev: Group Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
