import { useState } from "react";
import { TokenFormData } from "@/helpers/formReducer";
import { useFeeEstimation } from "@/hooks/useFeeEstimation";
import { useTx } from "@/hooks/useTx";
import { osmosis } from "@chalabi/manifestjs";
import { chainName } from "@/config";

export default function ConfirmationForm({
  nextStep,
  prevStep,
  formData,
  address,
}: Readonly<{
  nextStep: () => void;
  prevStep: () => void;
  formData: TokenFormData;
  address: string;
}>) {
  const [isSigning, setIsSigning] = useState(false);
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { setDenomMetadata } =
    osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

  const [showAdvanced, setShowAdvanced] = useState(false);

  const fullDenom = `factory/${address}/${formData.subdenom}`;

  // TODO: Verify `formData.denomUnits` is an array with at least 2 elements

  const handleConfirm = async () => {
    setIsSigning(true);
    try {
      const msg = setDenomMetadata({
        sender: address,
        metadata: {
          description: formData.description,
          denomUnits: [
            {
              denom: fullDenom,
              exponent: 0,
              aliases: formData.denomUnits[0].aliases,
            },
            {
              denom: formData.denomUnits[1].denom,
              exponent: formData.denomUnits[1].exponent,
              aliases: formData.denomUnits[1].aliases,
            },
          ],
          base: fullDenom,
          display: formData.display,
          name: formData.name,
          symbol: formData.symbol,
          uri: formData.uri,
          uriHash: formData.uriHash,
        },
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

  const renderField = (label: string, value: string) => (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className="rounded-md bg-base-100 p-2">
        <span className="text-sm break-all">{value}</span>
      </div>
    </div>
  );

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-6 min-h-screen flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Token Information</h2>
      <div className="bg-base-300 rounded-lg p-4 mb-6 flex-grow overflow-auto max-h-[34rem]">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {renderField("Token Name", formData.name)}
          {renderField("Symbol", formData.symbol)}
          {renderField("Display", formData.display)}
          {renderField("Subdenom", formData.subdenom)}
        </div>
        <div className="mt-4">
          {renderField("Description", formData.description)}
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Denom Units</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {renderField("Base Denom", "turd")}
            {renderField("Base Exponent", "0")}
            {renderField("Full Denom", fullDenom)}
            {renderField(
              "Full Denom Exponent",
              formData.denomUnits[1].exponent.toString(),
            )}
          </div>
        </div>
        <button
          className="btn btn-link mt-4 p-0"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Details
        </button>
        {showAdvanced && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-4">
            {renderField("URI", formData.uri || "N/A")}
            {renderField("URI Hash", formData.uriHash || "N/A")}
            {renderField("Base Denom Alias", formData.subdenom)}
            {renderField("Full Denom Alias", formData.display)}
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <button onClick={prevStep} className="btn btn-neutral flex-1">
          Edit Token Metadata
        </button>
        <button
          onClick={handleConfirm}
          className="btn btn-primary flex-1"
          disabled={isSigning}
        >
          {isSigning ? (
            <span className="loading loading-dots loading-sm"></span>
          ) : (
            "Confirm & Sign"
          )}
        </button>
      </div>
    </section>
  );
}
