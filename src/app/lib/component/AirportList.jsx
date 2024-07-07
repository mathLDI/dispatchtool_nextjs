'use client';

//this component is used to display the list of airports that have been selected by the user.
//The component is then used inside the AirportSearchForm component.

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
    <div className="w-full max-w-sm p-3  rounded-lg ">

    
      <ul className="flex  flex-row space-y-2 space-x-2">
        {airportValues.map((airport, index) => (
          <li
            key={index}
            onClick={() => handleAirportClick(airport)}
            className={`flex justify-between items-center px-6 py-2 rounded-md shadow-sm ${selectedAirport && selectedAirport.code === airport.code ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'
              } cursor-pointer`}
          >
            <span>
              {airport.code}
            </span>


            {/* button below (x) */}

            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent li onClick from being called
                removeAirportValue(airport.code);
              }}
              className="ml-2 relative  " // Added relative for positioning the tooltip
            >
              <div className='shadow-sm border  hover:scale-110 transition-transform duration-150'>
                x
              </div>

            </button>

          </li>
        ))}
      </ul>
    
      
    </div>
  );
};

export default AirportList;