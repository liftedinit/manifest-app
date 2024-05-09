import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

type DisplayDataToSignProps = {
  data: any; // The data to be displayed
};

const DisplayDataToSign = ({ data }: DisplayDataToSignProps) => {
  // Format data into a human-readable output
  const formatData = (inputData: any) => {
    if (typeof inputData === "string") {
      return inputData; // If data is a string, return it as is
    } else if (typeof inputData === "object") {
      // If data is an object, format it as a JSON string
      return JSON.stringify(inputData, null, 2); // Pretty print JSON with 2-space indentation
    } else {
      return "Unsupported data format"; // Fallback message for unknown formats
    }
  };

  return (
    <div className="p-4 z-[100]">
      <h3 className="text-lg font-medium text-gray-800">Data to Sign</h3>
      <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-48 text-gray-700">
        {formatData(data)} {/* Format and display the data */}
      </pre>
    </div>
  );
};

const SignModal = ({
  visible,
  onClose,
  data,
  approve,
  reject,
}: {
  visible: boolean;
  onClose: () => void;
  data: any;
  approve: () => void;
  reject: () => void;
}) => {
  return (
    <Transition.Root show={visible} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[1000] overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="sm:flex sm:flex-row sm:justify-between w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      Data to Sign
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      X
                    </button>
                  </div>
                </div>
                {/* Display data to sign */}
                <DisplayDataToSign data={data} />
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    approve();
                    onClose();
                  }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    reject();
                    onClose();
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SignModal;
