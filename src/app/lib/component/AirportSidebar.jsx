'use client';

import React from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext'; // Use relative path

const AirportSidebar = ({ onAirportClick }) => {
  const { airportValues, removeAirportValue, setSelectedAirport, selectedAirport } = useRccContext();

  const handleAirportClick = (airport) => {
    setSelectedAirport(airport);
    onAirportClick(airport.code);
  };

  return (
    <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4 text-center">Selected Airports</h2>
      <ul className="space-y-2">
        {airportValues.map((airport, index) => (
          <li
            key={index}
            className={`flex justify-between items-center px-4 py-2 rounded-md shadow-sm ${
              selectedAirport && selectedAirport.code === airport.code ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            <span onClick={() => handleAirportClick(airport)} className="cursor-pointer">
              {airport.name} ({airport.code})
            </span>
            <button
              onClick={() => removeAirportValue(airport.code)}
              className="ml-2 text-red-500"
            >
              x
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AirportSidebar;
