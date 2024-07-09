import { useState } from "react";
import { TokenFormData } from "@/helpers/formReducer";
import { useFeeEstimation } from "@/hooks/useFeeEstimation";
import { useTx } from "@/hooks/useTx";
import { osmosis } from "@chalabi/manifestjs";
import { chainName } from "@/config";
import { DenomUnit } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";

export function UpdateDenomMetadataModal({
  denom,
  address,
  modalId,
  onSuccess,
}: {
  denom: any;
  address: string;
  modalId: string;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<TokenFormData>({
    name: denom.name,
    symbol: denom.symbol,
    description: denom.description,
    display: denom.display,
    base: denom.base,
    denomUnits: denom.denom_units,
    uri: denom.uri,
    uriHash: denom.uri_hash,
    subdenom: denom.base.split("/").pop() || "",
    exponent: denom.denom_units[1].exponent.toString(),
    label: denom.denom_units[1].denom,
  });

  const [isSigning, setIsSigning] = useState(false);
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { setDenomMetadata } =
    osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

  const handleUpdate = async () => {
    setIsSigning(true);
    try {
      const msg = setDenomMetadata({
        sender: address,
        metadata: {
          description: formData.description,
          denomUnits: formData.denomUnits,
          base: formData.base,
          display: formData.display,
          name: formData.name,
          symbol: formData.symbol,
          uri: formData.uri,
          uriHash: formData.uriHash,
        },
      });

      const fee = await estimateFee(address, [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          onSuccess();
          const modal = document.getElementById(modalId) as HTMLDialogElement;
          modal?.close();
        },
      });
    } catch (error) {
      console.error("Error during transaction setup:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const updateField = (field: keyof TokenFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateDenomUnit = (
    index: number,
    field: keyof DenomUnit,
    value: any
  ) => {
    const updatedDenomUnits = [...formData.denomUnits];
    updatedDenomUnits[index] = { ...updatedDenomUnits[index], [field]: value };
    updateField("denomUnits", updatedDenomUnits);
  };

  const isFormValid = () => {
    return (
      formData.subdenom &&
      formData.display &&
      formData.name &&
      formData.description &&
      formData.symbol &&
      formData.denomUnits.length === 2 &&
      formData.denomUnits[1].denom &&
      [6, 9, 12, 18].includes(formData.denomUnits[1].exponent)
    );
  };

  const fullDenom = `factory/${address}/${formData.subdenom}`;

  return (
    <dialog id={modalId} className="modal z-[1000]">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg mb-4">Update Denom Metadata</h3>
        <div className="divider divider-horizon -mt-1 -mb-0 "></div>
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <div className="py-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="display" className="block text-sm font-medium">
                Display{" "}
                <span className="text-xs text-gray-500">
                  (How it&apos;s shown)
                </span>
              </label>
              <input
                type="text"
                id="display"
                className="input input-bordered w-full mt-1"
                value={formData.display}
                onChange={(e) => updateField("display", e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name <span className="text-xs text-gray-500">(Full name)</span>
              </label>
              <input
                type="text"
                id="name"
                className="input input-bordered w-full mt-1"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium">
                Symbol{" "}
                <span className="text-xs text-gray-500">(Short symbol)</span>
              </label>
              <input
                type="text"
                id="symbol"
                className="input input-bordered w-full mt-1"
                value={formData.symbol}
                onChange={(e) => updateField("symbol", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description{" "}
              <span className="text-xs text-gray-500">(Brief description)</span>
            </label>
            <textarea
              id="description"
              className="textarea textarea-bordered w-full mt-1"
              rows={2}
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              required
            ></textarea>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="uri" className="block text-sm font-medium">
                URI{" "}
                <span className="text-xs text-gray-500">(Info/image link)</span>
              </label>
              <input
                type="text"
                id="uri"
                className="input input-bordered w-full mt-1"
                value={formData.uri}
                onChange={(e) => updateField("uri", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="uriHash" className="block text-sm font-medium">
                URI Hash{" "}
                <span className="text-xs text-gray-500">(If applicable)</span>
              </label>
              <input
                type="text"
                id="uriHash"
                className="input input-bordered w-full mt-1"
                value={formData.uriHash}
                onChange={(e) => updateField("uriHash", e.target.value)}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Denom Units</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">
                  Base Denom{" "}
                  <span className="text-xs text-gray-500">
                    (Cannot be changed)
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full mt-1"
                  value={fullDenom}
                  disabled
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-grow">
                  <label className="block text-sm font-medium">
                    Additional Denom{" "}
                    <span className="text-xs text-gray-500">
                      (Display denom)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Denom"
                    className="input input-bordered w-full mt-1"
                    value={formData.denomUnits[1]?.denom || ""}
                    onChange={(e) =>
                      updateDenomUnit(1, "denom", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Exponent{" "}
                    <span className="text-xs text-gray-500">(Decimals)</span>
                  </label>
                  <select
                    className="select select-bordered w-full mt-1"
                    value={formData.denomUnits[1]?.exponent || 6}
                    onChange={(e) =>
                      updateDenomUnit(1, "exponent", parseInt(e.target.value))
                    }
                    required
                  >
                    {[6, 9, 12, 18].map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-neutral mr-2">Cancel</button>
          </form>
          <button
            className="btn btn-primary max-w-[6rem] w-full"
            onClick={handleUpdate}
            disabled={isSigning || !isFormValid()}
          >
            {isSigning ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Update"
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
