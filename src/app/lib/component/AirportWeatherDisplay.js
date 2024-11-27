'use client';

import React, { useState } from 'react';
import Card from '../../lib/component/Card';
import MetarDisplay from '../../lib/component/MetarDisplay';
import TafDisplay from '../../lib/component/TafDisplay';
import GfaDisplay from '../../lib/component/GfaDisplay';
import { useRccContext } from '../../dashboard/RccCalculatorContext';


export default function AirportWeatherDisplay({
  weatherData,
  gfaData,
  gfaType,
  setGfaType,
  selectedTimestamp,
  setSelectedTimestamp,
  leftWidth,

  handleNotamTypeChange,
  countFilteredNotams,
  searchTerm,
  handleSearchChange,
  categorizedNotams,
  isCraneFilterActive,
  toggleCraneFilter,
  selectedNotamType,
  renderNotamCard,
  selectedForm, // Add selectedForm as a prop
  flightDetails, // Add flightDetails as a prop
  allWeatherData, // Add allWeatherData as a prop
}) {

  const {
    selectedAirport,

  } = useRccContext();

  const [selectedButton, setSelectedButton] = useState('METAR/TAF');



  if (!categorizedNotams) {
    return null; // or you can return a loading spinner or a message indicating that data is being fetched
  }


  return (
    <div className="flex flex-col  ">


      <div className="flex items-center dark:bg-gray-700 justify-start p-2 space-x-2 rounded-md shadow-lg">
        <button
          className={`flex justify-center items-center p-2 rounded-md shadow-sm ${selectedButton === 'METAR/TAF' ? 'bg-sky-100 text-blue-600' : 'bg-gray-100 hover:bg-sky-100 hover:text-blue-600'}`}
          onClick={() => setSelectedButton('METAR/TAF')}>
          METAR/TAF
        </button>

        <button
          className={`flex justify-center items-center p-2 rounded-md shadow-sm ${selectedButton === 'NOTAMS' ? 'bg-sky-100 text-blue-600' : 'bg-gray-100 hover:bg-sky-100 hover:text-blue-600'}`}
          onClick={() => setSelectedButton('NOTAMS')}>
          NOTAMS
        </button>

        <button
          className={`flex justify-center items-center p-2 rounded-md shadow-sm ${selectedButton === 'ALL METAR' ? 'bg-sky-100 text-blue-600' : 'bg-gray-100 hover:bg-sky-100 hover:text-blue-600'}`}
          onClick={() => setSelectedButton('ALL METAR')}>
          ALL METAR
        </button>

        <button
          className={`flex justify-center items-center p-2 rounded-md shadow-sm ${selectedButton === 'GFA' ? 'bg-sky-100 text-blue-600' : 'bg-gray-100 hover:bg-sky-100 hover:text-blue-600'}`}
          onClick={() => setSelectedButton('GFA')}>
          GFA
        </button>
      </div>



      <div
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: '75vh', overflowY: 'auto', paddingBottom: '250px' }} // Add padding for better spacing
      >
        <div>

          {/*******  Add a conditional METAR rendering for the Airport Search *******/}


          {/* Conditional Rendering for METAR/TAF - Routing Search */}
          {selectedButton === 'METAR/TAF' && selectedForm === 'Routing Search' && (
            <>
              {/*******  Conditional METAR rendering for Routing Search - Individual airport *******/}
             <div className="flex">
      <Card title="METAR" status={null} className="h-full">
        {/* Use either weatherData or allWeatherData based on selectedAirport */}
        <MetarDisplay 
          weatherData={selectedAirport ? allWeatherData[selectedAirport.code] : weatherData} 
        />
      </Card>
    </div>



              {/*******  Conditional TAF rendering for Routing Search - Individual airport *******/}
              <div className="flex">
                <Card title="TAF" status={null} className="h-full">
                  <TafDisplay weatherData={weatherData} />
                </Card>
              </div>
            </>
          )}

          {/* Conditional Rendering for ALL METAR */}
          {selectedButton === 'ALL METAR' && selectedForm === 'Routing Search' && (
            <>
              {/* METAR for Departure */}
              {flightDetails.departure && (
                <div className="flex">
                  <Card title="METAR - Departure" status={null} className="h-full">
                    <MetarDisplay weatherData={allWeatherData[flightDetails.departure]} />
                  </Card>
                </div>
              )}

              {/* METAR for Destination */}
              {flightDetails.destination && (
                <div className="flex">
                  <Card title="METAR - Destination" status={null} className="h-full">
                    <MetarDisplay weatherData={allWeatherData[flightDetails.destination]} />
                  </Card>
                </div>
              )}

              {/* METAR for Alternate 1 */}
              {flightDetails.alternate1 && (
                <div className="flex">
                  <Card title="METAR - Alternate 1" status={null} className="h-full">
                    <MetarDisplay weatherData={allWeatherData[flightDetails.alternate1]} />
                  </Card>
                </div>
              )}

              {/* METAR for Alternate 2 */}
              {flightDetails.alternate2 && (
                <div className="flex">
                  <Card title="METAR - Alternate 2" status={null} className="h-full">
                    <MetarDisplay weatherData={allWeatherData[flightDetails.alternate2]} />
                  </Card>
                </div>
              )}

              {/* Loop through and render METAR for each ICAO Airport */}
              {Array.isArray(flightDetails.icaoAirports) && flightDetails.icaoAirports.length > 0 && (
                <div className="flex flex-col">
                  {flightDetails.icaoAirports.map((icao, index) => (
                    <div key={index} className="flex">
                      <Card title={`METAR - ICAO Airport ${icao}`} status={null} className="h-full">
                        <MetarDisplay weatherData={allWeatherData[icao]} />
                      </Card>
                    </div>
                  ))}
                </div>
              )}

              {/* Loop through and render METAR for each ICAO Alternate Airport */}
              {Array.isArray(flightDetails.icaoAirportALTN) && flightDetails.icaoAirportALTN.length > 0 && (
                <div className="flex flex-col">
                  {flightDetails.icaoAirportALTN.map((icaoAltn, index) => (
                    <div key={index} className="flex">
                      <Card title={`METAR - ICAO Alternate ${icaoAltn}`} status={null} className="h-full">
                        <MetarDisplay weatherData={allWeatherData[icaoAltn]} />
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}


          {/* Conditional Rendering for GFA - Routing Search */}
          {selectedButton === 'GFA' && (
            <>
              <div className="mb-4 flex items-center">

              </div>

              <div className="flex-grow">
                <Card title="GFA" status={null} className="h-full">
                  <div className="flex justify-center mb-1">
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
            </>
          )}


        </div>



        {/* Conditional Rendering for NOTAMS */}
        {selectedButton === 'NOTAMS' && (
          <div>
            <div className="">
              <div className="mb-2 flex items-center">
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleNotamTypeChange('AERODROME')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamType === 'AERODROME' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  AERODROME | {countFilteredNotams(categorizedNotams.flat(), 'A', searchTerm, isCraneFilterActive)}
                </button>

                <button
                  onClick={() => handleNotamTypeChange('ENROUTE')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamType === 'ENROUTE' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  ENROUTE | {countFilteredNotams(categorizedNotams.flat(), 'E', searchTerm, isCraneFilterActive)}
                </button>

                <button
                  onClick={() => handleNotamTypeChange('WARNING')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamType === 'WARNING' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  WARNING | {countFilteredNotams(categorizedNotams.flat(), 'W', searchTerm, isCraneFilterActive)}
                </button>

                <button
                  onClick={toggleCraneFilter}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${isCraneFilterActive ? 'bg-sky-100 text-blue-600 line-through' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  CRANE & TOWER
                </button>
              </div>


              <input
                type="text"
                placeholder="Search NOTAMs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="mt-2 p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            {renderNotamCard()}
          </div>
        )}



      </div>






    </div>
  );
}
