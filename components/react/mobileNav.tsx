import { useTheme } from '@/contexts/theme';
import Image from 'next/image';
import Link from 'next/link';

import {
  GroupsIcon,
  BankIcon,
  FactoryIcon,
  AdminsIcon,
  LightIcon,
  DarkIcon,
} from '@/components/icons';
import { WalletSection } from '../wallet';
import { RiMenuUnfoldFill } from 'react-icons/ri';
import { useState } from 'react';

export default function MobileNav() {
  const NavItem: React.FC<{ Icon: React.ElementType; href: string }> = ({ Icon, href }) => {
    return (
      <li>
        <Link href={href} legacyBehavior>
          <div className="flex flex-row justify-start items-center transition-all duration-300 ease-in-out text-primary">
            <Icon className="w-8 h-8" />
            <span className="text-2xl">{href.slice(1, 12)}</span>
          </div>
        </Link>
      </li>
    );
  };

  const { toggleTheme, theme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 mb-12 p-3 bg-base-300 flex flex-row justify-between items-center md:hidden">
        <Image src="/logo.svg" height={38} width={38} alt="manifest" />
        <label htmlFor="my-drawer" className="btn btn-sm btn-primary drawer-button">
          <RiMenuUnfoldFill fontSize={'24px'} />
        </label>
      </div>
      <div className="drawer z-50">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />

        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 min-h-full bg-[#F4F4FF] dark:bg-[#1D192D] space-y-3 text-base-content">
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
            <div className="justify-between items-center">
              <WalletSection chainName="manifest" />
            </div>
          </ul>
        </div>
      </div>
    </>
  );
}
