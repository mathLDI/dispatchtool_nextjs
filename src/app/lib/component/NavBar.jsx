import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { MoonIcon } from '@heroicons/react/outline'
import PropTypes from "prop-types";
import { useState } from "react";
//import logo from '../assets/logo.png';
//import { signOut } from "firebase/auth";
//import { getAuth } from "firebase/auth";

const navigation = [
  { name: 'RCC Calculator', href: '#', id: 'rcc' },
  { name: 'X-Wind', href: '#', id: 'xwind' },
  //{ name: 'RCAM PDF', href: '#', current: false },
  { name: 'RCAM PDF', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


export default function Navbar({ selectedNavItem, onNavItemClick, toggleDarkMode }) {
  const [activeButtons, setActiveButtons] = useState(
    navigation.reduce((acc, item) => {
      acc[item.id] = item.current;
      return acc;
    }, {})
  );

  const handleButtonClick = (id) => {
    setActiveButtons((prevActiveButtons) => ({
      ...prevActiveButtons,
      [id]: !prevActiveButtons[id],
    }));
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      // You can add additional logic after the user signs out if needed.
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };


  return (
    <Disclosure as="nav" className="bg-gray-800 dark:bg-gray-700 w-full">
      {({ open }) => (
        <>
          {/* Logo Section (Left) */}
          <div className="flex mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 justify-between items-center h-16">

            {/* Left Section - Logo */}
            <div className="flex items-center">
           {/*   <img src={logo} alt="logo" className="h-8 w-8" /> */}
            </div>

            {/* Middle Section - Navigation */}
            <div className="hidden sm:ml-6 sm:block p-5">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      onNavItemClick(item.name);
                      handleButtonClick(item.id);
                    }}
                    className={classNames(
                      activeButtons[item.id]
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Right Section - Night Mode Icon and Profile Dropdown */}
            <div className="flex items-center space-x-4 ">

              {/* Night Mode Icon */}
              <button
                onClick={toggleDarkMode}
                type="button"
                className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 dark:fo focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Night Mode</span>
                <MoonIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 ">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="#A0AEC0"
                      className="w-6 h-6 rounded-full"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">

                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          onClick={handleSignOut} // Call the handleSignOut function
                          className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                        >
                          Sign out
                        </a>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>

          {/* Mobile Menu Section */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

Navbar.propTypes = {
  selectedNavItem: PropTypes.object,
  onNavItemClick: PropTypes.func,
  toggleDarkMode: PropTypes.func,
};
