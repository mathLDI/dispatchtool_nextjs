import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function NewChoiceListBox({ choices, callback, value, reset, resetCallback }) {
  const [selected, setSelected] = useState(value || choices[0]); // Initialize with passed value or first choice

  // Update the selected value when the parent passes a new value through props
  useEffect(() => {
    setSelected(value);
  }, [value]);

  // Handle reset functionality
  useEffect(() => {
    if (reset) {
      setSelected(choices[0]); // Reset to the first choice
      resetCallback(); // Call the reset callback to notify the parent
    }
  }, [reset, resetCallback, choices]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSelected(newValue); // Update local selected state.
    callback(newValue);    // Call the callback to update parent component's state
  };

  return (
    <div className="relativeorange
    ">
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
    </div>
  );
}

NewChoiceListBox.propTypes = {
  choices: PropTypes.array.isRequired,
  callback: PropTypes.func.isRequired,
  value: PropTypes.any,      // Optional initial value
  reset: PropTypes.bool,     // Optional reset flag
  resetCallback: PropTypes.func,  // Optional reset callback
};