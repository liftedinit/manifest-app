import { chainName } from "@/config";
import { TokenAction, TokenFormData } from "@/helpers/formReducer";
import { DenomUnit } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";
import { useState } from "react";

export default function TokenDetails({
  nextStep,
  prevStep,
  formData,
  dispatch,
  address,
}: Readonly<{
  nextStep: () => void;
  prevStep: () => void;
  formData: TokenFormData;
  dispatch: React.Dispatch<TokenAction>;
  address: string;
}>) {
  const updateField = (field: keyof TokenFormData, value: any) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  const updateDenomUnit = (
    index: number,
    field: keyof DenomUnit,
    value: any,
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

  // Ensure there are always two denom units
  if (formData.denomUnits.length === 0) {
    updateField("denomUnits", [
      { denom: fullDenom, exponent: 0, aliases: [] },
      { denom: "", exponent: 6, aliases: [] },
    ]);
  } else if (formData.denomUnits.length === 1) {
    updateField("denomUnits", [
      ...formData.denomUnits,
      { denom: "", exponent: 6, aliases: [] },
    ]);
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-4">Token Metadata</h1>
      <form className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="subdenom" className="block text-sm font-medium">
              Subdenom{" "}
              <span className="text-xs text-gray-500">(Unique identifier)</span>
            </label>
            <input
              aria-label={"subdenom-input"}
              type="text"
              id="subdenom"
              className="input input-bordered w-full mt-1"
              value={formData.subdenom}
              onChange={(e) => updateField("subdenom", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="display" className="block text-sm font-medium">
              Display{" "}
              <span className="text-xs text-gray-500">
                (How it&apos;s shown)
              </span>
            </label>
            <input
              aria-label={"display-input"}
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
              aria-label={"name-input"}
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
              aria-label={"symbol-input"}
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
            aria-label={"description-input"}
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
              aria-label={"uri-input"}
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
              aria-label={"uri-hash-input"}
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
                value={
                  fullDenom.slice(0, 20) + "..." + fullDenom.slice(40, 100)
                }
                disabled
              />
            </div>
            <div className="flex space-x-2">
              <div className="flex-grow">
                <label className="block text-sm font-medium">
                  Additional Denom{" "}
                  <span className="text-xs text-gray-500">(Display denom)</span>
                </label>
                <input
                  type="text"
                  placeholder="Denom"
                  className="input input-bordered w-full mt-1"
                  value={formData.denomUnits[1]?.denom || ""}
                  onChange={(e) => updateDenomUnit(1, "denom", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Exponent{" "}
                  <span className="text-xs text-gray-500">(Decimals)</span>
                </label>
                <div className="dropdown mt-1 w-full">
                  <label
                    tabIndex={0}
                    className="btn m-0 w-full input input-bordered flex justify-between items-center"
                  >
                    {formData.denomUnits[1]?.exponent || 6}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow -mt-12 bg-base-100 rounded-box w-40 -ml-4"
                  >
                    {[6, 9, 12, 18].map((exp) => (
                      <li key={exp}>
                        <a onClick={() => updateDenomUnit(1, "exponent", exp)}>
                          {exp}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-6 flex space-x-4">
        <button onClick={prevStep} className="btn btn-neutral flex-1">
          Previous
        </button>
        <button
          onClick={nextStep}
          className="btn btn-primary flex-1"
          disabled={!isFormValid()}
        >
          Next: Confirmation
        </button>
      </div>
    </section>
  );
}
