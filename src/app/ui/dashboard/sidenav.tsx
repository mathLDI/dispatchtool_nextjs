import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PrinterIcon } from '@heroicons/react/outline';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-2 py-2 md:px-1">
      <Link
        className="mb-1 flex h-16 items-end justify-start rounded-md bg-blue-600 p-2 md:h-32"
        href="/"
      >
        <div className="w-24 text-white md:w-32">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-1 md:flex-col md:space-x-0 md:space-y-1">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form>
          <button className="flex h-[40px] w-full grow items-center justify-center gap-1 
          rounded-md bg-gray-50 p-2 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 
          md:flex-none md:justify-start md:p-1 md:px-2">
            <PrinterIcon className="w-5" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}