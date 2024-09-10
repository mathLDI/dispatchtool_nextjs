import React, { useEffect } from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext';

const AirportList = ({ airportsToShow, onAirportClick }) => {
  const { selectedAirport, airportCategories, removeAirportValue } = useRccContext();

  const handleRemoveClick = (e, airportCode) => {
    e.stopPropagation(); // Prevent li onClick from being called
    removeAirportValue(airportCode); // Call the remove function from context
  };

  return (
    <div className="w-full max-w-full p-3 rounded-lg">
      {/* Define a grid with 10 columns */}
      <ul className="grid grid-cols-10 gap-2">
        {airportsToShow.map((airport, index) => {
          const categoryInfo = airportCategories[airport.code] || {};
          const dotColorClass = categoryInfo.color || 'text-gray-500';

          return (
            <li
              key={index}
              onClick={() => onAirportClick(airport.code)} // Use the passed down onAirportClick
              className={`flex items-center bg-gray-100 dark:bg-gray-700 justify-between p-2 rounded-md shadow-sm ${selectedAirport && selectedAirport.code === airport.code ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'
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
                <div className='shadow-sm border hover:scale-110 transition-transform duration-150'>x</div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AirportList;
