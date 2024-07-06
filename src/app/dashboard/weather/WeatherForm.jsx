// src/app/dashboard/weather/WeatherForm.jsx
import React, { useState } from 'react';
import AirportSidebar from '../../lib/component/AirportSidebar';
import { useRccContext } from '../RccCalculatorContext';

const WeatherForm = ({ fetchWeather }) => {
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState('');

  const { airportValues, addAirportValue, setWeatherData, setSelectedAirport } = useRccContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Split input value by spaces and trim whitespace
    const airportCodes = inputValue.toUpperCase().split(' ').map(code => code.trim());
  
    // Validate each airport code
    for (const code of airportCodes) {
      if (!code || code.length !== 4) {
        setError(`Please enter valid 4-letter airport codes separated by spaces`);
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
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            placeholder="Enter airport codes separated by commas"
            className="border p-2 rounded"
          />
          <div className='p-1'></div>
          <button type="submit" className=" p-2 bg-blue-500 text-white rounded">Submit</button>
          {error && <p className='bg-orange-400 text-red-700 mt-2'>{error}</p>}
        </form>
        <AirportSidebar onAirportClick={handleAirportClick} setWeatherData={setWeatherData} />
    </div>
  );
};

export default WeatherForm;