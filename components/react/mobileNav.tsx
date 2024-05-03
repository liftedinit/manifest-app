import Image from "next/image";
import { PiHamburgerLight } from "react-icons/pi";

export default function MobileNav() {
  return (
    <>
      <div className=" top-4 left-4 p-3 bg-secondary/50 flex flex-row justify-between items-center  md:hidden ">
        <Image src="/darkLogo.png" height={38} width={38} alt="manifest" />
        <label
          htmlFor="my-drawer"
          className="btn btn-sm btn-primary drawer-button"
        >
          <PiHamburgerLight fontSize={"24px"} />
        </label>
      </div>
      <div className="drawer z-10">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content"></div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <li>
              <a>Bank</a>
            </li>
            <li>
              <a>Groups</a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
