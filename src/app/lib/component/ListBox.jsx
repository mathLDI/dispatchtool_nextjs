import { Fragment, useState, useEffect } from "react";
import { Listbox, Transition, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/outline';
import PropTypes from "prop-types";

export const ChoiceListbox = ({ choices, callback, width, reset, resetCallback, value }) => {
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const changeHandler = (v) => {
    setSelected(v);
    callback(v);
  };

  useEffect(() => {
    if (reset) {
      setSelected(choices[0]);
      resetCallback();
    }
  }, [reset]);

  return (
    <div className={width === undefined ? "w-72" : width}>
      <Listbox value={selected} onChange={changeHandler}>
        <div className="relative">
          <ListboxButton
            className="relative w-full cursor-default rounded-lg bg-white dark:bg-black py-2 pl-3 pr-10 text-left border shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm "
            title={selected} // Add the title attribute to display the full text as a tooltip
          >
            <div className="flex justify-between items-center">
              <span className="block truncate">{selected}</span>
            </div>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {choices.map((choice, choiceIdx) => (
                <ListboxOption
                  key={choiceIdx}
                  className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900 dark:bg-gray-800" : "text-gray-900"}`}
                  value={choice}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`} style={{ whiteSpace: "normal", maxWidth: "300px" }}>
                        {choice}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

ChoiceListbox.propTypes = {
  choices: PropTypes.array.isRequired,
  callback: PropTypes.func.isRequired,
  width: PropTypes.string,

  reset: PropTypes.bool,
  resetCallback: PropTypes.func,
  value: PropTypes.any,
};
