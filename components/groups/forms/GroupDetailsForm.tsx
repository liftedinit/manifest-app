import Link from "next/link";

export default function GroupDetails({ nextStep }: { nextStep: () => void }) {
  return (
    <section className="">
      <div className="lg:flex min-h-screen mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <ol className="flex flex-wrap justify-between items-center text-md font-medium text-center text-gray-500 dark:text-gray-400 mb-10">
              <li className="flex-1">
                <div className="text-center mb-2">1</div>
                <div>
                  Group <span>Info</span>
                </div>
              </li>
              <li className="flex-1">
                <div className="text-center mb-2">2</div>
                <div>
                  Group <span>Policy</span>
                </div>
              </li>
              <li className="flex-1">
                <div className="text-cente mb-2">3</div>
                <div>Member Info</div>
              </li>
              <li className="flex-1">
                <div className="text-center mb-2">4</div>
                <div>Confirmation</div>
              </li>
            </ol>
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:mb-6 leding-tight dark:text-white">
              Group details
            </h1>
            <form className=" min-h-[330px]">
              <div className="grid gap-5 my-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="full-name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Group Title
                  </label>
                  <input
                    type="text"
                    placeholder="Title"
                    className="input input-bordered w-full max-w-xs"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Authors
                  </label>
                  <input
                    type="text"
                    placeholder="List of authors"
                    className="input input-bordered w-full max-w-xs"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium  text-gray-900 dark:text-white"
                  >
                    Summary
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full max-w-xs"
                    placeholder="Short Bio"
                  ></textarea>
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full max-w-xs"
                    placeholder="Long Bio"
                  ></textarea>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Forum Link
                  </label>
                  <input
                    type="text"
                    placeholder="Link to forum"
                    className="input input-bordered w-full max-w-xs mb-4"
                  />
                </div>
              </div>
            </form>

            <button
              onClick={nextStep}
              className="w-full  btn px-5 py-2.5 sm:py-3.5 text-sm font-medium text-center  rounded-lg bg-accent hover:bg-secondary/70 focus:ring-4 focus:outline-none focus:ring-primary/30 dark:bg-primary-/60 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Next: Group Policy
            </button>
            <div className="flex space-x-3 mt-6">
              <Link
                href="/groups"
                className="text-center items-center w-full py-2.5 sm:py-3.5 text-sm font-medium  focus:outline-none  bg-white  rounded-lg border "
              >
                Back: Groups Page
              </Link>
              <a
                onClick={nextStep}
                className="text-center items-center w-full py-2.5 sm:py-3.5 text-sm font-medium text-transparent focus:outline-none bg-transparent rounded-lg border "
              >
                Next: Member Info
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
