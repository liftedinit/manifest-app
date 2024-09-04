import { Action, FormData } from '@/helpers/formReducer';
import { useEffect, useState } from 'react';
import { PiCaretDownBold } from 'react-icons/pi';
import { Formik, Form, Field } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput, NumberInput } from '@/components/react/inputs';

const GroupPolicySchema = Yup.object().shape({
  votingAmount: Yup.number()
    .required('Voting amount is required')
    .min(1, 'Minimum voting amount is 1'),
  votingThreshold: Yup.number()
    .required('Voting threshold is required')
    .min(1, 'Minimum voting threshold is 1'),
});

enum VotingUnit {
  Hours = 'hours',
  Days = 'days',
  Weeks = 'weeks',
  Months = 'months',
}

export default function GroupPolicyForm({
  nextStep,
  prevStep,
  formData,
  dispatch,
}: Readonly<{
  formData: FormData;
  dispatch: React.Dispatch<Action>;
  nextStep: () => void;
  prevStep: () => void;
}>) {
  const updateField = (field: keyof FormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const [votingUnit, setVotingUnit] = useState(VotingUnit.Days);
  const [votingAmount, setVotingAmount] = useState(1);

  const convertToSeconds = (unit: VotingUnit, amount: number): number => {
    switch (unit) {
      case VotingUnit.Hours:
        return amount * 3600;
      case VotingUnit.Days:
        return amount * 86400;
      case VotingUnit.Weeks:
        return amount * 604800;
      case VotingUnit.Months:
        return amount * 2592000;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const votingPeriodSeconds = convertToSeconds(votingUnit, votingAmount);
    updateField('votingPeriod', {
      seconds: BigInt(votingPeriodSeconds),
      nanos: 0,
    });
  }, [votingUnit, votingAmount, dispatch]);

  const handleUnitChange = (unit: VotingUnit) => {
    setVotingUnit(unit);
  };

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight">Group Policy</h1>

            <Formik
              initialValues={{
                votingAmount: votingAmount,
                votingThreshold: formData.votingThreshold || '',
              }}
              validationSchema={GroupPolicySchema}
              onSubmit={nextStep}
              validateOnChange={true}
            >
              {({ isValid, dirty, setFieldValue }) => (
                <Form className="min-h-[330px]">
                  <div className="grid gap-5 my-6 sm:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium">Voting Period</label>
                      <div className="flex flex-row items-center space-x-2 justify-between">
                        <NumberInput
                          name="votingAmount"
                          placeholder="Enter duration"
                          label="Voting Amount"
                          value={votingAmount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = Math.max(1, parseInt(e.target.value) || 1);
                            setVotingAmount(value);
                            setFieldValue('votingAmount', value);
                          }}
                          min={1}
                          className="input input-bordered flex-grow w-1/3"
                        />
                        <div className="dropdown dropdown-end w-1/3">
                          <label
                            tabIndex={0}
                            className="btn m-1 bg-base-100 border w-full border-zinc-700"
                          >
                            {votingUnit.charAt(0).toUpperCase() + votingUnit.slice(1)}
                            <PiCaretDownBold className="ml-2" />
                          </label>
                          <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1"
                          >
                            {Object.values(VotingUnit).map(unit => (
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

                    <div className="mt-1 w-full">
                      <div className="flex flex-row mb-2 gap-1 justify-between items-center">
                        <label className="block text-sm font-medium">Voting Threshold</label>
                        <div className="text-sm text-gray-500">
                          (number of total required votes)
                        </div>
                      </div>

                      <NumberInput
                        name="votingThreshold"
                        placeholder="e.g. (1)"
                        label=""
                        value={formData.votingThreshold}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = Math.max(1, parseInt(e.target.value));
                          updateField('votingThreshold', value.toString());
                          setFieldValue('votingThreshold', value);
                        }}
                        min={1}
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full btn btn-primary"
                    disabled={!isValid || !dirty}
                    onClick={() => {
                      nextStep();
                    }}
                  >
                    Next: Member Info
                  </button>
                </Form>
              )}
            </Formik>
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
