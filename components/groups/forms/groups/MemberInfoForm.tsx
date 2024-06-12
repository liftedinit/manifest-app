import { Action, FormData } from "@/helpers/formReducer";
import React, { useState, useEffect } from "react";

const initialMember = { address: "", name: "", weight: "" };

export default function MemberInfoForm({
  formData,
  dispatch,
  nextStep,
  prevStep,
}: {
  formData: FormData;
  dispatch: (action: Action) => void;
  nextStep: () => void;
  prevStep: () => void;
}) {
  const [numberOfMembers, setNumberOfMembers] = useState(2);

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
      for (let i = 0; i < currentLength - numberOfMembers; i++) {
        formData.members.pop();
      }
      dispatch({
        type: "UPDATE_FIELD",
        field: "members",
        value: formData.members,
      });
    }
  };

  useEffect(() => {
    updateMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <section className="">
      <div className="lg:flex  mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <div className="w-full">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-extrabold tracking-tight  sm:mb-6 leading-tight e">
                  Member Info
                </h1>
                <div className="flex sm:mb-6">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() =>
                      setNumberOfMembers(Math.max(0, numberOfMembers - 1))
                    }
                  >
                    -
                  </button>
                  <input
                    className="input input-bordered mx-2 text-center input-sm w-[40px]"
                    value={formData.members.length}
                    onChange={handleNumberChange}
                    min="0"
                  />
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => setNumberOfMembers(numberOfMembers + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className=" min-h-[330px]">
                <div className="overflow-y-scroll max-h-[550px] min-h-[330px]">
                  {(
                    formData.members as unknown as {
                      address: string;
                      name: string;
                      weight: string;
                    }[]
                  ).flatMap((member, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor="full-name"
                          className="block mb-2 text-sm font-medium "
                        >
                          Address
                        </label>
                        <input
                          type="text"
                          value={member.address}
                          onChange={(e) =>
                            handleChange(index, "address", e.target.value)
                          }
                          className="input input-bordered w-full"
                          placeholder="manifest1..."
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="name"
                          className="block mb-2 text-sm font-medium "
                        >
                          Name
                        </label>

                        <input
                          type="text"
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
                          htmlFor="weight"
                          className="block mb-2 text-sm font-medium "
                        >
                          Weight
                        </label>

                        <input
                          type="text"
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
                    !(
                      formData.members as unknown as {
                        address: string;
                        name: string;
                        weight: string;
                      }[]
                    ).every((m) => m.address && m.name && m.weight) ||
                    numberOfMembers === 0
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
