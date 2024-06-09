import { useTheme } from "@/contexts/theme";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PiBankThin,
  PiUsersFourThin,
  PiFactoryThin,
  PiChalkboardTeacherThin,
  PiCoinsThin,
  PiHamburgerLight,
  PiMoonThin,
  PiSunThin,
} from "react-icons/pi";
import { WalletSection } from "../wallet";
import { RiMenuUnfoldFill } from "react-icons/ri";

export default function MobileNav() {
  const NavItem: React.FC<{ Icon: React.ElementType; href: string }> = ({
    Icon,
    href,
  }) => {
    return (
      <li>
        <Link href={href} legacyBehavior>
          <div className="flex flex-row justify-start items-center transition-all duration-300 ease-in-out text-primary">
            <Icon className="w-8 h-8  " />
            <span className="text-2xl">{href.slice(1, 12)}</span>
          </div>
        </Link>
      </li>
    );
  };

  const [isdark, setIsdark] = useState(false);

  const { toggleTheme } = useTheme();

  useEffect(() => {
    const storedIsDark = localStorage.getItem("isdark");
    if (storedIsDark) {
      setIsdark(JSON.parse(storedIsDark));
      toggleTheme();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isdark", JSON.stringify(isdark));
  }, [isdark]);

  return (
    <>
      <div className=" top-4 left-4 p-3 bg-base-300 flex flex-row justify-between items-center  md:hidden ">
        <Image src="/logo.svg" height={38} width={38} alt="manifest" />
        <label
          htmlFor="my-drawer"
          className="btn btn-sm btn-primary drawer-button"
        >
          <RiMenuUnfoldFill fontSize={"24px"} />
        </label>
      </div>
      <div className="drawer z-10">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />

        <div className="drawer-side">
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu p-4 w-80 min-h-full bg-base-200 space-y-3 text-base-content">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-4 justify-between items-center">
                <img src={"/logo.svg"} alt="logo" width={42} height={42} />
                <span className="text-2xl leadin-tight text-balance ">
                  Alberto
                </span>
              </div>

              <label className="swap swap-rotate hover:text-primary transition-all duration-300 ease-in-out">
                <input
                  type="checkbox"
                  className="theme-controller hidden"
                  value="light"
                  checked={isdark}
                  onChange={() => {
                    setIsdark(!isdark);
                    toggleTheme();
                  }}
                />

                <PiSunThin className="swap-on  fill-current w-8 h-8 " />

                <PiMoonThin className="swap-off fill-current w-8 h-8" />
              </label>
            </div>
            <div className="divider divider-horizon"></div>
            <NavItem Icon={PiCoinsThin} href="/bank" />
            <NavItem Icon={PiUsersFourThin} href="/groups" />
            <NavItem Icon={PiChalkboardTeacherThin} href="/admins" />
            <NavItem Icon={PiFactoryThin} href="/factory" />

            <div className="divider divider-horizon"></div>
            <div className="justify-between items-center ">
              <WalletSection chainName="manifest" />
            </div>
          </ul>
        </div>
      </div>
    </>
  );
}
