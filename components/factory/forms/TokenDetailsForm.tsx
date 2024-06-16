import { TokenAction, TokenFormData } from "@/helpers/formReducer";
import Link from "next/link";
import { PiAddressBook } from "react-icons/pi";

export default function TokenDetails({
  nextStep,
  prevStep,
  formData,
  dispatch,
  address,
}: {
  nextStep: () => void;
  prevStep: () => void;
  formData: TokenFormData;
  dispatch: React.Dispatch<TokenAction>;
  address: string;
}) {
  const updateField = (field: keyof TokenFormData, value: any) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };
  return (
    <section className="">
      <div className="lg:flex  mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight  sm:mb-6 leding-tight ">
              Token Metadata
            </h1>
            <form className=" min-h-[330px]">
              <div className="grid gap-5 my-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="full-name"
                    className="block mb-2 text-sm font-medium"
                  >
                    Token Label
                  </label>
                  <input
                    type="text"
                    placeholder="label"
                    className="input input-bordered w-full max-w-xs"
                    value={formData.label}
                    onChange={(e) => updateField("label", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium "
                  >
                    Token Ticker
                  </label>{" "}
                  <input
                    type="text"
                    placeholder="Ticker"
                    className="input input-bordered  w-full max-w-xs "
                    value={formData.symbol}
                    onChange={(e) => updateField("symbol", e.target.value)}
                  />{" "}
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium  "
                  >
                    Exponent
                  </label>
                  <input
                    type="number"
                    placeholder="6"
                    className="input input-bordered  w-full max-w-xs "
                    value={formData.exponent}
                    onChange={(e) => updateField("exponent", e.target.value)}
                  />{" "}
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium  "
                  >
                    Logo URL
                  </label>
                  <input
                    type="text"
                    placeholder="6"
                    className="input input-bordered  w-full max-w-xs "
                    value={formData.uri}
                    onChange={(e) => updateField("uri", e.target.value)}
                  />{" "}
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium  "
                  >
                    Display
                  </label>
                  <input
                    type="text"
                    placeholder="6"
                    className="input input-bordered  w-full max-w-xs "
                    value={formData.display}
                    onChange={(e) => updateField("display", e.target.value)}
                  />{" "}
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium "
                  >
                    Description
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full max-w-xs"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  ></textarea>
                </div>
              </div>
            </form>

            <button
              onClick={nextStep}
              className="w-full  btn px-5 py-2.5 sm:py-3.5 btn-primary"
              disabled={
                !formData.symbol ||
                !formData.exponent ||
                !formData.label ||
                !formData.description ||
                !formData.uri ||
                !formData.display
              }
            >
              Next: Confirmation
            </button>
            <div className="flex space-x-3 ga-4 mt-6">
              <button
                onClick={prevStep}
                className="text-center items-center w-1/2 py-2.5 sm:py-3.5 btn btn-neutral"
              >
                Prev: Token Metadata
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
