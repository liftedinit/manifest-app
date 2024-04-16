export default function GroupPolicyForm({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  return (
    <section className="">
      <div className="lg:flex min-h-screen mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem]  px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <ol className="flex flex-wrap justify-between items-center text-md font-medium text-center text-gray-500 dark:text-gray-400 mb-10">
              <li className="flex-1">
                <div className="flex items-center sm:block after:content-['/'] sm:after:hidden after:mx-2 after:font-light after:text-gray-200 dark:after:text-gray-500">
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
                  Group <span className="hidden sm:inline-flex">Info</span>
                </div>
              </li>
              <li className="flex-1">
                <div className="text-center mb-2">2</div>
                <div>Group Policy</div>
              </li>
              <li className="flex-1">
                <div className="text-center mb-2">3</div>
                <div>Member Info</div>
              </li>
              <li className="flex-1">
                <div className="text-center mb-2">4</div>
                <div>Confirmation</div>
              </li>
            </ol>
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:mb-6 leding-tight dark:text-white">
              Group Policy
            </h1>
            <form className=" min-h-[330px]">
              <div className="grid gap-5 my-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="full-name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Voting Period
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered w-full max-w-xs"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Voting Threshold
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered w-full max-w-xs"
                  />
                </div>
              </div>
            </form>
            <button
              onClick={nextStep}
              className="w-full  btn px-5 py-2.5 sm:py-3.5 text-sm font-medium text-center  rounded-lg bg-accent hover:bg-secondary/70 focus:ring-4 focus:outline-none focus:ring-primary/30 dark:bg-primary-/60 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Next: Member Info
            </button>
            <div className="flex space-x-3 mt-6">
              <a
                onClick={prevStep}
                className="text-center items-center w-full py-2.5 sm:py-3.5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Prev: Group Info
              </a>
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
