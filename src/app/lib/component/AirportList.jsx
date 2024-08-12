'use client';

import React, { useEffect } from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext'; // Use relative path

const AirportList = ({ onAirportClick, setWeatherData }) => {
  const {
    airportValues,
    setAirportValues,
    setSelectedAirport,
    selectedAirport,
    airportCategories,
  } = useRccContext();

  useEffect(() => {
    // Log airportCategories to the console whenever it changes
    console.log('Airport Categories from AirportList:::', airportCategories);
  }, [airportCategories]);

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
      <ul className="flex gap-2 flex-nowrap">
        {airportValues.map((airport, index) => {
          const categoryInfo = airportCategories[airport.code] || {};
          const dotColorClass = categoryInfo.color || 'text-gray-500'; // Default to gray if no color is found

          return (
            <li
              key={index}
              onClick={() => handleAirportClick(airport)}
              className={`flex items-center bg-gray-100 dark:bg-gray-700 justify-between p-2 rounded-md shadow-sm ${selectedAirport && selectedAirport.code === airport.code ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'
                } cursor-pointer`}
            >
              <span>{airport.code}</span>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent li onClick from being called
                  removeAirportValue(airport.code);
                }}
                className="flex items-center ml-1 relative"
              >
                {/* Dot with category color */}
                <span className={`mr-2 ${dotColorClass}`} style={{ fontSize: '1.5rem' }}>
                  &#9679;
                </span>
                <div className='shadow-sm border hover:scale-110 transition-transform duration-150'>x</div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AirportList;
