import React, { useState } from "react";
import PropTypes from "prop-types";

const ManualInputListbox = ({ value, choices, callback, reset, resetCallback, placeholder }) => {
  const [selected, setSelected] = useState(value || '');

  const handleChange = (e) => {
    const input = e.target.value.toUpperCase();
    setSelected(input);
    callback(input);
  };

  const inputStyles = {
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    paddingRight: '8px'
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={selected}
        onChange={handleChange}
        placeholder={placeholder || "TYPE TO SEARCH..."}
        className="p-2 border border-gray-300 rounded-md w-full uppercase
                   dark:bg-gray-800 dark:border-gray-600 dark:text-white 
                   dark:placeholder-gray-400"
        autoComplete="off"
        style={inputStyles}
      />
    </div>
  );
};

ManualInputListbox.propTypes = {
  choices: PropTypes.array.isRequired,
  callback: PropTypes.func.isRequired,
  value: PropTypes.any,
  reset: PropTypes.bool,
  resetCallback: PropTypes.func,
  placeholder: PropTypes.string,
};

export default ManualInputListbox;