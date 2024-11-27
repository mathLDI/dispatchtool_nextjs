import React, { useState } from 'react';
import Card from '../../lib/component/Card';
import QuickMetarDisplay from './QuickMetarDisplay';
import QuickTafDisplay from './QuickTafDisplay';
import QuickGfaDisplay from './QuickGfaDisplay';
import { useRccContext } from '../RccCalculatorContext';

export default function QuickAirportWeatherDisplay({
  gfaDataQuick,
  gfaTypeQuick,
  setGfaTypeQuick,
  selectedTimestamp,
  setSelectedTimestamp,
  countFilteredNotams,
  searchTermQuick,
  handleSearchChangeQuick,
  categorizedNotamsQuick,
  isCraneFilterActiveQuick,
  toggleCraneFilterQuick,
  renderNotamCardQuick,
  selectedAirport,


}) {
  const {
    quickWeatherData,
    selectedNotamTypeQuick,
    setSelectedNotamTypeQuick,
  } = useRccContext();

  // Define local state for selectedNotamTypeQuick
  const [QuickselectedButton, setSelectedButtonQuick] = useState('METAR/TAF');


  // Define the handleNotamTypeChangeQuick function
  const handleNotamTypeChangeQuick = (newNotamType) => {
    setSelectedNotamTypeQuick(newNotamType);
  };


  if (!categorizedNotamsQuick) {
    return null;
  }


  // Function to render the NOTAMs from quickWeatherData
  const renderQuickNotams = () => {
    if (!quickWeatherData || !quickWeatherData.data) {
      return <p>No NOTAMs available.</p>;
    }

    // Filter the NOTAMs from the weather data
    const notams = quickWeatherData.data.filter((item) => item.type === 'notam');

    if (notams.length === 0) {
      return <p>No NOTAMs found.</p>;
    }

    return (
      <div className="notam-list">
        {notams.map((notam, index) => {
          const notamText = JSON.parse(notam.text).raw; // Extract the raw NOTAM text
          const startValidity = new Date(notam.startValidity).toUTCString();
          const endValidity = notam.endValidity ? new Date(notam.endValidity).toUTCString() : 'N/A';

          return (
            <div key={index} className="notam-card border p-4 mb-4 shadow-md">
              <h3 className="text-lg font-bold">NOTAM {index + 1}</h3>
              <p><strong>Location:</strong> {notam.location}</p>
              <p><strong>Start Validity:</strong> {startValidity}</p>
              <p><strong>End Validity:</strong> {endValidity}</p>
              <p><strong>Text:</strong> {notamText}</p>
            </div>
          );
        })}
      </div>
    );
  };



  return (
    <div className="flex-1 flex-col overflow-y-auto max-h-screen">
      <div className="flex items-center dark:bg-gray-700 justify-start p-1 space-x-1 rounded-md shadow-lg ">
        <button
          className={`flex justify-center items-center p-2 rounded-md shadow-sm ${QuickselectedButton === 'METAR/TAF' ? 'bg-sky-100 text-blue-600' : 'bg-gray-100 hover:bg-sky-100 hover:text-blue-600'}`}
          onClick={() => setSelectedButtonQuick('METAR/TAF')}>
          METAR/TAF
        </button>


        <button
          className={`flex justify-center items-center p-2 rounded-md shadow-sm ${QuickselectedButton === 'NOTAMS' ? 'bg-sky-100 text-blue-600' : 'bg-gray-100 hover:bg-sky-100 hover:text-blue-600'}`}
          onClick={() => setSelectedButtonQuick('NOTAMS')}>
          NOTAMS
        </button>


        {/** <button
          className={`flex justify-center items-center p-2 rounded-md shadow-sm ${QuickselectedButton === 'GFA' ? 'bg-sky-100 text-blue-600' : 'bg-gray-100 hover:bg-sky-100 hover:text-blue-600'}`}
          onClick={() => setSelectedButtonQuick('GFA')}>
          GFA
        </button>
 */}


      </div>

      <div
        className=""
        style={{ maxHeight: '75vh', overflowY: 'auto', paddingBottom: '150px' }} // Add padding for better spacing
      >

        {/* Conditionally render METAR/TAF display */}
        {QuickselectedButton === 'METAR/TAF' && (
          <>
            <div className="flex">
              <Card title="METAR" status={null} className="h-full">
                <QuickMetarDisplay quickWeatherData={quickWeatherData} />
              </Card>
            </div>

            <div className="flex">
              <Card title="TAF" status={null} className="h-full">
                <QuickTafDisplay quickWeatherData={quickWeatherData} />
              </Card>
            </div>
          </>
        )}


        {QuickselectedButton === 'GFA' && (
          <div className="mb-4 flex items-center">
            <Card title="GFA" status={null} className="h-full">
              <div className="flex justify-center mb-2">
                <button
                  onClick={() => setGfaTypeQuick('CLDWX')}
                  className={`px-4 py-2 rounded ${gfaTypeQuick === 'CLDWX' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                >
                  CLDS & WX
                </button>
                <button
                  onClick={() => setGfaTypeQuick('TURBC')}
                  className={`px-4 py-2 rounded ${gfaTypeQuick === 'TURBC' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                >
                  ICG & TURB
                </button>
              </div>
              <QuickGfaDisplay
                gfaDataQuick={gfaDataQuick}
                selectedTimestamp={selectedTimestamp}
                setSelectedTimestamp={setSelectedTimestamp}
              />
            </Card>
          </div>
        )}





        {/* Conditional Rendering for NOTAMS */}
        {QuickselectedButton === 'NOTAMS' && (
          <div>
            <div className="">
              <div className="mb-2 flex items-center">
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleNotamTypeChangeQuick('AERODROME')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamTypeQuick === 'AERODROME' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  AERODROME | {countFilteredNotams((categorizedNotamsQuick.futureNotams ?? []).concat(categorizedNotamsQuick.todayNotams ?? [], categorizedNotamsQuick.last7DaysNotams ?? [], categorizedNotamsQuick.last30DaysNotams ?? [], categorizedNotamsQuick.olderNotams ?? []), 'A', searchTermQuick, isCraneFilterActiveQuick)}
                </button>
                <button
                  onClick={() => handleNotamTypeChangeQuick('ENROUTE')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamTypeQuick === 'ENROUTE' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  ENROUTE | {countFilteredNotams((categorizedNotamsQuick.futureNotams ?? []).concat(categorizedNotamsQuick.todayNotams ?? [], categorizedNotamsQuick.last7DaysNotams ?? [], categorizedNotamsQuick.last30DaysNotams ?? [], categorizedNotamsQuick.olderNotams ?? []), 'E', searchTermQuick, isCraneFilterActiveQuick)}
                </button>
                <button
                  onClick={() => handleNotamTypeChangeQuick('WARNING')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamTypeQuick === 'WARNING' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  WARNING | {countFilteredNotams((categorizedNotamsQuick.futureNotams ?? []).concat(categorizedNotamsQuick.todayNotams ?? [], categorizedNotamsQuick.last7DaysNotams ?? [], categorizedNotamsQuick.last30DaysNotams ?? [], categorizedNotamsQuick.olderNotams ?? []), 'W', searchTermQuick, isCraneFilterActiveQuick)}
                </button>
                <button
                  onClick={toggleCraneFilterQuick}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${isCraneFilterActiveQuick ? 'bg-sky-100 text-blue-600 line-through' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  CRANE & TOWER
                </button>
              </div>

              <input
                type="text"
                placeholder="Search NOTAMs..."
                value={searchTermQuick}
                onChange={handleSearchChangeQuick}
                className="mt-2 p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            {renderNotamCardQuick()}
          </div>
        )}



      </div>
    </div>
  );
}