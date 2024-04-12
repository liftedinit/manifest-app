import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { PiSunThin, PiMoonThin } from "react-icons/pi";
import { useTheme } from "../../contexts/theme";
import { useState } from "react";
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
  const { theme, toggleTheme } = useTheme();
  const [isDrawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => setDrawerVisible(!isDrawerVisible);

  const NavItem: React.FC<{ Icon: React.ElementType; href: string }> = ({
    Icon,
    href,
  }) => (
    <li>
      <Link href={href} passHref legacyBehavior>
        <a className="flex justify-center p-1 items-center mt-8 text-dark-bg-800 rounded-lg transition-all duration-300 ease-in-out dark:text-light-bg-100 hover:text-mint-600 dark:hover:text-mint hover:bg-dark-bg-100/10 dark:hover:bg-light-bg-100/10">
          <Icon className="w-8 h-8" />
        </a>
      </Link>
    </li>
  );

  const SideNav: React.FC = () => (
    <div className="overflow-y-auto z-30 py-5 px-3 w-20 mx-auto justify-center align-middle h-full bg-light-bg-300 dark:bg-dark-bg-300 border-r border-mint-100  dark:border-mint-400 transition-transform duration-300 ease-in-out items-center">
      <Link href={"/#"} passHref legacyBehavior>
        <a href="#">
          <Image
            src="/logo.svg"
            className="pl-2 h-12"
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
          <IconWallet chainName="akash" />
        </div>
        <button
          className="flex focus:ring-4 focus:ring-mint-300 dark:focus:ring-mint-900 items-center justify-center text-dark-bg-800 dark:text-light-bg-100 p-1 rounded-lg transition duration-200 hover:text-gray-900 dark:hover:text-white hover:bg-dark-bg-100/10 dark:hover:bg-light-bg-100/10"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <PiMoonThin className="w-6 h-6 dark:hover:text-mint text-dark-bg-800 dark:text-light-bg-100 hover:text-mint transition-all duration-300 ease-in-out" />
          ) : (
            <PiSunThin className="w-6 h-6 dark:hover:text-mint text-dark-bg-800 dark:text-light-bg-100 hover:text-mint transition-all duration-300 ease-in-out" />
          )}
        </button>
      </div>
    </div>
  );

  const NavDrawer: React.FC<{ label: string }> = ({ label }) => (
    <li>
      <button
        type="button"
        className="flex items-center p-2 w-full text-base font-normal ease-in-out text-gray-900 rounded-lg transition duration-220 group hover:bg-gray-100 dark:text-white dark:hover:bg-dark-bg-600/50 hover:dark:text-mint"
      >
        <span className="flex-1 ml-3 text-left whitespace-nowrap">{label}</span>
      </button>
    </li>
  );

  const SideDrawer: React.FC = () => (
    <div
      id="secondary-sidenav"
      className="overflow-y-auto relative py-5 px-3 w-64 h-full bg-light-bg-300 border-r border-mint-100 dark:bg-dark-bg-300 dark:border-mint-400 transition-transform duration-300 ease-in-out"
    >
      <div className="flex ml-6 items-center row-span-1 mt-2">
        <h1 className="mb-4 text-md font-extrabold tracking-tight leading-none md:text-xl xl:text-xl bg-clip-text text-transparent bg-gradient-to-r from-black to-mint dark:from-white dark:to-mint">
          Template
        </h1>
        <div className=" -mt-4 ml-6 w-6 h-6">
          <img src="/logo.svg" alt="mockup" />
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
          <WalletSection chainName="akash" />
        </div>
      </ul>
      <div className="flex absolute right-2 bottom-7 z-20 justify-end w-full bg-light-bg-300 dark:bg-dark-bg-300">
        <button
          id="show-secondary-sidenav-button"
          aria-controls="secondary-sidenav"
          type="button"
          onClick={toggleDrawer}
          className="inline-flex p-2  rounded-full cursor-pointer text-gray-900 border border-mint-300  hover:bg-mint-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-mint-700 dark:hover:bg-mint-700/20 dark:focus:ring-mint-800"
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
        className={`flex z-40 fixed top-0 left-0 h-full`}
        aria-label="Sidebar"
      >
        <SideNav />
        <button
          id="hide-secondary-sidenav-button"
          aria-controls="secondary-sidenav"
          type="button"
          onClick={toggleDrawer}
          className="inline-flex absolute bottom-7 left-28 p-2  cursor-pointer text-gray-900 border border-mint-300 rounded-full hover:bg-mint-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-mint-700 dark:hover:bg-mint-700/20 dark:focus:ring-mint-800"
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
