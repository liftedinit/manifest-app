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
  const { isAdvancedMode, toggleAdvancedMode } = useAdvancedMode();

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
      <li className="relative group z-50">
        <Link href={href} passHref legacyBehavior>
          <a className="group active:scale-95 hover:ring-2 hover:ring-primary flex justify-center p-1 items-center mt-8 rounded-lg transition-all duration-300 ease-in-out">
            <Icon
              className={`w-8 h-8 transition-all duration-300 ease-in-out ${
                isActive ? 'text-primary scale-105' : 'hover:text-primary'
              }`}
            />
            <span className="tooltip absolute z-50 left-full ml-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out whitespace-nowrap">
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

          <PiSunThin className="swap-on mx-auto fill-current w-8 h-8 " />

          <PiMoonThin className="swap-off mx-auto fill-current w-8 h-8" />
        </label>
      </div>
    </div>
  );

  const NavDrawer: React.FC<{ Icon: React.ElementType; href: string }> = ({ Icon, href }) => {
    return (
      <li>
        <Link href={href} legacyBehavior>
          <div className="flex flex-row cursor-pointer hover:text-primary justify-start gap-4 items-center transition-all duration-300 ease-in-out">
            <Icon className="w-8 h-8" />
            <span className="text-2xl">{href.slice(0, 12)}</span>
          </div>
        </Link>
      </li>
    );
  };

  const SideDrawer: React.FC = () => (
    <div
      id="secondary-sidenav"
      className="overflow-y-auto relative py-5 px-3 w-64 h-full  border-primary border-r-primary border-r transition-transform duration-300 ease-in-out"
    >
      <div className="flex flex-row gap-4 items-center ">
        <img src={'/logo.svg'} alt="logo" width={42} height={42} />
        <span className="text-2xl leadin-tight text-balance ">Alberto</span>
      </div>

      <div className="divider divider-horizon"></div>
      <ul className="space-y-6 mt-4">
        <NavDrawer href="bank" Icon={PiCoinsThin} />
        <NavDrawer href="groups" Icon={PiUsersFourThin} />
        <NavDrawer href="admins" Icon={PiChalkboardTeacherThin} />
        <NavDrawer href="factory" Icon={PiFactoryThin} />
        {/* <NavDrawer label="Governance" /> */}
      </ul>
      <div className="divider divider-horizontal"></div>
      <ul className="pt-5 mt-5 space-y-2 ">
        <div className="mx-auto w-full justify-center items-center h-full">
          <WalletSection chainName="manifest" />
        </div>
      </ul>
      <div className="flex absolute right-2 bottom-7 z-20 justify-end w-full ">
        <button
          id="show-secondary-sidenav-button"
          aria-controls="secondary-sidenav"
          type="button"
          onClick={toggleDrawer}
          className="inline-flex p-2  rounded-full cursor-pointer  border border-secondary text-secondary hover:bg-mint-100 focus:ring-4 focus:ring-secondary "
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
          className="inline-flex absolute bottom-7 left-28 p-2  cursor-pointer border border-secondary rounded-full hover:bg-mint-100 focus:ring-4 focus:ring-secondary "
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
