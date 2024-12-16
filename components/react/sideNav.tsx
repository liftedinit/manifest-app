import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IconWallet, WalletSection } from '../wallet';
import { useTheme } from '@/contexts/theme';
import { useCallback } from 'react';
import { TailwindModal } from './modal';
import packageInfo from '../../package.json';

import {
  AdminsIcon,
  BankIcon,
  FactoryIcon,
  GroupsIcon,
  DarkIcon,
  LightIcon,
} from '@/components/icons';

import { MdContacts, MdOutlineNetworkPing } from 'react-icons/md';
import env from '@/config/env';

interface SideNavProps {
  isDrawerVisible: boolean;
  setDrawerVisible: (visible: boolean) => void;
}

export default function SideNav({ isDrawerVisible, setDrawerVisible }: SideNavProps) {
  const { toggleTheme, theme } = useTheme();
  const [isContactsOpen, setContactsOpen] = useState(false);

  const toggleDrawer = () => setDrawerVisible(!isDrawerVisible);
  const version = packageInfo.version;
  const NavItem: React.FC<{
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    href: string;
  }> = ({ Icon, href }) => {
    const { pathname } = useRouter();
    const isActive = pathname === href;
    const tooltipText = href.split('/')[1] || href;

    return (
      <li className="relative group w-full flex justify-center mb-5">
        <Link href={href} passHref legacyBehavior>
          <a
            className={`group active:scale-95 hover:ring-2  hover:ring-primary flex justify-center p-3 items-center rounded-lg transition-all duration-300 ease-in-out w-18
            ${isActive ? 'text-white bg-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            <div
              className={`w-8 h-8 duration-300  ${isActive ? 'text-white bg-primary' : 'text-[#00000066] dark:text-[#FFFFFF66] group-hover:text-primary'}`}
            >
              <Icon className="w-full h-full " />
            </div>
            {!isActive && (
              <span className="tooltip fixed z-[9999] left-[6.8rem] px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out whitespace-nowrap">
                {tooltipText}
              </span>
            )}
          </a>
        </Link>
      </li>
    );
  };

  const SideNav: React.FC = () => (
    <div className="overflow-y-auto z-30 py-5 px-3 w-32 bg-[#FFFFFF3D] dark:bg-[#FFFFFF0F] flex flex-col items-center h-full transition-transform duration-300 ease-in-out">
      <Link href={'/#'} passHref legacyBehavior>
        <a href="#" className="mb-12">
          <Image src={'/logo.svg'} className="h-16 w-16" alt="Logo" height={264} width={264} />
        </a>
      </Link>
      <ul className="flex flex-col items-center flex-grow mt-8">
        <NavItem Icon={BankIcon} href="/bank" />
        <NavItem Icon={GroupsIcon} href="/groups" />
        <NavItem Icon={AdminsIcon} href="/admins" />
        <NavItem Icon={FactoryIcon} href="/factory" />
      </ul>
      <div className="mt-auto flex flex-col items-center space-y-6 dark:bg-[#FFFFFF0F] bg-[#0000000A] rounded-lg p-4 w-[75%]">
        <button
          onClick={() => setContactsOpen(true)}
          className="relative group flex justify-center w-full text-[#00000066] dark:text-[#FFFFFF66] hover:text-primary dark:hover:text-primary transition-all duration-300 ease-in-out"
        >
          <MdContacts className="w-8 h-8" />
          <span className="tooltip fixed z-[9999] left-[6.8rem] px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out whitespace-nowrap">
            Contacts
          </span>
        </button>
        <div className="flex justify-center w-full text-[#00000066] dark:text-[#FFFFFF66]">
          <IconWallet chainName="manifest" />
        </div>
        <label className="swap swap-rotate text-[#00000066] dark:text-[#FFFFFF66] hover:text-primary dark:hover:text-primary transition-all duration-300 ease-in-out">
          <input
            type="checkbox"
            className="theme-controller hidden"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <LightIcon className="swap-on fill-current w-9 h-9 duration-300" />
          <DarkIcon className="swap-off fill-current w-9 h-9 duration-300" />
        </label>
      </div>
    </div>
  );

  const NavDrawer: React.FC<{
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    href: string;
    label: string;
  }> = ({ Icon, href, label }) => {
    const { pathname } = useRouter();
    const isActive = pathname === href;

    return (
      <li className="w-full mb-5">
        <Link href={href} legacyBehavior>
          <a
            className={`flex items-center p-2 text-base font-normal rounded-lg transition duration-300 ease-in-out ${
              isActive
                ? 'bg-primary text-white'
                : 'text-[#00000066] dark:text-[#FFFFFF66]  hover:bg-[#0000000A] hover:text-primary dark:hover:text-primary dark:hover:bg-base-300'
            }`}
          >
            <Icon className="w-8 h-8 mr-6" />
            <span className="text-xl">{label}</span>
          </a>
        </Link>
      </li>
    );
  };

  const SideDrawer: React.FC = () => (
    <div className="overflow-y-auto flex flex-col h-full bg-[#F4F4FF] dark:bg-[#1D192D]  w-64 p-4">
      <div className="flex flex-row gap-2 justify-start ml-2 mt-2 items-center mb-12 space-x-2">
        <Link href={'/#'} passHref legacyBehavior>
          <Image src={'/logo.svg'} alt="logo" width={48} height={48} className="cursor-pointer" />
        </Link>
        <div className="flex flex-col">
          <p className="text-4xl font-bold">Alberto</p>
          {env.chainTier === 'mainnet' ? null : (
            <p className="text-md uppercase">{env.chainTier}</p>
          )}
        </div>
      </div>
      <ul className="flex-grow mt-8 p-1">
        <NavDrawer Icon={BankIcon} href="/bank" label="Bank" />
        <NavDrawer Icon={GroupsIcon} href="/groups" label="Groups" />
        <NavDrawer Icon={AdminsIcon} href="/admins" label="Admins" />
        <NavDrawer Icon={FactoryIcon} href="/factory" label="Factory" />
      </ul>
      <div className="mt-auto">
        <div className="flex flex-col space-y-2 mb-4">
          <button
            onClick={() => setContactsOpen(true)}
            className="flex items-center p-2 text-base font-normal rounded-lg text-[#00000066] dark:text-[#FFFFFF66] hover:bg-[#0000000A] hover:text-primary dark:hover:text-primary dark:hover:bg-base-300 transition duration-300 ease-in-out"
          >
            <MdContacts className="w-8 h-8 mr-6" />
            <span className="text-xl">Contacts</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-2">
          {/* Theme toggle */}
          <div className="relative w-full h-[3.6rem] bg-[#0000000A] dark:bg-[#FFFFFF0F] rounded-xl">
            <label className="flex items-center justify-between w-full h-full cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <div className="flex items-center justify-center w-1/2 h-full z-10">
                <LightIcon
                  className={`w-8 h-8 ${theme === 'light' ? 'text-white' : 'text-gray-500'} transition-colors duration-300`}
                />
              </div>
              <div className="flex items-center justify-center w-1/2 h-full z-10">
                <DarkIcon
                  className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-gray-500'} transition-colors duration-300`}
                />
              </div>
              <span
                className={`absolute left-1 w-[calc(50%-0.5rem)] h-12 bg-primary rounded-xl transition-all duration-300 ease-in-out transform ${
                  theme === 'dark' ? 'translate-x-[calc(100%+0.5rem)]' : ''
                }`}
              />
            </label>
          </div>
        </div>

        <ul className="pt-5 pb-4">
          <div className="mx-auto w-full justify-center items-center h-full">
            <WalletSection chainName="manifest" />
          </div>
        </ul>
        <div className="flex flex-row justify-center items-center">
          <p className="text-sm text-gray-500">v{version}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        id="sidebar-double"
        className="fixed top-0 left-0 h-full z-30 hidden lg:flex transition-all duration-300 ease-in-out"
        aria-label="Sidebar"
      >
        <SideNav />
      </aside>
      <aside
        id="sidebar-double"
        className={`hidden lg:flex z-40 fixed top-0 left-0 h-full transform ${
          isDrawerVisible ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-500 ease-in-out`}
        aria-label="Sidebar"
      >
        <SideDrawer />
      </aside>
      <button
        onClick={toggleDrawer}
        className={`fixed top-1/2 transform -translate-y-1/2 z-50 hidden lg:block opacity-100 p-2 text-white rounded-full bg-[#C1C1CB] dark:bg-[#444151] hover:bg-primary dark:hover:bg-primary transition-all duration-500 ease-in-out ${
          isDrawerVisible ? 'left-60' : 'left-[6.8rem]'
        }`}
      >
        <svg
          className={`w-5 h-5 transition-all duration-300 ${isDrawerVisible ? '' : 'rotate-180'}`}
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
      <TailwindModal
        isOpen={isContactsOpen}
        setOpen={setContactsOpen}
        showContacts={true}
        onSelect={undefined}
      />
    </>
  );
}
