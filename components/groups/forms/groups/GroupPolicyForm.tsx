import { Action, FormData } from "@/helpers/formReducer";
import { useEffect, useState } from "react";
import { PiCaretDownBold } from "react-icons/pi";

export default function GroupPolicyForm({
  nextStep,
  prevStep,
  formData,
  dispatch,
}: {
  formData: FormData;
  dispatch: React.Dispatch<Action>;
  nextStep: () => void;
  prevStep: () => void;
}) {
  const [votingUnit, setVotingUnit] = useState("days");
  const [votingAmount, setVotingAmount] = useState(1);

  const convertToSeconds = (unit: string, amount: number): number => {
    switch (unit) {
      case "hours":
        return amount * 3600;
      case "days":
        return amount * 86400;
      case "weeks":
        return amount * 604800;
      case "months":
        return amount * 2592000;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const votingPeriodSeconds = convertToSeconds(votingUnit, votingAmount);
    dispatch({
      type: "UPDATE_FIELD",
      field: "votingPeriod",
      value: {
        seconds: BigInt(votingPeriodSeconds),
        nanos: 0,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votingUnit, votingAmount]);

  const handleUnitChange = (unit: string) => {
    setVotingUnit(unit);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setVotingAmount(value);
    }
  };

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
              Group Policy
            </h1>

            <form className="min-h-[330px]">
              <div className="grid gap-5 my-6 sm:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Voting Period
                  </label>
                  <div className="flex flex-row items-center space-x-2">
                    <input
                      type="number"
                      className="input input-bordered flex-grow"
                      placeholder="Enter duration"
                      value={votingAmount}
                      onChange={handleAmountChange}
                    />
                    <div className="dropdown dropdown-end">
                      <label
                        tabIndex={0}
                        className="btn m-1 bg-base-100 border border-zinc-700"
                      >
                        {votingUnit.charAt(0).toUpperCase() +
                          votingUnit.slice(1)}
                        <PiCaretDownBold className="ml-2" />
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1"
                      >
                        {["hours", "days", "weeks", "months"].map((unit) => (
                          <li key={unit}>
                            <a onClick={() => handleUnitChange(unit)}>
                              {unit.charAt(0).toUpperCase() + unit.slice(1)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-1">
                  <label className="block mb-2 text-sm font-medium">
                    Voting Threshold
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. (1)"
                    className="input input-bordered w-full"
                    value={formData.votingThreshold}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "votingThreshold",
                        value: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </form>
            <button
              onClick={nextStep}
              className="w-full btn btn-primary"
              disabled={!formData?.votingPeriod || !formData?.votingThreshold}
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
