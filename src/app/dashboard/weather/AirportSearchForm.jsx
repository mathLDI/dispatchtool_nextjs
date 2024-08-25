import React, { useState, useEffect } from 'react';
import AirportList from '../../lib/component/AirportList';
import { useRccContext } from '../RccCalculatorContext';

const AirportSearchForm = ({ fetchWeather }) => {
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState('');

  const {
    airportValues,
    addAirportValue,
    setWeatherData,
    setSelectedAirport,
    selectedForm,
    flightDetails,
  } = useRccContext();

  const getAirportsToShow = () => {
    if (selectedForm === 'routingWXXForm') {
      return [{ id: flightDetails.departure, name: `Airport ${flightDetails.departure}`, code: flightDetails.departure }];
    }
    return airportValues;
  };

  const airportsToShow = getAirportsToShow();

  useEffect(() => {
    if (selectedForm === 'routingWXXForm' && flightDetails.departure) {
      fetchWeather(flightDetails.departure).then((data) => {
        setWeatherData(data);
        setSelectedAirport({ id: flightDetails.departure, name: `Airport ${flightDetails.departure}`, code: flightDetails.departure });
      });
    }
  }, [selectedForm, flightDetails.departure, fetchWeather, setWeatherData, setSelectedAirport]);

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
    }

    setError('');
    // Select the first airport in the list for fetching weather data
    if (airportCodes.length > 0) {
      const firstAirportCode = airportCodes[0];
      const data = await fetchWeather(firstAirportCode);
      setWeatherData(data);
      setSelectedAirport({ id: firstAirportCode, name: `Airport ${firstAirportCode}`, code: firstAirportCode });
    }

    // Clear the input value after submission
    setInputValue('');
  };

  const handleAirportClick = async (airportCode) => {
    const data = await fetchWeather(airportCode);
    setWeatherData(data);
    setSelectedAirport({ id: airportCode, name: `Airport ${airportCode}`, code: airportCode });
  };

  return (
    <div className='flex'>
      <div className='flex-1 pt-4'>
        <form onSubmit={handleSubmit} className="mb-4 relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter ICAO codes"
            className="border p-2 rounded"
          />
          {error && <p className='bg-orange-400 text-red-700 mt-2'>{error}</p>}
        </form>
      </div>
      <div className='flex-1'>
        <AirportList
          airportsToShow={airportsToShow}
          onAirportClick={handleAirportClick}
          setWeatherData={setWeatherData}
        />
      </div>
    </div>
  );
};

export default AirportSearchForm;
