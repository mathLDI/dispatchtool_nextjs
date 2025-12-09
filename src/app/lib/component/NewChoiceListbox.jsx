import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const NewChoiceListbox = ({ value, choices, callback, reset, resetCallback, placeholder, allowManualInput }) => {
  const [selected, setSelected] = useState(value || '');
  const listId = `choices-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e) => {
    const newValue = allowManualInput ? e.target.value.toUpperCase() : e.target.value;
    setSelected(newValue);
    callback(newValue);
  };

  // Modern Apple-inspired input styling
  const baseInputStyles = `
    w-full px-3 py-2 
    border border-gray-300 dark:border-gray-600 
    rounded-lg 
    bg-white dark:bg-gray-800 
    text-gray-900 dark:text-gray-100
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    shadow-sm hover:border-gray-400 dark:hover:border-gray-500
  `;

  const inputStyles = {
    WebkitCalendarPickerIndicator: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    paddingRight: '8px'
  };

  return (
    <div className="relative">
      {allowManualInput ? (
        <>
          <input
            type="text"
            list={listId}
            value={selected}
            onChange={handleChange}
            onFocus={(e) => e.target.value = selected}
            onBlur={(e) => e.target.value = selected}
            placeholder={placeholder || "SELECT OR TYPE..."}
            className={`${baseInputStyles} uppercase [&::-webkit-calendar-picker-indicator]:hidden`}
            autoComplete="new-password"
            style={inputStyles}
          />
          <datalist id={listId} className="hidden">
            {choices.map((choice, idx) => (
              <option key={idx} value={choice.toUpperCase()}>
                {choice.toUpperCase()}
              </option>
            ))}
          </datalist>
        </>
      ) : (
        <select
          value={selected}
          onChange={handleChange}
          className={baseInputStyles}
        >
          {choices.map((choice, idx) => (
            <option key={idx} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
NewChoiceListbox.propTypes = {
  choices: PropTypes.array.isRequired,
  callback: PropTypes.func.isRequired,
  value: PropTypes.any,
  reset: PropTypes.bool,
  resetCallback: PropTypes.func,
  placeholder: PropTypes.string,
  allowManualInput: PropTypes.bool,
};

export default NewChoiceListbox;