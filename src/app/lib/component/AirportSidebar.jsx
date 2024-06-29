import React from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext'; // Use relative path

const AirportSidebar = ({ onAirportClick }) => {
  const { airportValues } = useRccContext();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4 text-center">Selected Airports</h2>
        <ul className="space-y-2">
          {airportValues.map((airport, index) => (
            <li
              key={index}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md shadow-sm cursor-pointer"
              onClick={() => onAirportClick(airport.code)}
            >
              {airport.name} ({airport.code})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AirportSidebar;
