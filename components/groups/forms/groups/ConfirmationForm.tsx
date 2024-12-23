import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { FormData } from '@/helpers/formReducer';
import { useFeeEstimation } from '@/hooks/useFeeEstimation';
import { useTx } from '@/hooks/useTx';
import { cosmos } from '@liftedinit/manifestjs';
import { ThresholdDecisionPolicy } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { Duration } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/duration';
import { secondsToHumanReadable } from '@/utils/string';

export default function ConfirmationForm({
  nextStep,
  prevStep,
  formData,
  address,
}: Readonly<{
  nextStep: () => void;
  prevStep: () => void;
  formData: FormData;
  address: string;
}>) {
  const { createGroupWithPolicy } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const groupMetadata = {
    title: formData.title,
    authors: formData.authors,
    details: formData.description,
    voteOptionContext: '',
  };

  // Convert the object to a JSON string
  const jsonString = JSON.stringify(groupMetadata);

  const { tx, isSigning, setIsSigning } = useTx('manifest');
  const { estimateFee } = useFeeEstimation('manifest');

  const minExecutionPeriod: Duration = {
    seconds: BigInt(0),
    nanos: 0,
  };

  const thresholdMsg = {
    threshold: formData.votingThreshold.toString(), // Convert to string
    windows: {
      votingPeriod: formData.votingPeriod,
      minExecutionPeriod: minExecutionPeriod,
    },
  };

  const threshholdPolicyFromPartial = ThresholdDecisionPolicy.fromPartial(thresholdMsg);

  const threshholdPolicy = ThresholdDecisionPolicy.encode(threshholdPolicyFromPartial).finish();

  const typeUrl = cosmos.group.v1.ThresholdDecisionPolicy.typeUrl;

  const handleConfirm = async () => {
    setIsSigning(true);
    try {
      const msg = createGroupWithPolicy({
        admin: address ?? '',
        members: formData.members.map(member => ({
          address: member.address,
          weight: member.weight,
          metadata: member.name,
          added_at: new Date(),
        })),
        groupMetadata: jsonString,
        groupPolicyMetadata: '',
        groupPolicyAsAdmin: true,
        decisionPolicy: {
          threshold: formData.votingThreshold.toString(), // Convert to string
          percentage: formData.votingThreshold.toString(), // Convert to string
          value: threshholdPolicy,
          typeUrl: typeUrl,
        },
      });
      const fee = await estimateFee(address ?? '', [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          nextStep();
        },
      });
    } catch (error) {
      setIsSigning(false);
      console.error('Error during transaction setup:', error);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <section>
      <div className="w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
        <div className="flex justify-center p-4 rounded-[8px] mb-6 w-full dark:bg-[#FAFAFA1F] bg-[#A087FF1F] items-center">
          <h1 className="text-xl text-primary font-bold">{formData.title}</h1>
        </div>

        <div className="space-y-6">
          {/* Group Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-500 dark:text-gray-400">
              Group Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-base-300 p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Voting period</label>
                <div className="text-gray-500 dark:text-gray-400">
                  {secondsToHumanReadable(Number(formData.votingPeriod.seconds))}
                </div>
              </div>
              <div className="bg-base-300  p-4 rounded-[12px] ">
                <label className="text-sm dark:text-[#FFFFFF66]">Qualified Majority</label>
                <div className="text-gray-500 dark:text-gray-400">
                  {formData.votingThreshold} / {formData.members.length}
                </div>
              </div>
            </div>
            <div className="mt-4 bg-base-300 p-4 rounded-[12px]">
              <label className="text-sm dark:text-[#FFFFFF66]">Description</label>
              <div
                className="overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 dark:text-gray-400"
                title={formData.description}
              >
                {formData.description.length > 200
                  ? `${formData.description.slice(0, 200)}...`
                  : formData.description}
              </div>
            </div>
          </div>

          {/* Authors */}
          <div className="max-h-28 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-500 dark:text-gray-400">Authors</h2>
            <div className=" grid grid-cols-3 gap-4">
              {Array.isArray(formData.authors) ? (
                formData.authors.map((author, index) => (
                  <div
                    key={index}
                    className="bg-base-300 text-gray-500 dark:text-gray-400 p-4 rounded-lg flex items-center"
                  >
                    {author.trim().startsWith('manifest1') ? (
                      <TruncatedAddressWithCopy address={author.trim()} slice={14} />
                    ) : (
                      <span>{author.trim()}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-[#2A2A38] p-4 text-gray-500 dark:text-gray-400 rounded-lg flex items-center">
                  {formData.authors.trim().startsWith('manifest1') ? (
                    <TruncatedAddressWithCopy address={formData.authors.trim()} slice={14} />
                  ) : (
                    <span>{formData.authors.trim()}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Members */}
          <div className="max-h-44 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-500 dark:text-gray-400">Members</h2>
            <div className="grid grid-cols-3 gap-4">
              {formData.members.map((member, index) => (
                <div key={index} className="bg-base-300 p-4 rounded-lg">
                  <div className="text-sm dark:text-[#FFFFFF66]">Address</div>
                  <TruncatedAddressWithCopy address={member.address} slice={14} />
                  <div className="text-sm dark:text-[#FFFFFF66] mt-2">Name</div>
                  <div className="text-gray-500 dark:text-gray-400">{member.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
      </div>
      <div className="flex gap-6 mt-6 mx-auto w-full">
        <button
          onClick={prevStep}
          className="btn btn-neutral text-black dark:text-white  w-[calc(50%-12px)]"
        >
          Back: Member Info
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSigning || !address}
          className="w-[calc(50%-12px)] btn  btn-gradient text-white "
        >
          {isSigning ? (
            <span className="loading loading-dots loading-sm"></span>
          ) : (
            'Sign Transaction'
          )}
        </button>
      </div>
    </section>
  );
}
