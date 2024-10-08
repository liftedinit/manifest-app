import { Action, FormData } from "@/helpers/formReducer";
import Link from "next/link";
import { PiAddressBook } from "react-icons/pi";

export default function GroupDetails({
  nextStep,
  formData,
  dispatch,
  address,
}: Readonly<{
  nextStep: () => void;
  formData: FormData;
  dispatch: React.Dispatch<Action>;
  address: string;
}>) {
  const updateField = (field: keyof FormData, value: any) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };
  return (
    <section className="">
      <div className="lg:flex  mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight  sm:mb-6 leding-tight ">
              Group details
            </h1>
            <form className=" min-h-[330px]">
              <div className="grid gap-5 my-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="full-name"
                    className="block mb-2 text-sm font-medium"
                  >
                    Group Title
                  </label>
                  <input
                    type="text"
                    placeholder="Title"
                    className="input input-bordered w-full max-w-xs"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium "
                  >
                    Authors
                  </label>
                  <div className="flex flex-row justify-between items-center">
                    {" "}
                    <input
                      type="text"
                      placeholder="List of authors or address"
                      className="input input-bordered rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none w-full max-w-xs "
                      value={formData.authors}
                      onChange={(e) => updateField("authors", e.target.value)}
                    />{" "}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        updateField("authors", address);
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
                    value={formData.summary}
                    onChange={(e) => updateField("summary", e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium "
                  >
                    Description
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full max-w-xs"
                    placeholder="Long Bio"
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium "
                  >
                    Forum Link
                  </label>
                  <input
                    type="text"
                    placeholder="Link to forum"
                    className="input input-bordered w-full max-w-xs mb-4"
                    value={formData.forumLink}
                    onChange={(e) => updateField("forumLink", e.target.value)}
                  />
                </div>
              </div>
            </form>

            <button
              onClick={nextStep}
              className="w-full  btn px-5 py-2.5 sm:py-3.5 btn-primary"
              disabled={
                !formData.title ||
                !formData.authors ||
                !formData.summary ||
                !formData.description
              }
            >
              Next: Group Policy
            </button>
            <div className="flex space-x-3 ga-4 mt-6">
              <Link href={"/groups"} legacyBehavior>
                <button className=" btn btn-neutral  py-2.5 sm:py-3.5  w-1/2 ">
                  <span className="hidden sm:inline">Back: Groups Page</span>
                  <span className="sm:hidden"> Back: Groups</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
