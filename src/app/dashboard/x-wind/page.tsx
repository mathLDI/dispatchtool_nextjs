"use client"

import React, { useState, ChangeEvent } from 'react';

const Page = () => {
  // State to hold the input value
  const [inputValue, setInputValue] = useState('');

  console.log("input value::", inputValue)

  // Event handler to update the input value as the user types
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    console.log('Input Value:', value);
  };

  return (
    <>
      <p>x-wind page</p>
      <input
        type="text"
        placeholder="Enter something..."
        value={inputValue}
        onChange={handleInputChange}
      />
      <p>Input value: {inputValue}</p>
    </>
  );
};

export default Page;
