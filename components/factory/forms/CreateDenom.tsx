import { TokenAction, TokenFormData } from "@/helpers/formReducer";
import { useTx, useFeeEstimation } from "@/hooks";
import { osmosis } from "@chalabi/manifestjs";
import Link from "next/link";
import { useState } from "react";

export default function CreateDenom({
  nextStep,
  formData,
  dispatch,
  address,
}: {
  nextStep: () => void;
  formData: TokenFormData;
  dispatch: React.Dispatch<TokenAction>;
  address: string;
}) {
  const updateField = (field: keyof TokenFormData, value: any) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  const { createDenom } =
    osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const [isSigning, setIsSigning] = useState(false);

  const { tx, Toast, toastMessage, setToastMessage } = useTx("manifest");
  const { estimateFee } = useFeeEstimation("manifest");

  const handleConfirm = async () => {
    setIsSigning(true);
    try {
      const msg = createDenom({
        sender: address ?? "",
        subdenom: formData.subdenom,
      });
      console.log(msg);
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
      <Toast toastMessage={toastMessage} setToastMessage={setToastMessage} />
      <div className="lg:flex  mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight  sm:mb-6 leding-tight ">
              Create Denom
            </h1>
            <form className=" min-h-[330px]">
              <div className="grid gap-5 my-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="denom"
                    className="block mb-2 text-sm font-medium"
                  >
                    Token Sub Denom
                  </label>
                  <input
                    type="text"
                    placeholder="udenom"
                    className="input input-bordered w-full max-w-xs"
                    value={formData.subdenom}
                    onChange={(e) => updateField("subdenom", e.target.value)}
                  />
                </div>
              </div>
            </form>

            <button
              onClick={handleConfirm}
              className="w-full  btn px-5 py-2.5 sm:py-3.5 btn-primary"
              disabled={!formData.subdenom}
            >
              {isSigning ? (
                <span className="loading loading-dots loading-sm"></span>
              ) : (
                "Next: Token Metadata"
              )}
            </button>
            <div className="flex space-x-3 ga-4 mt-6">
              <Link href={"/factory"} legacyBehavior>
                <button className=" btn btn-neutral  py-2.5 sm:py-3.5  w-1/2 ">
                  Back: Factory Page
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
