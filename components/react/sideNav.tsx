import { PiSunThin, PiMoonThin, PiGearSixThin } from 'react-icons/pi';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PiUsersFourThin,
  PiFactoryThin,
  PiChalkboardTeacherThin,
  PiCoinsThin,
} from 'react-icons/pi';
import { useRouter } from 'next/router';
import { IconWallet, WalletSection } from '../wallet';
import { useTheme } from '@/contexts/theme';
import { useAdvancedMode } from '@/contexts';
import SettingsModal from './settingsModal';

export default function SideNav() {
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isdark, setIsdark] = useState(false);

  const { toggleTheme } = useTheme();

  useEffect(() => {
    const storedIsDark = localStorage.getItem('isdark');
    if (storedIsDark) {
      setIsdark(JSON.parse(storedIsDark));
      toggleTheme();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('isdark', JSON.stringify(isdark));
  }, [isdark]);

  const toggleDrawer = () => setDrawerVisible(!isDrawerVisible);

  const NavItem: React.FC<{ Icon: React.ElementType; href: string }> = ({ Icon, href }) => {
    const { pathname } = useRouter();
    const isActive = pathname === href;
    const tooltipText = href.split('/')[1] || href;

    return (
      <li className="relative group">
        <Link href={href} passHref legacyBehavior>
          <a className="group active:scale-95 hover:ring-2 hover:ring-primary flex justify-center p-1 items-center mt-8 rounded-lg transition-all duration-300 ease-in-out">
            <Icon
              className={`w-8 h-8 transition-all duration-300 ease-in-out ${
                isActive ? 'text-primary scale-105' : 'hover:text-primary'
              }`}
            />
            <span className="tooltip fixed z-[9999] left-[4.55rem] px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out whitespace-nowrap">
              {tooltipText}
            </span>
          </a>
        </Link>
      </li>
    );
  };

  const SideNav: React.FC = () => (
    <div className="overflow-y-auto z-30 py-5 px-3 w-20 bg-base-300 border-r border-primary mx-auto justify-center align-middle h-full transition-transform duration-300 ease-in-out items-center ">
      <Link href={'/#'} passHref legacyBehavior>
        <a href="#">
          <Image
            src={'/logo.svg'}
            className=" h-12 w-12 mx-auto "
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
        {/* <NavItem Icon={PiBankThin} href="/governance" /> */}
      </ul>
      <div className="bottom-6 justify-center absolute space-y-4 p-3 mx-auto items-center">
        <div className="w-full mx-auto flex flex-col items-center justify-center">
          <IconWallet chainName="manifest" />
        </div>
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="w-full mx-auto flex items-center justify-center hover:text-primary transition-all duration-300 ease-in-out pb-2"
        >
          <PiGearSixThin className="w-8 h-8" />
        </button>
        <label className="swap swap-rotate mx-auto hover:text-primary transition-all duration-300 ease-in-out">
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

          <PiMoonThin className="swap-on mx-auto fill-current w-8 h-8" />
          <PiSunThin className="swap-off mx-auto fill-current w-8 h-8 " />
        </label>
      </div>
    </div>
  );

  const NavDrawer: React.FC<{ Icon: React.ElementType; href: string; label: string }> = ({
    Icon,
    href,
    label,
  }) => {
    const { pathname } = useRouter();
    const isActive = pathname === href;

    return (
      <li className="w-full mb-2">
        <Link href={href} legacyBehavior>
          <a
            className={`flex items-center p-3 rounded-lg transition-all duration-300 ease-in-out text-gray-500 ${isActive ? 'bg-primary text-white' : 'hover:bg-base-200'}`}
          >
            <Icon className="w-8 h-8 mr-6" />
            <span className="text-xl ">{label}</span>
          </a>
        </Link>
      </li>
    );
  };

  const SideDrawer: React.FC = () => (
    <div className="flex flex-col h-full bg-base-300 w-64 p-4">
      <div className="flex flex-row gap-2 justify-start ml-2 mt-2 items-center mb-12 space-x-2">
        <Image src={'/logo.svg'} alt="logo" width={48} height={48} />
        <p className="text-2xl font-bold">Alberto</p>
      </div>
      <ul className="flex-grow mt-8 p-1">
        <NavDrawer Icon={PiCoinsThin} href="/bank" label="Bank" />
        <NavDrawer Icon={PiUsersFourThin} href="/groups" label="Groups" />
        <NavDrawer Icon={PiChalkboardTeacherThin} href="/admins" label="Admins" />
        <NavDrawer Icon={PiFactoryThin} href="/factory" label="Factory" />
      </ul>
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-4">
          <label className="swap swap-rotate">
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
            <div className="swap-on bg-base-100 rounded-full p-2">
              <PiMoonThin className="w-6 h-6" />
            </div>
            <div className="swap-off bg-base-100 rounded-full p-2">
              <PiSunThin className="w-6 h-6" />
            </div>
          </label>
        </div>
        <ul className="pt-5 mt-5 space-y-2 ">
          <div className="mx-auto w-full justify-center items-center h-full">
            <WalletSection chainName="manifest" />
          </div>
        </ul>
      </div>

      <button
        onClick={toggleDrawer}
        className="absolute top-1/2 transform -translate-y-1/2 -right-4 p-2 rounded-full bg-base-200 hover:bg-primary transition-all duration-300 ease-in-out"
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
    </div>
  );

  return (
    <>
      <aside
        id="sidebar-double"
        className="hidden md:flex fixed top-0 left-0 h-full z-40"
        aria-label="Sidebar"
      >
        <SideNav />
      </aside>
      <aside
        id="sidebar-double"
        className={`flex z-40 fixed top-0 left-0 h-full transform ${
          isDrawerVisible ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
        aria-label="Sidebar"
      >
        <SideDrawer />
      </aside>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </>
  );
}
