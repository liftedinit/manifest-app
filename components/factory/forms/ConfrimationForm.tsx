import { useEffect, useState } from "react";
import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";
import { FormData, TokenFormData } from "@/helpers/formReducer";
import { useFeeEstimation } from "@/hooks/useFeeEstimation";
import { uploadJsonToIPFS } from "@/hooks/useIpfs";
import { useTx } from "@/hooks/useTx";
import { osmosis } from "@chalabi/manifestjs";
import { ThresholdDecisionPolicy } from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types";
import { Duration } from "@chalabi/manifestjs/dist/codegen/google/protobuf/duration";
import { useChain } from "@cosmos-kit/react";

export default function ConfirmationForm({
  nextStep,
  prevStep,
  formData,
}: {
  nextStep: () => void;
  prevStep: () => void;
  formData: TokenFormData;
}) {
  const { address } = useChain("manifest");
  const { setDenomMetadata } =
    osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const [isSigning, setIsSigning] = useState(false);

  const { tx, Toast, toastMessage, setToastMessage } = useTx("manifest");
  const { estimateFee } = useFeeEstimation("manifest");

  const handleConfirm = async () => {
    setIsSigning(true);
    try {
      const msg = setDenomMetadata({
        sender: address ?? "",
        metadata: formData,
      });
      const fee = await estimateFee(address ?? "", [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          nextStep();
        },
      });
    } catch (error) {
      setIsSigning(false);
      console.error("Error during transaction setup:", error);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <section className="">
      <div className="lg:flex  mx-auto">
        <Toast toastMessage={toastMessage} setToastMessage={setToastMessage} />
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:mb-6 leading-tight">
              Confirmation
            </h1>
            <form className="min-h-[330px] sm:max-h-[590px] overflow-y-auto">
              {/* Group Details & Policy Flex */}

              {/* Group Details */}
              <div className="flex w-full flex-col gap-2 justify-between items-start">
                <label className="block  text-lg font-light">
                  TOKEN DETAILS
                </label>
                <div className="grid gap-5 sm:grid-cols-2 bg-base-300 shadow w-full rounded-lg p-4">
                  <div className="flex flex-col gap-2">
                    <a className="text-sm font-light text-gray-400">
                      TOKEN TITLE
                    </a>
                    <div className="max-h-24  overflow-y-auto rounded-md bg-base-100 p-4">
                      <a className="text-lg">{formData.symbol}</a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a className="text-sm font-light text-gray-400">AUTHORS</a>
                    <div className="max-h-24  overflow-y-auto rounded-md bg-base-100 p-4">
                      <a className="text-lg">{formData.label}</a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 h-full ">
                    <a className="text-sm font-light text-gray-400">SUMMARY</a>
                    <div className="max-h-24  overflow-y-auto rounded-md bg-base-100 p-4">
                      <a className="text-sm">{formData.exponent}</a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ">
                    <a className="text-sm font-light text-gray-400">
                      DESCRIPTION
                    </a>
                    <div className="max-h-24  overflow-y-auto rounded-md bg-base-100 p-4">
                      <a className="text-sm">{formData.description}</a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ">
                    <a className="text-sm font-light text-gray-400">
                      THRESHOLD
                    </a>
                    <div className="max-h-24  overflow-y-auto rounded-md bg-base-100 p-4">
                      <a className="text-sm">{formData.display}</a>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            <div className="flex space-x-3 ga-4 mt-6">
              <button
                onClick={prevStep}
                className="text-center items-center w-1/2 py-2.5 sm:py-3.5 btn btn-neutral"
              >
                Prev: Token Metadata
              </button>
              <button
                onClick={handleConfirm}
                className="w-1/2 px-5 py-2.5 sm:py-3.5 btn btn-primary"
              >
                {isSigning ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : (
                  "Sign Transaction"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
