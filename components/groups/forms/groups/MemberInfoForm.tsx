import React, { useState, useEffect } from "react";

const initialMember = { address: "", name: "", weight: "" };

export default function GroupPolicyForm({
  nextStep,
  prevStep,
  formData,
  onDataChange,
}: {
  nextStep: () => void;
  prevStep: () => void;
  formData: {
    title: string;
    authors: string;
    summary: string;
    description: string;
    forumLink: string;
    votingPeriod: string;
    votingThreshold: string;
    members: { address: string; name: string; weight: string }[];
  };
  onDataChange: (newData: {
    title: string;
    authors: string;
    summary: string;
    description: string;
    forumLink: string;
    votingPeriod: string;
    votingThreshold: string;
    members: { address: string; name: string; weight: string }[];
  }) => void;
}) {
  const [members, setMembers] = useState([formData.members]);
  const [numberOfMembers, setNumberOfMembers] = useState(2);

  useEffect(() => {
    updateMembers();
  }, [numberOfMembers]);

  const updateMembers = () => {
    const currentLength = members.length;
    if (numberOfMembers > currentLength) {
      setMembers(
        members.concat(
          Array.from({ length: numberOfMembers - currentLength }, () => ({
            ...initialMember,
          }))
        )
      );
    } else if (numberOfMembers < currentLength) {
      setMembers(members.slice(0, numberOfMembers));
    }
  };

  const handleNumberChange = (event: { target: { value: string } }) => {
    const newCount = parseInt(event.target.value, 10);
    if (!isNaN(newCount) && newCount >= 0) {
      setNumberOfMembers(newCount);
    }
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newMembers = members.map((member, i) => {
      if (i === index) {
        return { ...member, [field]: value };
      }
      return member;
    });
    setMembers(newMembers);
  };

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    const updatedFormData = {
      ...formData,
      members: members,
    };

    onDataChange(updatedFormData);

    nextStep();
  };

  return (
    <section className="">
      <div className="lg:flex min-h-screen mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <div className="w-full">
              <ol className="flex flex-wrap justify-between items-center text-md font-medium text-center  mb-10">
                <li className="flex-1">
                  <div className="flex items-center sm:block after:content-['/'] sm:after:hidden after:mx-2 after:font-light ">
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
                  <div className="flex items-center sm:block after:content-['/'] sm:after:hidden after:mx-2 after:font-light ">
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
                    Group <span className="hidden sm:inline-flex">Policy</span>
                  </div>
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
                    value={numberOfMembers}
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
                <div className="overflow-y-scroll max-h-[330px] min-h-[330px]">
                  {members.map((member, index) => (
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
                    !members.every((m) => m.address && m.name && m.weight)
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
