import React, { useEffect } from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext';

const AirportList = ({ onAirportClick }) => {
  const {
    selectedAirport,
    airportCategories,
    removeAirportValue,
    selectedForm,
    flightDetails, // Import flightDetails from context
  } = useRccContext();

  // Extract all airports from flightDetails and combine them into a single list
  const airportsToShow = [
    flightDetails.departure && { code: flightDetails.departure },
    flightDetails.destination && { code: flightDetails.destination },
    ...(flightDetails.icaoAirports || []).map((code) => ({ code })),  // Convert ICAO airports into objects
    ...(flightDetails.icaoAirportALTN || []).map((code) => ({ code })),  // Convert ICAO alternate airports into objects
  ].filter(Boolean);  // Filter out falsy values (null or undefined)

  const handleRemoveClick = (e, airportCode) => {
    e.stopPropagation(); // Prevent li onClick from being called
    removeAirportValue(airportCode); // Call the remove function from context
  };


  return (
    <div className="flex p-3 rounded-lg w-full">
      {/* Use CSS Grid with fixed-size columns */}
      <ul className="grid grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] gap-4 w-full">
        {airportsToShow.map((airport, index) => {
          const categoryInfo = airportCategories[airport.code] || {};
          const dotColorClass = categoryInfo.color || 'text-gray-500';

          return (
            <li
              key={index}
              onClick={() => onAirportClick(airport.code)} // Use the passed down onAirportClick
              className={`flex items-center bg-gray-100 dark:bg-gray-700 justify-between p-2 
                rounded-md shadow-sm ${selectedAirport && selectedAirport.code === airport.code ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'
                } cursor-pointer`}
            >
              <span>{airport.code}</span>

              <button
                onClick={(e) => handleRemoveClick(e, airport.code)}
                className="flex items-center ml-1 relative"
              >
                <span className={`mr-2 ${dotColorClass}`} style={{ fontSize: '1.5rem' }}>
                  &#9679;
                </span>

                {/* Conditionally show the 'x' div only for "Airport Search" */}
                {selectedForm === 'Airport Search' && (
                  <div className='shadow-sm border hover:scale-110 transition-transform duration-150'>x</div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AirportList;
