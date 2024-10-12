'use client';

import { DocumentIcon, CloudIcon, LogoutIcon } from '@heroicons/react/outline'; // Import icons
import { useRouter } from 'next/navigation';  // Next.js router for redirect
import { signOut } from 'firebase/auth';      // Firebase signOut
import { auth } from '../../../firebaseConfig';  // Firebase configuration
import { usePathname } from 'next/navigation';
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
  const router = useRouter();  // Initialize Next.js router for navigation

  // Handle logout action
  const handleLogout = async () => {
    try {
      await signOut(auth);  // Sign out from Firebase
      router.push('/login');  // Redirect to the Login page
    } catch (error) {
      console.error('Error logging out:', error);  // Handle any errors during sign out
    }
  };

  return (
    <div className='flex flex-col h-full justify-between'> {/* This ensures content is spaced between */}
      {/* Navigation links */}
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

      {/* Logout Button */}
      <div className="flex w-full"> {/* Remove extra margin */}
        <button
          onClick={handleLogout}
          className="flex w-full h-[48px] items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:justify-start md:p-2 md:px-3"
        >
          <LogoutIcon className="w-6" />  {/* Use consistent styling for icon */}
          <p className="hidden md:block">Logout</p>
        </button>
      </div>
    </div>
  );
}
