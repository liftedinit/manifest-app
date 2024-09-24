import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { Action, FormData } from '@/helpers/formReducer';
import { NumberInput } from '@/components/react/inputs';

const GroupPolicySchema = Yup.object().shape({
  votingPeriod: Yup.object().shape({
    days: Yup.number().min(0, 'Must be 0 or greater'),
    hours: Yup.number().min(0, 'Must be 0 or greater'),
    minutes: Yup.number().min(0, 'Must be 0 or greater'),
    seconds: Yup.number().min(0, 'Must be 0 or greater'),
  }),
  votingThreshold: Yup.number()
    .required('Voting threshold is required')
    .min(1, 'Minimum voting threshold is 1'),
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

  return (
    <section className="">
      <div className="lg:flex mx-auto">
        <div className="flex items-center mx-auto w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
          <div className="w-full">
            <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:mb-6 leading-tight border-b-[0.5px] dark:border-[#ffffff8e] border-b-[black] pb-4">
              Group Policy
            </h1>
            <Formik
              initialValues={{
                votingPeriod: votingPeriod,
                votingThreshold: formData.votingThreshold || '',
              }}
              validationSchema={GroupPolicySchema}
              onSubmit={nextStep}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ isValid, dirty, setFieldValue }) => {
                setIsValidForm(isValid && dirty);
                return (
                  <Form className="min-h-[330px] flex flex-col gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium">Voting Period</label>
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
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Qualified Majority (Number of total required votes)
                      </label>
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
                      />
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
      <div className="flex space-x-3 mt-6 mx-auto w-full">
        <button onClick={prevStep} className="btn btn-neutral py-2.5 sm:py-3.5 w-1/2">
          Back: Group Details
        </button>
        <button
          type="submit"
          className="w-1/2 btn px-5 py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
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
