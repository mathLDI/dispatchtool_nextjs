
'use client';

import { useState } from 'react';
import { useRccContext } from '../RccCalculatorContext'; // Use relative path
import SingleAirportWeatherDisplay from '../../lib/component/SingleAirportWeatherDisplay'; // Import your weather display component

const QuickSearch = ({fetchWeather, fetchGFA }) => {
  const [searchInput, setSearchInput] = useState(''); // State for input box value
  const { airportValues, setAirportValues, setWeatherData, setSelectedAirport, selectedAirport, allWeatherData, gfaData, gfaType, setGfaType, selectedTimestamp, setSelectedTimestamp, searchTerm, handleSearchChange, categorizedNotams, isCraneFilterActive, toggleCraneFilter, selectedNotamType, renderNotamCard } = useRccContext(); // Access context

  const handleInputChange = (e) => {
    // Convert input to uppercase
    setSearchInput(e.target.value.toUpperCase());
  };

  const handleSearchAirport = (e) => {
    e.preventDefault(); // Prevent the form from submitting and refreshing the page
    if (searchInput.length === 4) { // Check for valid ICAO airport code length
      const searchedAirport = {
        id: searchInput,
        name: `Airport ${searchInput}`,
        code: searchInput,
      };

      // Replace the existing airport with the searched one
      setAirportValues([searchedAirport]);
      setSelectedAirport(searchedAirport); // Set the selected airport in the context

      setSearchInput(''); // Clear the input after searching
    } else {
      alert('Please enter a valid 4-letter ICAO airport code');
    }
  };

  const handleClearAirports = () => {
    // Clear the airportValues state by setting it to an empty array
    setAirportValues([]);
    setWeatherData(null); // Clear any weather data as well
    setSelectedAirport(null); // Clear the selected airport
    setSearchInput(''); // Clear the input field
  };

  console.log('Selected Airport from QuicSearch:', selectedAirport);
console.log('Weather Data from QuickSearch:', allWeatherData[selectedAirport?.code]);


  return (
    <div className="flex flex-col h-full p-4">
      <h1 className="text-2xl font-bold mb-4">Search Airport</h1>
      
      {/* Form with input and button */}
      <form onSubmit={handleSearchAirport}>
        <input
          type="text"
          value={searchInput}
          onChange={handleInputChange}
          placeholder="Enter ICAO airport code"
          className="p-2 border border-gray-300 rounded-md mb-4 w-full"
          style={{ textTransform: 'uppercase' }} // Ensures input looks uppercase
        />

        <button
          type="submit" // Triggers the form submission when pressing "Enter"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
        >
          Search Airport
        </button>
      </form>

      {/* Clear Button */}
      <button
        onClick={handleClearAirports}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear Search
      </button>

      {/* Display the searched airport */}
      <div className="mt-4">
        <h2 className="text-lg font-bold">Searched Airport:</h2>
        <ul>
          {airportValues.length > 0 ? (
            airportValues.map((airport) => (
              <li key={airport.id}>
                {airport.name} ({airport.code})
              </li>
            ))
          ) : (
            <li>No airports searched</li>
          )}
        </ul>
      </div>

      <div className='bg-yellow-400'></div>

      {/* Render SingleAirportWeatherDisplay */}
  
      
    </div>
  );
};

export default QuickSearch;
