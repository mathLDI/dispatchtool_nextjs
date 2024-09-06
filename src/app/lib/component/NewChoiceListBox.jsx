import React, { useState } from "react";

const ChoiceListbox = ({ choices, callback }) => {
  const [selected, setSelected] = useState(choices[0]); // Initialize with the first choice

  const handleChange = (e) => {
    const value = e.target.value;
    setSelected(value); // Update local selected state
    callback(value);    // Call the callback to update parent component's state
  };

  return (
    <div className="relative w-full">
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
};

export default ChoiceListbox;
