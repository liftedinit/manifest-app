import { UpdateStakingParamsModal } from "../modals/updateStakingParamsModal";

export default function StakingParams() {
  const openParamsModal = () => {
    const modal = document.getElementById(
      `update-params-modal`
    ) as HTMLDialogElement;
    modal?.showModal();
  };
  return (
    <div className="w-1/2 mx-auto p-4 bg-base-100 rounded-md">
      <div className="px-4 py-2 border-base-content flex items-center flex-row justify-between">
        <h3 className="text-lg font-bold leading-6">Staking Params</h3>

        <button
          className="btn btn-primary btn-xs min-w-[4rem]"
          onClick={openParamsModal}
        >
          Update
        </button>
      </div>
      <div className="divider divider-horizon -mt-2 mb-1"></div>
      <div className="flex flex-col gap-6 justify-center items-center w-full">
        <div className="flex flex-row gap-8 w-full justify-center items-center">
          <div className="flex flex-col gap-2 w-1/2  rounded-md">
            <span className="text-sm text-gray-400">UNBONDING TIME</span>
            <span className="text-md bg-base-300 p-2 rounded-md">4 days</span>
          </div>
          <div className="flex flex-col gap-2 w-1/2 rounded-md">
            <span className="text-sm text-gray-400">MAX VALIDATORS</span>
            <span className="text-md bg-base-300 p-2 rounded-md">20</span>
          </div>
        </div>
        <div className="flex flex-row gap-8 w-full justify-center items-center">
          <div className="flex flex-col gap-2 w-1/2  rounded-md">
            <span className="text-sm text-gray-400">BOND DENOM</span>
            <span className="text-md bg-base-300 p-2 rounded-md">umfx</span>
          </div>
          <div className="flex flex-col gap-2 w-1/2 rounded-md">
            <span className="text-sm text-gray-400">MINIMUM COMMISSION</span>
            <span className="text-md bg-base-300 p-2 rounded-md">5%</span>
          </div>
        </div>
        <div className="flex flex-row gap-8 w-full justify-center items-center">
          <div className="flex flex-col gap-2 w-1/2  rounded-md">
            <span className="text-sm text-gray-400">MAX ENTRIES</span>
            <span className="text-md bg-base-300 p-2 rounded-md">111111</span>
          </div>
          <div className="flex flex-col gap-2 w-1/2 rounded-md">
            <span className="text-sm text-gray-400">HISTORICAL ENTRIES</span>
            <span className="text-md bg-base-300 p-2 rounded-md">111111</span>
          </div>
        </div>
      </div>
      <UpdateStakingParamsModal modalId="update-params-modal" />
    </div>
  );
}
