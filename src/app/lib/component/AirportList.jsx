import React, { useEffect } from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext';

const AirportList = ({ airportsToShow, onAirportClick, setWeatherData }) => {
  const {
    setSelectedAirport,
    selectedAirport,
    airportCategories,
  } = useRccContext();

  useEffect(() => {
    // Log the current list of airports to the console
    console.log('Current Airport List::::', airportsToShow);
    console.log('Airport Categories from AirportList:::', airportCategories);
  }, [airportsToShow, airportCategories]);

  const handleAirportClick = (airport) => {
    setSelectedAirport(airport);
    onAirportClick(airport.code);
  };

  const removeAirportValue = (airportCode) => {
    const updatedAirports = airportsToShow.filter(airport => airport.code !== airportCode);

    if (selectedAirport && selectedAirport.code === airportCode) {
      if (updatedAirports.length > 0) {
        const newSelectedAirport = updatedAirports[0];
        setSelectedAirport(newSelectedAirport);
        onAirportClick(newSelectedAirport.code);
      } else {
        setSelectedAirport(null);
        setWeatherData(null);
      }
    }
  };

  return (
    <div className="w-full max-w-sm p-3 rounded-lg">
      <ul className="flex gap-2 flex-nowrap">
        {airportsToShow.map((airport, index) => {
          const categoryInfo = airportCategories[airport.code] || {};
          console.log(`Category Info for::: ${airport.code}:`, categoryInfo);
          const dotColorClass = categoryInfo.color || 'text-gray-500';

          return (
            <li
              key={index}
              onClick={() => handleAirportClick(airport)}
              className={`flex items-center bg-gray-100 dark:bg-gray-700 justify-between p-2 rounded-md shadow-sm ${selectedAirport && selectedAirport.code === airport.code ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'
                } cursor-pointer`}
            >
              <span>{airport.code}</span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAirportValue(airport.code);
                }}
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
