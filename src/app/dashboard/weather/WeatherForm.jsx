// src/app/dashboard/weather/WeatherForm.jsx
'use client';

import React, { useState } from 'react';
import AirportSidebar from '../../lib/component/AirportSidebar';
import { useRccContext } from '../RccCalculatorContext'; // Adjust the path as needed

const WeatherForm = ({ fetchWeather }) => {
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState('');

  const { airportValues, addAirportValue, setWeatherData, setSelectedAirport } = useRccContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure input is valid
    if (!inputValue || inputValue.length !== 4) {
      setError('Please enter a valid 4-letter airport code');
      return;
    }

    // Check if the airport is already in the list
    const airportExists = airportValues.some((airport) => airport.code === inputValue.toUpperCase());
    if (airportExists) {
      setError('Airport code already added');
      return;
    }

    setError('');
    const newAirport = { id: inputValue.toUpperCase(), name: `Airport ${inputValue.toUpperCase()}`, code: inputValue.toUpperCase() };
    addAirportValue(newAirport);
    setSelectedAirport(newAirport); // Set the newly added airport as the selected airport
    console.log(`Added airport: ${inputValue}`);
    const data = await fetchWeather(newAirport.code);
    console.log('Fetched Weather Data:', data); // Log the fetched weather data
    setWeatherData(data);

    // Clear the input value after submission
    setInputValue('');
  };

  const handleAirportClick = async (airportCode) => {
    setError('');
    console.log(`Fetching weather for airport: ${airportCode}`);
    const data = await fetchWeather(airportCode);
    console.log('Fetched Weather Data:', data); // Log the fetched weather data
    setWeatherData(data);
  };

  return (
    <div className=''>
      <div className=''>
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            maxLength={4}
            className="border p-2 rounded"
          />
          <div className='p-1'></div>
          <button type="submit" className=" p-2 bg-blue-500 text-white rounded">Submit</button>
          {error && <p className='bg-orange-400 text-red-700 mt-2'>{error}</p>}
        </form>
        <AirportSidebar onAirportClick={handleAirportClick} />
      </div>
    </div>
  );
};

export default WeatherForm;
