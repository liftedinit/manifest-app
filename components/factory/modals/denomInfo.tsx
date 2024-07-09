import { TruncatedAddressWithCopy } from "@/components/react/addressCopy";

export function DenomInfoModal({
  denom,
  modalId,
}: {
  denom: any;
  modalId: string;
}) {
  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box absolute max-w-4xl mx-auto rounded-lg md:ml-20 shadow-lg">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-1 top-1">
            ✕
          </button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div>
            <h3 className="text-lg font-semibold">Denom Details</h3>
            <div className="divider divider-horizon -mt-0"></div>
            <div>
              <p className="text-sm font-light mt-4">NAME</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md">{denom.name ?? "No name available"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-light mt-4">SYMBOL</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md">
                  {denom.symbol ?? "No symbol available"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-light mt-4">DESCRIPTION</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2 max-h-[9.53rem] overflow-y-auto">
                <p className="text-md text-wrap">
                  {denom.description ?? "No description available"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-light mt-4">URI</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md">{denom.uri ?? "No URI available"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-light mt-4">EXPONENT</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md">{denom.denom_units[1].exponent}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Denom Units</h3>
            <div className="divider divider-horizon -mt-0"></div>
            {denom.denom_units.map((unit: any, index: number) => (
              <div key={index} className="mb-2">
                <div>
                  <p className="text-sm font-light mt-4">DENOM</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    <p className="text-md truncate">{unit.denom}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-light mt-4">ALIASES</p>
                  <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                    <p className="text-md">
                      {unit.aliases.join(", ") || "No aliases"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4">
          <h3 className="text-lg font-semibold">Additional Information</h3>
          <div className="divider divider-horizon -mt-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-light mt-4">BASE</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <TruncatedAddressWithCopy address={denom.base} slice={28} />
              </div>
            </div>
            <div>
              <p className="text-sm font-light mt-4">DISPLAY</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md">
                  {denom.display ?? "No display available"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-light mt-4">URI HASH</p>
              <div className="bg-base-200 shadow rounded-lg p-4 mt-2 mb-2">
                <p className="text-md">
                  {denom.uri_hash ?? "No URI hash available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
