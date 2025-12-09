'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DocumentIcon, CloudIcon, LogoutIcon, ChevronDownIcon } from '@heroicons/react/outline';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { deleteCookie } from 'cookies-next';
// Change this line in nav-links.tsx
import { useRccContext } from '../../dashboard/RccCalculatorContext';
import clsx from 'clsx';

const navItems = [
  {
    type: 'link' as const,
    name: 'Weather (Beta)',
    href: '/dashboard/weather',
    icon: CloudIcon
  },
  {
    type: 'group' as const,
    name: 'ATR',
    icon: DocumentIcon,
    children: [
      { name: 'ATR RCAM', href: '/dashboard/rcam-atr-pdf' },
      { name: 'ATR-72 Icing How-To', href: '/dashboard/Atr72IcingHowTo' },
      { name: 'ATR Max Icing FL Calculator', href: '/dashboard/AtrIcingCalculator' },
    ]
  },
  {
    type: 'group' as const,
    name: 'DHC-8',
    icon: DocumentIcon,
    children: [
      { name: 'RCAM', href: '/dashboard/rcam-pdf' }
    ]
  }
];

export default function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode } = useRccContext();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [pinnedGroups, setPinnedGroups] = useState<Set<string>>(new Set());

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
        {navItems.map((item) => {
          if (item.type === 'link') {
            const LinkIcon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex h-[48px] items-center justify-center gap-2 rounded-md p-3 text-sm font-medium ',
                  'bg-gray-50 dark:bg-gray-700',
                  'text-gray-600 dark:text-gray-200',
                  'hover:bg-sky-100 dark:hover:bg-gray-600 hover:text-blue-600',
                  'md:flex-none md:justify-start md:p-2 md:px-3',
                  {
                    'bg-sky-100 dark:bg-gray-600 text-blue-600 dark:text-blue-400': pathname === item.href,
                  }
                )}
              >
                <LinkIcon className="w-6 " />
                <p className="hidden md:block ">{item.name}</p>
              </Link>
            );
          }

          const GroupIcon = item.icon;
          const isOpen = openGroup === item.name;

          return (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setOpenGroup(item.name)}
              onMouseLeave={() => {
                if (!pinnedGroups.has(item.name)) {
                  setOpenGroup(null);
                }
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const nextPinned = new Set(pinnedGroups);
                  if (nextPinned.has(item.name)) {
                    nextPinned.delete(item.name);
                    setPinnedGroups(nextPinned);
                    setOpenGroup(null);
                  } else {
                    nextPinned.add(item.name);
                    setPinnedGroups(nextPinned);
                    setOpenGroup(item.name);
                  }
                }}
                className={clsx(
                  'flex h-[48px] w-full items-center justify-between gap-2 rounded-md p-3 text-sm font-medium ',
                  'bg-gray-50 dark:bg-gray-700',
                  'text-gray-600 dark:text-gray-200',
                  'hover:bg-sky-100 dark:hover:bg-gray-600 hover:text-blue-600',
                  'md:justify-start md:p-2 md:px-3'
                )}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className="w-6 " />
                  <p className="hidden md:block ">{item.name}</p>
                  {pinnedGroups.has(item.name) && (
                    <span className="hidden md:inline text-xs font-semibold text-blue-600 dark:text-blue-300">PINNED</span>
                  )}
                </div>
                <ChevronDownIcon
                  className={clsx('w-4 transition-transform duration-150', {
                    'rotate-180': isOpen,
                  })}
                />
              </button>

              <div
                className={clsx(
                  'ml-4 mt-1 overflow-hidden rounded-md bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700',
                  'transition-all duration-200 origin-top',
                  isOpen ? 'max-h-96 opacity-100 translate-x-0' : 'max-h-0 opacity-0 -translate-x-2'
                )}
              >
                <div className="flex flex-col py-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={clsx(
                        'flex h-[40px] items-center gap-2 px-3 text-sm font-medium transition-colors',
                        'text-gray-600 dark:text-gray-200 hover:bg-sky-100 dark:hover:bg-gray-700 hover:text-blue-600',
                        {
                          'bg-sky-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400': pathname === child.href,
                        }
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden />
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
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