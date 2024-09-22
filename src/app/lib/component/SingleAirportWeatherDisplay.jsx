'use client';

import React, { useState } from 'react';
import Card from '../../lib/component/Card';
import MetarDisplay from '../../lib/component/MetarDisplay';
import TafDisplay from '../../lib/component/TafDisplay';
import GfaDisplay from '../../lib/component/GfaDisplay';
import { useRccContext } from '../../dashboard/RccCalculatorContext';

export default function SingleAirportWeatherDisplay({
  weatherData,
  gfaData,
  gfaType,
  setGfaType,
  selectedTimestamp,
  setSelectedTimestamp,
  handleNotamTypeChange,
  countFilteredNotams,
  searchTerm,
  handleSearchChange,
  categorizedNotams,
  isCraneFilterActive,
  toggleCraneFilter,
  selectedNotamType,
  renderNotamCard,
  allWeatherData, // Add allWeatherData as a prop
}) {
  const { selectedAirport } = useRccContext(); // Use selectedAirport instead of airportValues

  const [selectedButton, setSelectedButton] = useState('METAR/TAF');

  if (!categorizedNotams) {
    return null; // Return null or a loading state while data is being fetched
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center dark:bg-gray-700 justify-start p-2 space-x-2 rounded-md shadow-lg">
        <button className="flex justify-center items-center p-2 rounded-md shadow-sm bg-sky-100 text-blue-600">
          METAR/TAF
        </button>
        <button className="flex justify-center items-center p-2 rounded-md shadow-sm bg-gray-100 hover:bg-sky-100 hover:text-blue-600">
          NOTAMS
        </button>
        <button className="flex justify-center items-center p-2 rounded-md shadow-sm bg-gray-100 hover:bg-sky-100 hover:text-blue-600">
          ALL METAR
        </button>
        <button className="flex justify-center items-center p-2 rounded-md shadow-sm bg-gray-100 hover:bg-sky-100 hover:text-blue-600">
          GFA
        </button>
      </div>


      <div className="flex flex-col space-y-4">
        {/* Render METAR/TAF for selectedAirport */}
   
          <div className="flex flex-col">
            <Card title={`METAR - ${selectedAirport.code}`} status={null} className="h-full">
              <MetarDisplay weatherData={allWeatherData[selectedAirport.code]} />
            </Card>
            <Card title={`TAF - ${selectedAirport.code}`} status={null} className="h-full">
              <TafDisplay weatherData={allWeatherData[selectedAirport.code]} />
            </Card>
          </div>
      

        {/* Render GFA section */}
        <div className="flex-grow">
          <Card title="GFA" status={null} className="h-full">
            <div className="flex justify-center mb-2">
              <button
                onClick={() => setGfaType('CLDWX')}
                className={`px-4 py-2 rounded ${gfaType === 'CLDWX' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
              >
                CLDS & WX
              </button>
              <button
                onClick={() => setGfaType('TURBC')}
                className={`px-4 py-2 rounded ${gfaType === 'TURBC' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
              >
                ICG & TURB
              </button>
            </div>
            <GfaDisplay
              gfaData={gfaData}
              selectedTimestamp={selectedTimestamp}
              setSelectedTimestamp={setSelectedTimestamp}
            />
          </Card>
        </div>

        {/* Render NOTAMS */}
        <div>
          {renderNotamCard && renderNotamCard()}
        </div>
      </div>
    </div>
  );
}
