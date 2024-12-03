import { useTheme } from '@/contexts/theme';
import Image from 'next/image';
import Link from 'next/link';
import { TailwindModal } from './modal';

import {
  GroupsIcon,
  BankIcon,
  FactoryIcon,
  AdminsIcon,
  LightIcon,
  DarkIcon,
  ArrowRightIcon,
} from '@/components/icons';
import { WalletSection } from '../wallet';
import { RiMenuUnfoldFill } from 'react-icons/ri';
import { useState } from 'react';
import { MdOutlineNetworkPing, MdContacts } from 'react-icons/md';

export default function MobileNav() {
  const closeDrawer = () => {
    const drawer = document.getElementById('my-drawer') as HTMLInputElement;
    if (drawer) drawer.checked = false;
  };

  const NavItem: React.FC<{ Icon: React.ElementType; href: string }> = ({ Icon, href }) => {
    return (
      <li>
        <Link href={href} legacyBehavior>
          <div
            onClick={closeDrawer}
            className="flex flex-row justify-start items-center transition-all duration-300 ease-in-out text-primary"
          >
            <Icon className="w-8 h-8" />
            <span className="text-2xl">{href.slice(1, 12)}</span>
          </div>
        </Link>
      </li>
    );
  };

  const { toggleTheme, theme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');
  const [isContactsOpen, setContactsOpen] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 p-3 bg-base-300 flex lg:hidden flex-row justify-between items-center">
        <Image src="/logo.svg" height={38} width={38} alt="manifest" />
        <label htmlFor="my-drawer" className="btn btn-sm btn-primary drawer-button">
          <RiMenuUnfoldFill fontSize={'24px'} />
        </label>
      </div>
      <div className="drawer z-50 lg:hidden">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />

        <div className="drawer-side min-h-screen h-full ">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 min-h-full bg-[#F4F4FF] dark:bg-[#1D192D] space-y-3 text-base-content flex flex-col">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-4 justify-between items-center">
                <Image src={'/logo.svg'} alt="logo" width={42} height={42} />
                <span className="text-2xl leading-tight text-balance">Alberto</span>
              </div>

              {/* Updated Theme Toggle */}
              <label className="swap swap-rotate text-[#00000066] dark:text-[#FFFFFF66] hover:text-primary dark:hover:text-primary transition-all duration-300 ease-in-out">
                <input
                  type="checkbox"
                  className="theme-controller hidden"
                  value="light"
                  checked={isDark}
                  onChange={() => {
                    setIsDark(!isDark);
                    toggleTheme();
                  }}
                />
                <DarkIcon className="swap-on fill-current w-9 h-9 duration-300" />
                <LightIcon className="swap-off fill-current w-9 h-9 duration-300" />
              </label>
            </div>
            <div className="divider divider-horizon"></div>
            <NavItem Icon={BankIcon} href="/bank" />
            <NavItem Icon={GroupsIcon} href="/groups" />
            <NavItem Icon={AdminsIcon} href="/admins" />
            <NavItem Icon={FactoryIcon} href="/factory" />

            <div className="divider divider-horizon"></div>

            {/* Added Endpoint Selector and Contacts buttons */}
            <li>
              <button
                onClick={() => {
                  const modal = document.getElementById(
                    'endpoint_selector_modal'
                  ) as HTMLDialogElement;
                  if (modal) modal.showModal();
                }}
                className="flex flex-row justify-start items-center transition-all duration-300 ease-in-out text-primary"
              >
                <MdOutlineNetworkPing className="w-8 h-8" />
                <span className="text-2xl">Endpoints</span>
              </button>
            </li>
            <li className="mb-4">
              <button
                onClick={() => {
                  setContactsOpen(true);
                }}
                className="flex flex-row justify-start items-center transition-all duration-300 ease-in-out text-primary"
              >
                <MdContacts className="w-8 h-8" />
                <span className="text-2xl">Contacts</span>
              </button>
            </li>

            <div className="justify-between items-center">
              <WalletSection chainName="manifest" />
            </div>

            {/* Updated close button - now uses flex-1 and mt-auto to push to bottom */}
            <div className="flex justify-start mt-auto">
              <button onClick={closeDrawer} className="btn btn-sm btn-outline btn-primary">
                <ArrowRightIcon fontSize={'24px'} />
              </button>
            </div>
          </ul>
        </div>
      </div>
      <TailwindModal
        isOpen={isContactsOpen}
        setOpen={setContactsOpen}
        showContacts={true}
        onSelect={undefined}
      />
    </>
  );
}
