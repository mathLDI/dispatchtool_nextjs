import React from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext';

const AirportList = ({ onAirportClick }) => {
  const {
    selectedAirport,
    airportCategories,
    removeAirportValue,
    selectedForm,
    flightDetails, // Import flightDetails from context
  } = useRccContext();

  // Extract airports from flightDetails
  const icaoAirportsToShow = (flightDetails.icaoAirports || []).map((code) => ({ code })); // Convert ICAO airports into objects
  const icaoAirportALTNToShow = (flightDetails.icaoAirportALTN || []).map((code) => ({ code })); // Convert ICAO alternate airports into objects

  const handleRemoveClick = (e, airportCode) => {
    e.stopPropagation(); // Prevent li onClick from being called
    removeAirportValue(airportCode); // Call the remove function from context
  };

  const renderAirportList = (airports, label) => (
    <>
     <h3 className="text-sm font-bold mt-2 mb-2">{label}</h3> {/* Reduced font size */}
     <ul className="grid grid-cols-[repeat(auto-fill,_minmax(100px,_1fr))] gap-2 w-full"> {/* Reduced minmax size and gap */}
        {airports.map((airport, index) => {
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
    </>
  );

  return (
    <div className="flex flex-col rounded-lg w-full">

      <div className='flex-1 pb-1'>
          {/* Render ICAO Airports */}
      {renderAirportList(icaoAirportsToShow, '')}
      </div>

      <hr className=" border-gray-300" />

      <div className='flex-1'>
  {/* Render ICAO Alternate Airports */}
  {renderAirportList(icaoAirportALTNToShow, '')}
    </div>

</div>
      
  );
};

export default AirportList;
