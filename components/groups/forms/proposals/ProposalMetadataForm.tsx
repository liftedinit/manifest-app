import React from "react";
import { ProposalFormData, ProposalAction } from "@/helpers/formReducer";

export default function ProposalMetadataForm({
  nextStep,
  prevStep,
  formData,
  dispatch,
}: Readonly<{
  nextStep: () => void;
  prevStep: () => void;
  formData: ProposalFormData;
  dispatch: React.Dispatch<ProposalAction>;
}>) {
  const handleChange = (
    field: keyof ProposalFormData["metadata"],
    value: any,
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
      <div className="lg:flex  mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
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
                    aria-label={"title-input"}
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
                    aria-label={"authors-input"}
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
                    aria-label={"summary-input"}
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
                    aria-label={"details-input"}
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
              Next: Confirmation
            </button>
            <div className="flex space-x-3 ga-4 mt-6">
              <button
                onClick={prevStep}
                className="text-center items-center w-1/2 py-2.5 sm:py-3.5 btn btn-neutral"
              >
                <span className="hidden sm:inline">Prev: Messages</span>
                <span className="sm:hidden"> Prev: TXs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
