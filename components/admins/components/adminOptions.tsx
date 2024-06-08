import { UpdateAdminModal } from "../modals/updateAdminModal";

export default function AdminOptions() {
  const exitEnabled = true;
  const handleOpen = () => {
    const modal = document.getElementById(
      `update-admin-modal`
    ) as HTMLDialogElement;
    modal?.showModal();
  };
  return (
    <div className="w-1/2 mx-auto p-4 bg-base-100 rounded-md">
      <div className="px-4 py-2 border-base-content flex items-center justify-between">
        <h3 className="text-lg font-bold leading-6">Admin</h3>
      </div>
      <div className="divider divider-horizon -mt-2 mb-1"></div>
      <div className="flex flex-col gap-8 w-full h-auto justify-between items-center bg-base-300 rounded-md p-2">
        <div className="flex h-[5.2rem] w-[5.2rem] bg-base-300 justify-center items-center rounded-full">
          <img
            className="h-[4rem] w-[4rem] rounded-full"
            src={`https://avatars.dicebear.com/api/initials/`}
            alt=""
          />
        </div>
        <a className="text-2xl leading-6 -mt-2">Group Policy Title</a>
        <a className="text-md leading-tight text-center text-neutral-content  -mt-4">
          A Breif Description about the group titled above
        </a>
        <div className="flex flex-row gap-4 justify-center items-center -mt-2 w-full pb-3">
          <button className="btn btn-primary btn-sm w-2/6" onClick={handleOpen}>
            Update Admin
          </button>
          <button
            className={`btn ${
              exitEnabled ? "btn-secondary" : "btn-primary"
            } btn-sm w-2/6`}
          >
            {exitEnabled ? "Disable Self Exit" : "Enable Self Exit"}
          </button>
        </div>
      </div>
      <UpdateAdminModal modalId="update-admin-modal" />
    </div>
  );
}
