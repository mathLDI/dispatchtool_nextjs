'use client';

import React from 'react';
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
  resizerRef,
  isResizing,
  setIsResizing,
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








  if (!categorizedNotams) {
    return null; // or you can return a loading spinner or a message indicating that data is being fetched
  }

  return (
    <div className="flex-1 overflow-hidden bg-yellow-600">
      <div className="flex flex-row h-full">
        <div
          className="flex flex-col overflow-y-auto p-2"
          style={{ width: `${leftWidth}%`, minWidth: '20%', maxWidth: '80%' }}
        >
          <h1 className="font-bold text-lg">METAR</h1>


          {/*******  Add a conditional METAR rendering for the Airport Search *******/}


          {selectedForm === 'Airport Search' && (
            <div className="flex">
              <Card title="METAR" status={null} className="h-full">
                <MetarDisplay weatherData={weatherData} />
              </Card>
            </div>
          )}


          {/*******  Add a conditional METAR rendering for the Routing Search *******/}


          {selectedForm === 'Routing Search' && (
            <div className="flex">
              <Card title="METAR" status={null} className="h-full">
                <MetarDisplay weatherData={allWeatherData[flightDetails.departure]} />
              </Card>
            </div>
          )}

          {selectedForm === 'Routing Search' && (
            <div className="flex">
              <Card title="METAR" status={null} className="h-full">
                <MetarDisplay weatherData={allWeatherData[flightDetails.destination]} />
              </Card>
            </div>
          )}

          {selectedForm === 'Routing Search' && flightDetails.alternate1 && (
            <div className="flex">
              <Card title="METAR" status={null} className="h-full">
                <MetarDisplay weatherData={allWeatherData[flightDetails.alternate1]} />
              </Card>
            </div>
          )}


          {selectedForm === 'Routing Search' && flightDetails.alternate2 && (
            <div className="flex">
              <Card title="METAR" status={null} className="h-full">
                <MetarDisplay weatherData={allWeatherData[flightDetails.alternate2]} />
              </Card>
            </div>
          )}


          {/*******  Add a conditional TAF rendering for the Airport Search *******/}

          <h1 className="font-bold text-lg">TAF</h1>

          {selectedForm === 'Airport Search' && (
            <div className="flex-grow">
              <Card title="TAF" status={null} className="h-full">
                <TafDisplay weatherData={weatherData} />
              </Card>
            </div>
          )}


          {/*******  Add a conditional TAF rendering for the Routing Search *******/}


          {selectedForm === 'Routing Search'  && (
            <div className="flex">
              <Card title="TAF" status={null} className="h-full">
                <TafDisplay weatherData={allWeatherData[flightDetails.departure]} />
              </Card>
            </div>
          )}



          {selectedForm === 'Routing Search' && (
            <div className="flex">
              <Card title="TAF" status={null} className="h-full">
                <TafDisplay weatherData={allWeatherData[flightDetails.destination]} />
              </Card>
            </div>
          )}


          {selectedForm === 'Routing Search'  && flightDetails.alternate1 && (
            <div className="flex">
              <Card title="TAF" status={null} className="h-full">
                <TafDisplay weatherData={allWeatherData[flightDetails.alternate1]} />
              </Card>
            </div>
          )}

          {selectedForm === 'Routing Search'  && flightDetails.alternate2 && (
            <div className="flex">
              <Card title="TAF" status={null} className="h-full">
                <TafDisplay weatherData={allWeatherData[flightDetails.alternate2]} />
              </Card>
            </div>
          )}


          {/*************************************************************  *****/}


          <div className="mb-4 flex items-center">
            <h1 className="font-bold text-lg">GFA</h1>

            {/* Display selectedAirport when Routing Search is selected */}
            {selectedForm === 'Routing Search' && selectedAirport && (
              <span className="ml-2 text-lg text-gray-700">
                {selectedAirport.code}
              </span>
            )}
          </div>
          <div className="flex-grow">
            <Card title="GFA" status={null} className="h-full">
              <div className="flex justify-center mb-2">
                <button
                  onClick={() => setGfaType('CLDWX')}
                  className={`px-4 py-2 rounded ${gfaType === 'CLDWX'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                >
                  CLDS & WX
                </button>
                <button
                  onClick={() => setGfaType('TURBC')}
                  className={`px-4 py-2 rounded ${gfaType === 'TURBC'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
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
        </div>

        <div
          ref={resizerRef}
          className="w-1 bg-gray-500 cursor-col-resize"
          onMouseDown={() => setIsResizing(true)}
        />

        <div
          className="flex flex-col p-2 overflow-y-auto"
          style={{ width: `${100 - leftWidth}%`, minWidth: '20%', maxWidth: '80%' }}
        >
          <div className="mb-4">
            <div className="mb-4 flex items-center">
              <label className="font-bold mr-2 text-lg">NOTAM</label>

              {/* Display selectedAirport when Routing Search is selected */}
              {selectedForm === 'Routing Search' && selectedAirport && (
                <span className="ml-2 text-lg text-gray-700">
                  {selectedAirport.code}
                </span>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleNotamTypeChange('AERODROME')}
                className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamType === 'AERODROME' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
              >
                AERODROME | {countFilteredNotams((categorizedNotams.futureNotams ?? []).concat(categorizedNotams.todayNotams ?? [], categorizedNotams.last7DaysNotams ?? [], categorizedNotams.last30DaysNotams ?? [], categorizedNotams.olderNotams ?? []), 'A', searchTerm, isCraneFilterActive)}
              </button>
              <button
                onClick={() => handleNotamTypeChange('ENROUTE')}
                className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamType === 'ENROUTE' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
              >
                ENROUTE | {countFilteredNotams((categorizedNotams.futureNotams ?? []).concat(categorizedNotams.todayNotams ?? [], categorizedNotams.last7DaysNotams ?? [], categorizedNotams.last30DaysNotams ?? [], categorizedNotams.olderNotams ?? []), 'E', searchTerm, isCraneFilterActive)}
              </button>
              <button
                onClick={() => handleNotamTypeChange('WARNING')}
                className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamType === 'WARNING' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
              >
                WARNING | {countFilteredNotams((categorizedNotams.futureNotams ?? []).concat(categorizedNotams.todayNotams ?? [], categorizedNotams.last7DaysNotams ?? [], categorizedNotams.last30DaysNotams ?? [], categorizedNotams.olderNotams ?? []), 'W', searchTerm, isCraneFilterActive)}
              </button>
              <button
                onClick={toggleCraneFilter}
                className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${isCraneFilterActive ? 'bg-sky-100 text-blue-600 line-through' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
              >
                CRANE
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
      </div>

    </div>
  );
}
