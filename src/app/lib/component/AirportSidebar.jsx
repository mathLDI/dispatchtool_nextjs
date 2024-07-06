'use client';

import React from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext'; // Use relative path

// Include setWeatherData in the component's props
const AirportSidebar = ({ onAirportClick, setWeatherData }) => {
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
        const newSelectedAirport = updatedAirports[updatedAirports.length - 1];
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
    <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4 text-center">Selected Airports</h2>
      <ul className="space-y-2">
  {airportValues.map((airport, index) => (
    <li
      key={index}
      onClick={() => handleAirportClick(airport)}
      className={`flex justify-between items-center px-4 py-2 rounded-md shadow-sm ${
        selectedAirport && selectedAirport.code === airport.code ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
      } cursor-pointer`}
    >
      <span>
        {airport.code}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent li onClick from being called
          removeAirportValue(airport.code);
        }}
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