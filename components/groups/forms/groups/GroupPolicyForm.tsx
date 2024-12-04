import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { Action, FormData } from '@/helpers/formReducer';
import { NumberInput } from '@/components/react/inputs';

const createGroupPolicySchema = (maxVotingThreshold: number) =>
  Yup.object().shape({
    votingPeriod: Yup.object()
      .shape({
        days: Yup.number().min(0).required('Required'),
        hours: Yup.number().min(0).required('Required'),
        minutes: Yup.number().min(0).required('Required'),
        seconds: Yup.number().min(0).required('Required'),
      })
      .test('min-total-time', 'Voting period must be at least 30 minutes', value => {
        const { days, hours, minutes, seconds } = value || {};
        const totalSeconds =
          (days || 0) * 86400 + (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
        return totalSeconds >= 1800;
      }),
    votingThreshold: Yup.number()
      .required('Required')
      .min(1)
      .test(
        'max-voting-threshold',
        `Voting threshold cannot exceed total member weight (${maxVotingThreshold})`,
        value => {
          // Allow any value if totalMemberWeight is zero
          if (maxVotingThreshold === Number.MAX_SAFE_INTEGER) return true;
          return value <= maxVotingThreshold;
        }
      ),
  });

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
  const [votingPeriod, setVotingPeriod] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isValidForm, setIsValidForm] = useState(false);

  const updateField = (field: keyof FormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  useEffect(() => {
    const totalSeconds =
      votingPeriod.days * 86400 +
      votingPeriod.hours * 3600 +
      votingPeriod.minutes * 60 +
      votingPeriod.seconds;
    updateField('votingPeriod', {
      seconds: BigInt(totalSeconds),
      nanos: 0,
    });
  }, [votingPeriod]);

  // Calculate total member weight from formData.members
  const totalMemberWeight = formData.members.reduce(
    (acc, member) => acc + Number(member.weight || 0),
    0
  );

  // Handle case when totalMemberWeight is zero
  const maxVotingThreshold = totalMemberWeight > 0 ? totalMemberWeight : Number.MAX_SAFE_INTEGER;

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
          <div className="w-full">
            <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] text-gray-500 dark:text-gray-400 dark:border-gray-400 border-gray-500 border-b-[black] pb-4">
              Group Policy
            </h1>
            <Formik
              initialValues={{
                votingPeriod: votingPeriod,
                votingThreshold: formData.votingThreshold || '',
              }}
              validationSchema={createGroupPolicySchema(totalMemberWeight)}
              onSubmit={nextStep}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ isValid, setFieldValue, errors }) => {
                setIsValidForm(isValid);
                return (
                  <Form className="min-h-[330px] flex flex-col gap-4">
                    <div>
                      <label className="block text-sm mb-1 font-medium dark:text-[#FFFFFF99]">
                        Voting Period
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        <NumberInput
                          name="votingPeriod.days"
                          placeholder="Days"
                          label="Days"
                          value={votingPeriod.days}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setVotingPeriod(prev => ({ ...prev, days: value }));
                            setFieldValue('votingPeriod.days', value);
                          }}
                          min={0}
                        />
                        <NumberInput
                          name="votingPeriod.hours"
                          placeholder="Hours"
                          label="Hours"
                          value={votingPeriod.hours}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setVotingPeriod(prev => ({ ...prev, hours: value }));
                            setFieldValue('votingPeriod.hours', value);
                          }}
                          min={0}
                        />
                        <NumberInput
                          name="votingPeriod.minutes"
                          placeholder="Minutes"
                          label="Minutes"
                          value={votingPeriod.minutes}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setVotingPeriod(prev => ({ ...prev, minutes: value }));
                            setFieldValue('votingPeriod.minutes', value);
                          }}
                          min={0}
                        />
                        <NumberInput
                          name="votingPeriod.seconds"
                          placeholder="Seconds"
                          label="Seconds"
                          value={votingPeriod.seconds}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setVotingPeriod(prev => ({ ...prev, seconds: value }));
                            setFieldValue('votingPeriod.seconds', value);
                          }}
                          min={0}
                        />
                      </div>
                      {/* Display validation error below the voting period inputs */}
                      {errors.votingPeriod && typeof errors.votingPeriod === 'string' && (
                        <div className="text-red-500 text-sm mt-1">{errors.votingPeriod}</div>
                      )}
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium dark:text-[#FFFFFF99]">
                        Qualified Majority (Number of total required votes)
                      </label>
                      <NumberInput
                        name="votingThreshold"
                        placeholder="e.g., 1"
                        value={formData.votingThreshold}
                        onChange={e => {
                          const value = Math.max(1, parseInt(e.target.value) || 1);
                          dispatch({ type: 'UPDATE_FIELD', field: 'votingThreshold', value });
                          setFieldValue('votingThreshold', value);
                        }}
                        min={1}
                      />
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
      <div className="flex gap-6 mt-6 mx-auto w-full">
        <button
          onClick={prevStep}
          className="btn btn-neutral text-black dark:text-white py-2.5 sm:py-3.5 w-[calc(50%-12px)]"
        >
          Back: Group Details
        </button>
        <button
          type="submit"
          className="w-[calc(50%-12px)] btn px-5 py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
          onClick={() => nextStep()}
          disabled={
            !isValidForm ||
            (votingPeriod.days === 0 &&
              votingPeriod.hours === 0 &&
              votingPeriod.minutes === 0 &&
              votingPeriod.seconds === 0)
          }
        >
          Next: Member Info
        </button>
      </div>
    </section>
  );
}
