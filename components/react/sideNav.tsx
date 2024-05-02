import { PiSunThin, PiMoonThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PiBankThin,
  PiUsersFourThin,
  PiFactoryThin,
  PiChalkboardTeacherThin,
  PiCoinsThin,
} from "react-icons/pi";

import { IconWallet, WalletSection } from "../wallet";

export default function SideNav() {
  const [isDrawerVisible, setDrawerVisible] = useState(false);

  const [isdark, setIsdark] = useState(false);

  useEffect(() => {
    const storedIsDark = localStorage.getItem("isdark");
    if (storedIsDark) {
      setIsdark(JSON.parse(storedIsDark));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isdark", JSON.stringify(isdark));
  }, [isdark]);

  const toggleDrawer = () => setDrawerVisible(!isDrawerVisible);

  const NavItem: React.FC<{ Icon: React.ElementType; href: string }> = ({
    Icon,
    href,
  }) => (
    <li>
      <Link href={href} passHref legacyBehavior>
        <a className="flex justify-center p-1 items-center mt-8  rounded-lg transition-all duration-300 ease-in-out ">
          <Icon className="w-8 h-8" />
        </a>
      </Link>
    </li>
  );

  const SideNav: React.FC = () => (
    <div className="overflow-y-auto z-30 py-5 px-3 w-20 bg-base-200 shadow-xl shadow-primary border-r border-primary mx-auto justify-center align-middle h-full transition-transform duration-300 ease-in-out items-center ">
      <Link href={"/#"} passHref legacyBehavior>
        <a href="#">
          <Image
            src={"/darkLogo.png"}
            className=" h-12 w-12 mx-auto rounded-full"
            alt="Logo"
            height={264}
            width={264}
          />
        </a>
      </Link>
      <ul className=" mt-20 mx-auto items-center">
        <NavItem Icon={PiCoinsThin} href="/bank" />
        <NavItem Icon={PiUsersFourThin} href="/groups" />
        <NavItem Icon={PiChalkboardTeacherThin} href="/admins" />
        <NavItem Icon={PiFactoryThin} href="/factory" />
        <NavItem Icon={PiBankThin} href="/governance" />
      </ul>
      <div className="bottom-6 justify-center absolute space-y-4 p-3 mx-auto items-center">
        <div className="w-full mx-auto flex flex-col items-center justify-center">
          <IconWallet chainName="manifest" />
        </div>
        <label className="swap swap-rotate mx-auto">
          <input
            type="checkbox"
            className="theme-controller hidden"
            value="light"
            checked={isdark}
            onChange={() => setIsdark(!isdark)}
          />

          <PiSunThin className="swap-on mx-auto fill-current w-8 h-8" />

          <PiMoonThin className="swap-off mx-auto fill-current w-8 h-8" />
        </label>
      </div>
    </div>
  );

  const NavDrawer: React.FC<{ label: string }> = ({ label }) => (
    <li>
      <button
        type="button"
        className="flex items-center p-2 w-full text-base font-normal ease-in-out  rounded-lg transition duration-220 group"
      >
        <span className="flex-1 ml-3 text-left whitespace-nowrap">{label}</span>
      </button>
    </li>
  );

  const SideDrawer: React.FC = () => (
    <div
      id="secondary-sidenav"
      className="overflow-y-auto relative py-5 px-3 w-64 h-full  border-primary bg-base-200 transition-transform duration-300 ease-in-out"
    >
      <div className="flex ml-6 items-center row-span-1 mt-2">
        <h1 className="mb-4 text-xl font-extrabold tracking-tight leading-none md:text-xl xl:text-xl bg-clip-text text-transparent bg-gradient-to-r from-black to-mint-light dark:from-white dark:to-mint-light">
          Alberto
        </h1>
        <div className=" -mt-4 ml-6 w-10 h-10">
          <img src={"/darkLogo.png"} alt="mockup" />
        </div>
      </div>
      <ul className="space-y-6 mt-4">
        <NavDrawer label="Bank" />
        <NavDrawer label="Groups" />
        <NavDrawer label="Admins" />
        <NavDrawer label="Factory" />
        <NavDrawer label="Governance" />
      </ul>
      <ul className="pt-5 mt-5 space-y-2 border-t border-mint-100 dark:border-mint-400">
        <NavDrawer label="Docs" />
        <NavDrawer label="Components" />
        <NavDrawer label="Help" />
      </ul>
      <ul className="pt-5 mt-5 space-y-2 border-t border-mint-100 dark:border-mint-400">
        <div className="flex flex-col justify-center items-center h-full">
          <WalletSection chainName="manifest" />
        </div>
      </ul>
      <div className="flex absolute right-2 bottom-7 z-20 justify-end w-full ">
        <button
          id="show-secondary-sidenav-button"
          aria-controls="secondary-sidenav"
          type="button"
          onClick={toggleDrawer}
          className="inline-flex p-2  rounded-full cursor-pointer  border border-mint-300  hover:bg-mint-100 focus:ring-4 focus:ring-gray-100 "
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        id="sidebar-double"
        className={`   hidden md:flex fixed top-0 left-0 h-full`}
        aria-label="Sidebar"
      >
        <SideNav />
        <button
          id="hide-secondary-sidenav-button"
          aria-controls="secondary-sidenav"
          type="button"
          onClick={toggleDrawer}
          className="inline-flex absolute bottom-7 left-28 p-2  cursor-pointer border border-mint-300 rounded-full hover:bg-mint-100 focus:ring-4 focus:ring-gray-100 "
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </aside>
      <aside
        id="sidebar-double"
        className={`flex z-40 fixed top-0  h-full transform ${
          isDrawerVisible ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
        aria-label="Sidebar"
      >
        <SideDrawer />
      </aside>
    </>
  );
}
