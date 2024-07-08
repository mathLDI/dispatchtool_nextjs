'use client';

import React from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext'; // Use relative path

const AirportList = ({ onAirportClick, setWeatherData }) => {
  const { airportValues, setAirportValues, setSelectedAirport, selectedAirport } = useRccContext();

  const handleAirportClick = (airport) => {
    setSelectedAirport(airport);
    onAirportClick(airport.code);
  };

  const removeAirportValue = (airportCode) => {
    const updatedAirports = airportValues.filter(airport => airport.code !== airportCode);
    setAirportValues(updatedAirports);

    if (selectedAirport && selectedAirport.code === airportCode) {
      if (updatedAirports.length > 0) {
        const newSelectedAirport = updatedAirports[0]; // Select the first airport
        setSelectedAirport(newSelectedAirport);
        onAirportClick(newSelectedAirport.code);
      } else {
        setSelectedAirport(null); // Or another default value
        // Use setWeatherData to clear the weather data
        setWeatherData(null);
      }
    }
  };

  return (
    <div className="w-full max-w-sm p-3 rounded-lg">
      <ul className="flex gap-2 ">
        {airportValues.map((airport, index) => (
          <li
            key={index}
            onClick={() => handleAirportClick(airport)}
            className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedAirport && selectedAirport.code === airport.code ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'
              } cursor-pointer`}
          >
            <span>{airport.code}</span>

            {/* button below (x) */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent li onClick from being called
                removeAirportValue(airport.code);
              }}
              className="ml-2 relative"
            >
              <div className='shadow-sm border hover:scale-110 transition-transform duration-150'>x</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AirportList;
