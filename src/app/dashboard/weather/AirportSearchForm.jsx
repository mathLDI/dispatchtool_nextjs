import React, { useState, useEffect } from 'react';
import AirportList from '../../lib/component/AirportList';
import { useRccContext } from '../RccCalculatorContext';
import WarningModal from '../../lib/component/WarningModal';
import { SearchIcon } from '@heroicons/react/outline';

const AirportSearchForm = ({ fetchWeather }) => {
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duplicateAirports, setDuplicateAirports] = useState([]);
  const [validAirports, setValidAirports] = useState([]);

  const {
    airportValues, // List of airports
    addAirportValue,
    setWeatherData,
    setSelectedAirport,
    selectedForm,
    flightDetails,
    searchAirport, 
    setSearchAirport,
  } = useRccContext();

  const getAirportsToShow = () => {
    if (selectedForm === 'Routing Search') {
      return [{ id: flightDetails.departure, name: `Airport ${flightDetails.departure}`, code: flightDetails.departure }];
    }
    return airportValues;
  };

  // Search logic to filter airportValues based on searchAirport input (supports multiple search terms)
  const searchTerms = searchAirport.split(/\s+/).map(term => term.toUpperCase()); // Split by spaces and convert each term to uppercase

  const filteredAirports = airportValues.filter((airport) => {
    // Check if any search terms match the airport code or name
    return searchTerms.some((term) =>
      airport.code.toUpperCase().includes(term) || airport.name.toUpperCase().includes(term)
    );
  });

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
    setInputValue(inputValue.toUpperCase()); // Automatically convert the input value to uppercase

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
    <div className="flex flex-grow overflow-auto ">

      <WarningModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        message={`Airport code(s) ${duplicateAirports.join(', ')} already entered.`}
      />

      <div className='flex-1'> 
        <div className="pt-4">
          <form onSubmit={handleSubmit} className="mb-4 relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Add Airport(s), use ICAO codes"
              className="border p-2 rounded w-full"
              style={{ textTransform: 'uppercase' }} // Display input in uppercase
            />
            {error && <p className="bg-orange-400 text-red-700 mt-2">{error}</p>}
          </form>
        </div>

        {/* Search input for filtering the airport list */}
        <div className="relative flex justify-center items-center p-2">
  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
    <SearchIcon className="h-5 w-5 text-gray-500" />
  </span>
  <input
    type="text"
    placeholder="Search Airport(s)"
    value={searchAirport}
    onChange={(e) => setSearchAirport(e.target.value.toUpperCase())} // Automatically convert search input to uppercase
    className="p-2 pl-10 border border-gray-300 rounded-md w-full"
    style={{ textTransform: 'uppercase' }} // Display search input in uppercase
  />
</div>



        {/* Filtered AirportList based on search */}
        <div className="flex flex-grow">
          <AirportList
            airportsToShow={filteredAirports} // Show filtered airports
            onAirportClick={handleAirportClick}
            setWeatherData={setWeatherData}
          />
        </div>
      </div>
    </div>
  );
};

export default AirportSearchForm;
