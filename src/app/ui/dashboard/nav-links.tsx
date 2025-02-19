'use client';

import Link from 'next/link';
import { DocumentIcon, CloudIcon, LogoutIcon } from '@heroicons/react/outline';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { deleteCookie } from 'cookies-next';
// Change this line in nav-links.tsx
import { useRccContext } from '../../dashboard/RccCalculatorContext';
import clsx from 'clsx';

const links = [
  {
    name: 'Weather',
    href: '/dashboard/weather',
    icon: CloudIcon
  },
  {
    name: 'RCAM',
    href: '/dashboard/rcam-pdf',
    icon: DocumentIcon
  },
  {
    name: 'ATR RCAM',
    href: '/dashboard/rcam-atr-pdf',
    icon: DocumentIcon
  },
  {
    name: 'ATR-72 Icing How-To',
    href: '/dashboard/Atr72IcingHowTo',
    icon: DocumentIcon
  },
  {
    name: 'ATR Max Icing FL',
    href: '/dashboard/MaxFightLevelIcing',
    icon: DocumentIcon
  }
];

export default function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode } = useRccContext();

  const handleLogout = async () => {
    try {
      await signOut(auth);  // Sign out from Firebase
      deleteCookie('authToken', { path: '/' });  // Delete the authToken cookie
      router.push('/login');  // Redirect to the login page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between ">
      <div className="space-y-2">
        {links.map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'flex h-[48px] items-center justify-center gap-2 rounded-md p-3 text-sm font-medium ',
                'bg-gray-50 dark:bg-gray-700',
                'text-gray-600 dark:text-gray-200',
                'hover:bg-sky-100 dark:hover:bg-gray-600 hover:text-blue-600',
                'md:flex-none md:justify-start md:p-2 md:px-3',
                {
                  'bg-sky-100 dark:bg-gray-600 text-blue-600 dark:text-blue-400': pathname === link.href,
                }
              )}
            >
              <LinkIcon className="w-6 " />
              <p className="hidden md:block ">{link.name}</p>
            </Link>
          );
        })}
      </div>

      <button
        onClick={handleLogout}
        className="flex w-full h-[48px] items-center justify-center gap-2 rounded-md 
          bg-gray-50 dark:bg-gray-700 
          text-gray-600 dark:text-gray-200 
          hover:bg-sky-100 dark:hover:bg-gray-600 hover:text-blue-600 
          md:justify-start md:p-2 md:px-3"
      >
        <LogoutIcon className="w-6 text-gray-600 dark:text-gray-400 " />
        <p className="hidden md:block ">Logout</p>
      </button>
    </div>
  );
}