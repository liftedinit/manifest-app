import { Action, FormData } from "@/helpers/formReducer";
import React, { useState, useEffect } from "react";
import { PiAddressBook } from "react-icons/pi"; // Ensure you have this import for the icon

export default function MemberInfoForm({
  formData,
  dispatch,
  nextStep,
  prevStep,
  address,
}: {
  formData: FormData;
  dispatch: (action: Action) => void;
  nextStep: () => void;
  prevStep: () => void;
  address: string;
}) {
  const [numberOfMembers, setNumberOfMembers] = useState(
    formData.members.length
  );

  const updateMembers = () => {
    const currentLength = formData.members.length;
    if (numberOfMembers > currentLength) {
      for (let i = 0; i < numberOfMembers - currentLength; i++) {
        dispatch({
          type: "ADD_MEMBER",
          member: { address: "", name: "", weight: "" },
        });
      }
    } else if (numberOfMembers < currentLength) {
      const updatedMembers = formData.members.slice(0, numberOfMembers);
      dispatch({
        type: "UPDATE_FIELD",
        field: "members",
        value: updatedMembers,
      });
    }
  };

  useEffect(() => {
    updateMembers();
  }, [numberOfMembers]);

  const handleChange = (
    index: number,
    field: keyof FormData["members"][0],
    value: string
  ) => {
    dispatch({
      type: "UPDATE_MEMBER",
      index,
      field,
      value,
    });
  };

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    nextStep();
  };

  const handleNumberChange = (event: { target: { value: string } }) => {
    const newCount = parseInt(event.target.value, 10);
    if (!isNaN(newCount) && newCount >= 0) {
      setNumberOfMembers(newCount);
    }
  };

  const pasteAddress = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    handleChange(0, "address", address);
  };

  return (
    <section className="">
      <div className="lg:flex  mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight leading-tight e">
                  Member Info
                </h1>
                <div className="flex ">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() =>
                      setNumberOfMembers(Math.max(0, numberOfMembers - 1))
                    }
                  >
                    -
                  </button>
                  <input
                    className="input input-bordered mx-2 text-center input-sm w-[40px]"
                    value={numberOfMembers}
                    onChange={handleNumberChange}
                    min="0"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => setNumberOfMembers(numberOfMembers + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className=" min-h-[330px]">
                <div className="overflow-y-scroll max-h-[550px] min-h-[330px]">
                  {formData.members.map((member, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 gap-4 mb-4 p-1"
                    >
                      <div className="relative">
                        <label
                          htmlFor={`address-${index}`}
                          className="block mb-2 text-sm font-medium "
                        >
                          Address
                        </label>
                        <div className="flex flex-row items-center justify-between">
                          <input
                            type="text"
                            id={`address-${index}`}
                            value={member.address}
                            onChange={(e) =>
                              handleChange(index, "address", e.target.value)
                            }
                            className={`input input-bordered ${
                              index === 0
                                ? "rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none"
                                : ""
                            } w-full `}
                            placeholder="manifest1..."
                          />
                          {index === 0 && (
                            <button
                              onClick={pasteAddress}
                              className="btn btn-primary rounded-tr-lg rounded-br-lg  rounded-bl-none rounded-tl-none "
                            >
                              <PiAddressBook className="w-6 h-6" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor={`name-${index}`}
                          className="block mb-2 text-sm font-medium "
                        >
                          Name
                        </label>

                        <input
                          type="text"
                          id={`name-${index}`}
                          value={member.name}
                          onChange={(e) =>
                            handleChange(index, "name", e.target.value)
                          }
                          className="input input-bordered w-full"
                          placeholder="Alice"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`weight-${index}`}
                          className="block mb-2 text-sm font-medium "
                        >
                          Weight
                        </label>

                        <input
                          type="text"
                          id={`weight-${index}`}
                          value={member.weight}
                          onChange={(e) =>
                            handleChange(index, "weight", e.target.value)
                          }
                          className="input input-bordered w-full "
                          placeholder="1"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  className="btn btn-primary w-full"
                  disabled={
                    !formData.members.every(
                      (m) => m.address && m.name && m.weight
                    ) || numberOfMembers === 0
                  }
                >
                  Next: Group Policy
                </button>
              </form>

              <div className="flex space-x-3 ga-4 mt-6">
                <button
                  onClick={prevStep}
                  className="text-center btn btn-neutral items-center w-1/2 py-2.5 sm:py-3.5 text-sm font-medium focus:outline-none  rounded-lg border "
                >
                  Prev: Group Policy
                </button>
                <a className="text-center items-center w-1/2 py-2.5 sm:py-3.5 text-sm font-medium"></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
