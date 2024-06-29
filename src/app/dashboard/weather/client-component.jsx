'use client';

import React, { useState } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext'; // Use relative path
import AirportSidebar from '../../lib/component/AirportSidebar';

export default function ClientComponent({ fetchWeather }) {
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState('');

  const { airportValues, addAirportValue, weatherData, setWeatherData } = useRccContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure input is valid
    if (!inputValue || inputValue.length !== 4) {
      setError('Please enter a valid 4-letter airport code');
      return;
    }

    // Check if the airport is already in the list
    const airportExists = airportValues.some(airport => airport.code === inputValue.toUpperCase());
    if (airportExists) {
      setError('Airport code already added');
      return;
    }

    setError('');
    const newAirport = { id: inputValue.toUpperCase(), name: `Airport ${inputValue.toUpperCase()}`, code: inputValue.toUpperCase() };
    addAirportValue(newAirport);
    console.log(`Added airport: ${inputValue}`);
    const data = await fetchWeather(newAirport.code);
    setWeatherData(data);
  };

  const handleAirportClick = async (airportCode) => {
    setError('');
    console.log(`Fetching weather for airport: ${airportCode}`);
    const data = await fetchWeather(airportCode);
    setWeatherData(data);
  };

  return (
    <>
      <div className='flex'>
        <div className='p-5'>
          <AirportSidebar onAirportClick={handleAirportClick} />
        </div>

        <div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              maxLength={4}
              className="border p-2 rounded"
            />
            <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded">Submit</button>
            {error && <p className='bg-orange-400 text-red-700 mt-2'>{error}</p>}
          </form>
        </div>

        <div className='p-5'>
          <h1 className='py-5'>METAR</h1>
          <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>
            <div>
              {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                <p>{weatherData.data.find(item => item.type === 'metar')?.text || 'No METAR data available'}</p>
              ) : (
                <p>No weather data available</p>
              )}
            </div>
          </Card>
          <h1 className='py-5'>TAF</h1>
          <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>
            <div>
              {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                <p>{weatherData.data.find(item => item.type === 'taf')?.text || 'No TAF data available'}</p>
              ) : (
                <p>No weather data available</p>
              )}
            </div>
          </Card>
          <h1 className='py-5'>NOTAM</h1>
          <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>
            <div>
              {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                weatherData.data.filter(item => item.type === 'notam').length > 0 ? (
                  weatherData.data.filter(item => item.type === 'notam').map((notam, index) => (
                    <div key={index} className="mb-4"> {/* Adjust mb-4 for the desired gap between NOTAMs */}
                      {notam.text.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className="mb-1">{line}</p>
                      ))}
                    </div>
                  ))
                ) : (
                  <p>No NOTAM data available</p>
                )
              ) : (
                <p>No weather data available</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
