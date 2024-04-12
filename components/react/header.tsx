import { WalletSection } from "../wallet";

export default function Header() {
  return (
    <header>
      <nav className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-4 fixed w-full lg:px-6 py-2 ">
        <div className="flex justify-end items-center mx-auto max-w-screen-6xl">
          {/* Log Out Button */}
          <WalletSection chainName="akash" />
        </div>
      </nav>
    </header>
  );
}
