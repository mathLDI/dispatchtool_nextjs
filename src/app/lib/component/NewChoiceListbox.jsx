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

  const inputStyles = {
    WebkitCalendarPickerIndicator: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    background: 'white',
    paddingRight: '8px' // Prevent text from being hidden by the dropdown arrow
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
            className="p-2 border border-gray-300 rounded-md w-full uppercase [&::-webkit-calendar-picker-indicator]:hidden"
            autoComplete="new-password" // Prevent browser autocomplete
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
          className="p-2 border border-gray-300 rounded-md w-full"
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