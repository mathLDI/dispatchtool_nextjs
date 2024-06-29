import React from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext'; // Use relative path

const AirportSidebar = () => {
  const { airportValue } = useRccContext();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4 text-center">Selected Airport</h2>
        <ul className="space-y-2">
          {Array(6).fill().map((_, index) => (
            <li
              key={index}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md shadow-sm"
            >
              {airportValue}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AirportSidebar;
