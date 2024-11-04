'use client';

import { DocumentIcon, CloudIcon, LogoutIcon } from '@heroicons/react/outline';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { deleteCookie } from 'cookies-next';

import clsx from 'clsx';

const links = [
  {
    name: 'Weather',
    href: '/dashboard/weather',
    icon: CloudIcon
  },
  {
    name: 'RCAM PDF',
    href: '/dashboard/rcam-pdf',
    icon: DocumentIcon
  }
];

export default function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();

  // Handle logout action
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
    <div className='flex flex-col h-full justify-between'>
      <div className=''>
        {links.map((link) => {
          const LinkIcon = link.icon;
          return (
            <a
              key={link.name}
              href={link.href}
              className={clsx(
                'flex h-[48px] mt-2 grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                {
                  'bg-sky-100 text-blue-600': pathname === link.href,
                },
              )}
            >
              <LinkIcon className="w-6" />
              <p className="hidden md:block">{link.name}</p>
            </a>
          );
        })}
      </div>

      <div className="flex w-full">
        <button
          onClick={handleLogout}
          className="flex w-full h-[48px] items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:justify-start md:p-2 md:px-3"
        >
          <LogoutIcon className="w-6" />
          <p className="hidden md:block">Logout</p>
        </button>
      </div>
    </div>
  );
}
