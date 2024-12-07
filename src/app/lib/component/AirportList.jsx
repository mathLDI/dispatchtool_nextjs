import React from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext';

const AirportList = ({ onAirportClick }) => {
  const {
    selectedAirport,
    airportCategories,
    removeAirportValue,
    selectedForm,
    flightDetails,
  } = useRccContext();

  // Extract airports from flightDetails
  const icaoAirportsToShow = (flightDetails.icaoAirports || []).map((code) => ({ code }));
  const icaoAirportALTNToShow = (flightDetails.icaoAirportALTN || []).map((code) => ({ code }));

  const handleRemoveClick = (e, airportCode) => {
    e.stopPropagation();
    removeAirportValue(airportCode);
  };

  const renderAirportList = (airports, label) => (
    <>
      <h3 className="text-sm font-bold mt-1 mb-1">{label}</h3>
      <ul className="grid grid-cols-[repeat(auto-fill,_minmax(60px,_1fr))] gap-1 w-full">
        {airports.map((airport, index) => {
          const categoryInfo = airportCategories[airport.code] || {};
          const dotColorClass = categoryInfo.color || 'text-gray-500';

          return (
            <li
              key={index}
              onClick={() => onAirportClick(airport.code)}
              className={`flex items-center justify-between p-1 rounded-md shadow-sm
    ${selectedAirport && selectedAirport.code === airport.code
                  ? 'bg-sky-100 text-black dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-sky-100 hover:text-blue-600'
                } cursor-pointer`}
            >
              <span>{airport.code}</span>

              <div className="flex items-center space-x-1"> {/* Ensure space between dot and code */}
                <span className={`${dotColorClass}`} style={{ fontSize: '1.5rem' }}>
                  &#9679;
                </span>

                {selectedForm === 'Airport Search' && (
                  <div className='shadow-sm border hover:scale-110 transition-transform duration-150'>
                    x
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );

  return (
    <div className="flex flex-col rounded-lg w-full">
      <div className='flex-1 pb-1'>
        {renderAirportList(icaoAirportsToShow, '')}
      </div>

      <hr className="border-gray-300" />

      <div className='flex-1'>
        {renderAirportList(icaoAirportALTNToShow, '')}
      </div>
    </div>
  );
};

export default AirportList;
