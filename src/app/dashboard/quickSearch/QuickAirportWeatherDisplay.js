'use client';

import React, { useState } from 'react';
import Card from '../../lib/component/Card';
import QuickMetarDisplay from './QuickMetarDisplay';  // Correct relative path
import QuickTafDisplay from './QuickTafDisplay';
import QuickGfaDisplay from './QuickGfaDisplay';
import { useRccContext } from '../RccCalculatorContext';


export default function QuickAirportWeatherDisplay({

  gfaData,
  gfaType,
  setGfaType,
  selectedTimestamp,
  setSelectedTimestamp,
  leftWidth,
  setIsResizing,
  handleNotamTypeChange,
  countFilteredNotams,
  searchTerm,
  handleSearchChange,
  categorizedNotams,
  isCraneFilterActive,
  toggleCraneFilter,
  selectedNotamTypeQuick,
  renderNotamCard,
  selectedForm,
  flightDetails,
  allWeatherData,
}) {

  const {
    quickWeatherData

  } = useRccContext();



  const [selectedButton, setSelectedButton] = useState('METAR/TAF');


  console.log("quickWeatherData from airportweatherdisplay:", quickWeatherData)


  if (!categorizedNotams) {
    return null; // or you can return a loading spinner or a message indicating that data is being fetched
  }




  return (
    <div className="flex flex-col ">


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
          className={`flex justify-center items-center p-2 rounded-md shadow-sm ${selectedButton === 'GFA' ? 'bg-sky-100 text-blue-600' : 'bg-gray-100 hover:bg-sky-100 hover:text-blue-600'}`}
          onClick={() => setSelectedButton('GFA')}>
          GFA
        </button>
      </div>



      <div>

        <div>

          {/*******  Add a conditional METAR rendering for the Airport Search *******/}



        
            <div className="flex">
              <Card title="METAR" status={null} className="h-full">
                <QuickMetarDisplay quickWeatherData={quickWeatherData} />
              </Card>
            </div>
       


      



          {/*******  Add a conditional TAF rendering for the Airport Search *******/}


        
            <div className="flex">
              <Card title="TAF" status={null} className="h-full">
                <QuickTafDisplay quickWeatherData={quickWeatherData} />
              </Card>
            </div>
     


          {/* Conditional Rendering for GFA - Routing Search */}
          {selectedButton === 'GFA' && (
            <>
              <div className="mb-4 flex items-center">

              </div>

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
                  <QuickGfaDisplay
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
                  onClick={() => handleNotamTypeChange('AERODROME QUICK')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamTypeQuick === 'AERODROME QUICK' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  AERODROME | {countFilteredNotams((categorizedNotams.futureNotams ?? []).concat(categorizedNotams.todayNotams ?? [], categorizedNotams.last7DaysNotams ?? [], categorizedNotams.last30DaysNotams ?? [], categorizedNotams.olderNotams ?? []), 'A', searchTerm, isCraneFilterActive)}
                </button>
                <button
                  onClick={() => handleNotamTypeChange('ENROUTE QUICK')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamTypeQuick === 'ENROUTE QUICK' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  ENROUTE | {countFilteredNotams((categorizedNotams.futureNotams ?? []).concat(categorizedNotams.todayNotams ?? [], categorizedNotams.last7DaysNotams ?? [], categorizedNotams.last30DaysNotams ?? [], categorizedNotams.olderNotams ?? []), 'E', searchTerm, isCraneFilterActive)}
                </button>
                <button
                  onClick={() => handleNotamTypeChange('WARNING QUICK')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamTypeQuick === 'WARNING QUICK' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
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
        )}



      </div>






    </div>
  );
}
