// src/app/dashboard/weather/AirportSearchForm.jsx

//this is the component that is used to search for airports 
//and display the list of airports that have been added

import React, { useState } from 'react';
import AirportSidebar from '../../lib/component/AirportSidebar';
import { useRccContext } from '../RccCalculatorContext';
import { SearchIcon } from '@heroicons/react/solid'; // or '@heroicons/react/outline' for outline icons


const AirportSearchForm = ({ fetchWeather }) => {
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState('');

  const { airportValues, addAirportValue, setWeatherData, setSelectedAirport } = useRccContext();

  // Function to handle input changes
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setInputValue(inputValue.toUpperCase());

    // Clear error if input is empty
    if (!inputValue.trim()) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Split input value by spaces and trim whitespace
    const airportCodes = inputValue.split(' ').map(code => code.trim());

    // Validate each airport code
    for (const code of airportCodes) {
      if (!code || code.length !== 4) {
        setError(`Please enter valid ICAO airport codes separated by spaces`);
        return;
      }

      // Check if the airport is already in the list
      const airportExists = airportValues.some((airport) => airport.code === code);
      if (airportExists) {
        setError(`Airport code ${code} already added`);
        return;
      }

      // Add each new airport
      const newAirport = { id: code, name: `Airport ${code}`, code: code };
      addAirportValue(newAirport);
      console.log(`Added airport: ${code}`);
    }

    setError('');
    // Select the first airport in the list for fetching weather data
    if (airportCodes.length > 0) {
      const firstAirportCode = airportCodes[0];
      const data = await fetchWeather(firstAirportCode);
      console.log('Fetched Weather Data:', data); // Log the fetched weather data
      setWeatherData(data);
      setSelectedAirport({ id: firstAirportCode, name: `Airport ${firstAirportCode}`, code: firstAirportCode });
    }

    // Clear the input value after submission
    setInputValue('');
  };

  const handleAirportClick = async (airportCode) => {
    const data = await fetchWeather(airportCode);
    console.log('Fetched Weather Data for:', airportCode, data); // Log the fetched weather data
    setWeatherData(data);
    setSelectedAirport({ id: airportCode, name: `Airport ${airportCode}`, code: airportCode });
  };

  return (
    <div className='flex-auto'>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter ICAO codes"
            className="border p-2 rounded " // Adjust padding to make space for the icon
          />
          <button type="submit" className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-2 p-2   rounded flex items-center justify-center">
            <SearchIcon className="h-5 w-5" />
          </button>
        </div>         {error && <p className='bg-orange-400 text-red-700 mt-2'>{error}</p>}
      </form>
      <AirportSidebar onAirportClick={handleAirportClick} setWeatherData={setWeatherData} />
    </div>
  );
};

export default AirportSearchForm;