import React, { useState, useEffect } from 'react';
import AirportList from '../../lib/component/AirportList';
import { useRccContext } from '../RccCalculatorContext';
import WarningModal from '../../lib/component/WarningModal';
import { Roboto_Flex } from 'next/font/google';

const AirportSearchForm = ({ fetchWeather }) => {
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duplicateAirports, setDuplicateAirports] = useState([]);
  const [validAirports, setValidAirports] = useState([]);

  const {
    airportValues,
    addAirportValue,
    setWeatherData,
    setSelectedAirport,
    selectedForm,
    flightDetails,
  } = useRccContext();

  const getAirportsToShow = () => {
    if (selectedForm === 'Routing Search') {
      return [{ id: flightDetails.departure, name: `Airport ${flightDetails.departure}`, code: flightDetails.departure }];
    }
    return airportValues;
  };

  const airportsToShow = getAirportsToShow();

  useEffect(() => {
    if (selectedForm === 'Routing Search' && flightDetails.departure) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Split input value by spaces and trim whitespace
    const airportCodes = inputValue.split(' ').map((code) => code.trim());

    let duplicates = [];
    let validCodes = [];

    // Track duplicates within the input itself
    const seenCodes = new Set();

    // Validate each airport code
    for (const code of airportCodes) {
      if (!code || code.length !== 4) {
        setError(`Please enter valid ICAO airport codes separated by spaces`);
        return;
      }

      // Check for duplicates within the input
      if (seenCodes.has(code)) {
        duplicates.push(code);
        continue;
      }

      // Check if the airport is already in the airportValues list
      const airportExists = airportValues.some((airport) => airport.code === code);
      if (airportExists) {
        duplicates.push(code);
      } else {
        validCodes.push(code);
        seenCodes.add(code);
      }
    }

    if (duplicates.length > 0) {
      setDuplicateAirports(duplicates);
      setIsModalOpen(true);
    }

    // Add valid (non-duplicate) airports to the list
    addValidAirports(validCodes);
  };

  const addValidAirports = async (validCodes) => {
    for (const code of validCodes) {
      const newAirport = { id: code, name: `Airport ${code}`, code: code };
      addAirportValue(newAirport);
    }

    // Fetch weather data for the first valid airport
    if (validCodes.length > 0) {
      const firstValidCode = validCodes[0];
      const data = await fetchWeather(firstValidCode);
      setWeatherData(data);
      setSelectedAirport({ id: firstValidCode, name: `Airport ${firstValidCode}`, code: firstValidCode });
    }

    // Update the input value to retain only duplicates if there are any
    if (duplicateAirports.length > 0) {
      const remainingInput = duplicateAirports.join(' ');
      setInputValue(remainingInput);
    } else {
      setInputValue('');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setDuplicateAirports([]);
    setInputValue(''); // Clear input after modal closes
  };

  const handleAirportClick = async (airportCode) => {
    const data = await fetchWeather(airportCode);
    setWeatherData(data);
    setSelectedAirport({ id: airportCode, name: `Airport ${airportCode}`, code: airportCode });
  };

  return (
    <div className="flex">


      <WarningModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        message={`Airport code(s) ${duplicateAirports.join(', ')} already entered.`}
      />

      <div className="flex-1 pt-4">
        <form onSubmit={handleSubmit} className="mb-4 relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter ICAO codes"
            className="border p-2 rounded"
          />
          {error && <p className="bg-orange-400 text-red-700 mt-2">{error}</p>}
        </form>
      </div>

      <div className="flex-1">
  <div className="flex flex-wrap">
    <AirportList
      airportsToShow={airportsToShow}
      onAirportClick={handleAirportClick}
      setWeatherData={setWeatherData}
    />
  </div>
</div>


    </div>
  );
};

export default AirportSearchForm;