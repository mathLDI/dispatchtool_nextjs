'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext';
import QuickAirportWeatherDisplay from './QuickAirportWeatherDisplay';

import {
  formatLocalDate,
  parseNotamDate,
  categorizeNotams,
  renderNotamsW,
  renderNotamsE,
  allAirportsFlightCategory,
  countFilteredNotams,
  filterAndHighlightNotams,
  extractTextBeforeFR,
} from './QuickWeatherAndNotam';




export default function ClientComponent({ fetchQuickWeather, fetchGFA }) {
  const {
    selectedAirport,
    setSelectedAirport,
    selectedNotamTypeQuick,
    setSelectedNotamTypeQuick,
    searchTermQuick,
    setSearchTermQuick,
    gfaTypeQuick,
    setGfaTypeQuick,
    gfaDataQuick,
    setGfaDataQuick,
    selectedTimestamp,
    setSelectedTimestamp,
    isCraneFilterActiveQuick,
    setIsCraneFilterActiveQuick,
    selectedForm,
    setSelectedForm,
    flightDetails = {},
    quickWeatherData,
    setQuickWeatherData,


  } = useRccContext();




  const handleFormChange = (newForm) => {
    setSelectedForm(newForm);               // Update the selectedForm state
  };

  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);

  //console.log('quickWeatherData from quicksearch:', quickWeatherData);


  //////NEW CODE FOR QUICK SEARCH BELOW////////////////////////


  // Local state to store weather data if context doesn't provide it

  const [quickAirportInput, setQuickAirportInput] = useState('');

  const handleQuickAirportInputChange = (e) => {
    const uppercaseValue = e.target.value.toUpperCase();  // Convert to uppercase
    setQuickAirportInput(uppercaseValue);  // Set the uppercase value in the state
  };


  const handleQuickAirportInputSubmit = async (e) => {
    e.preventDefault();

    const quickAirportCode = quickAirportInput.toUpperCase();  // Capitalize the input

    // Ensure the input is not empty
    if (!quickAirportCode) {
      return;
    }

    try {
      // Log the input before making the request

      // Fetch weather data for the input ICAO code
      const data = await fetchQuickWeather(quickAirportCode);

      // Use the local or context state to store the fetched weather data
      if (setQuickWeatherData) {
        setQuickWeatherData(data); // If setQuickWeatherData is available in the context, use it
      } else {
        setQuickWeatherData(data); // Otherwise, use the local state
      }

      setSelectedAirport({ code: quickAirportCode });

    } catch (error) {
      // Log any errors
      console.error(`Failed to fetch weather data for ${quickAirportCode}:`, error);
    }
  };


  /////////////////////////////////////////////////////





  ////notam code below//////////////////////////////

  const toggleCraneFilterQuick = () => {
    setIsCraneFilterActiveQuick((prevState) => !prevState);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setLeftWidth(Math.min(Math.max(newLeftWidth, 20), 80));
  }, [isResizing, containerRef]);

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove]);

  useEffect(() => {
    if (selectedAirport && gfaTypeQuick) {
      fetchGFA(selectedAirport.code, gfaTypeQuick).then((data) => {
        setGfaDataQuick(data);
      });
    }
  }, [selectedAirport, gfaTypeQuick, fetchGFA, setGfaDataQuick]);

  useEffect(() => {
    if (quickWeatherData) {
    }
  }, [quickWeatherData]);


  /////categorizedNotams is working fine/////////////////////

  const categorizedNotams = quickWeatherData
    ? categorizeNotams(quickWeatherData.data.filter((item) => item.type === 'notam'))
    : {};

  console.log("categorizedNotams from quick:", categorizedNotams);

  const handleNotamTypeChangeQuick = (newNotamType) => {
    setSelectedNotamTypeQuick(newNotamType);
  };

  const handleSearchChangeQuick = (event) => {
    setSearchTermQuick(event.target.value || '');
  };

  const renderNotamCardQuick = () => {
    switch (selectedNotamTypeQuick) {
      case 'AERODROME':
        return (
          <Card title="NOTAM AERODROME" status={null} className="h-full">
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams.futureNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'FUTURE'
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams.todayNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'TODAY'
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams.last7DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'LAST 7 DAYS'
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams.last30DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'LAST 30 DAYS'
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams.olderNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'OLDER'
            )}
          </Card>
        );
      case 'ENROUTE':
        return (
          <Card title="NOTAM ENROUTE" status={null} className="h-full">
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams.futureNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'FUTURE'
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams.todayNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'TODAY'
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams.last7DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'LAST 7 DAYS'
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams.last30DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'LAST 30 DAYS'
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams.olderNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'OLDER'
            )}
          </Card>
        );
      case 'WARNING':
        return (
          <Card title="NOTAM WARNING" status={null} className="h-full">
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams.futureNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'FUTURE'
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams.todayNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'TODAY'
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams.last7DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'LAST 7 DAYS'
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams.last30DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'LAST 30 DAYS'
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams.olderNotams || [], searchTermQuick, isCraneFilterActiveQuick),
              'OLDER'
            )}
          </Card>
        );
      default:
        return null;
    }
  };

  // Function for NOTAMs with Q-Line that have an "A"
  const renderNotamsAandAE = (notams, title) => {
    const notamsToRender = notams.filter((notam) => {
      const notamText = JSON.parse(notam.text);
      const displayText = extractTextBeforeFR(notamText.raw);

      const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
      return qLineMatch && qLineMatch[2].startsWith('A');
    });

    return (
      <div>
        <h2 className=" font-bold bg-gray-100 p-2 rounded">{title}</h2>
        {notamsToRender.length === 0 ? (
          <p>No Applicable NOTAMs</p>
        ) : (
          notamsToRender.map((notam, index) => {
            const notamText = JSON.parse(notam.text);
            const displayText = extractTextBeforeFR(notam.highlightedText || notamText.raw);
            const localTime = formatLocalDate(notam.startDate);

            // Parse the expiration date using the C) field
            const expirationMatch = notam.text.match(/C\)\s*(\d{10})/);
            const expirationDate = expirationMatch ? parseNotamDate(expirationMatch[1]) : null;
            const localExpirationDate = expirationDate
              ? new Date(expirationDate.getTime() - expirationDate.getTimezoneOffset() * 60000)
              : null;

            const lines = displayText.split('\n');
            let inBold = false;
            const processedLines = lines.map((line) => {
              if (line.includes('E)')) inBold = true;
              if (line.includes('F)')) inBold = false;
              return inBold ? `<strong>${line}</strong>` : line;
            });

            return (
              <div key={index} className="mb-4">

              </div>
            );
          })
        )}
      </div>
    );
  };


  ////////////////////////////////////////notam test below//////////////////////////
  const renderNotamCardQuickTest = () => {
    if (!categorizedNotams || Object.keys(categorizedNotams).length === 0) {
      return <p>No categorized NOTAMs available.</p>;
    }

    // Helper function to render each category of NOTAMs
    const renderNotams = (notams, title) => (
      <div>
        <h2 className="font-bold bg-gray-100 p-2 rounded">{title}</h2>
        {notams.length === 0 ? (
          <p>No NOTAMs found in this category.</p>
        ) : (
          notams.map((notam, index) => {
            const notamText = JSON.parse(notam.text).raw;
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
          })
        )}
      </div>
    );

    // Rendering categorized NOTAMs
    return (
      <div>
        {renderNotams(categorizedNotams.futureNotams, 'Future NOTAMs')}
        {renderNotams(categorizedNotams.todayNotams, 'Today\'s NOTAMs')}
        {renderNotams(categorizedNotams.last7DaysNotams, 'Last 7 Days NOTAMs')}
        {renderNotams(categorizedNotams.last30DaysNotams, 'Last 30 Days NOTAMs')}
        {renderNotams(categorizedNotams.olderNotams, 'Older NOTAMs')}
      </div>
    );
  };


  /////////////////////notam test ab



  console.log('selectedNotamTypeQuick from quick:', selectedNotamTypeQuick);


  return (
    <div className="flex flex-col" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', lineHeight: '1.25' }}>


      <div className="flex-1 " ref={containerRef}>

        <div className="flex ">
          {/* Quick Airport Input Box */}
          <form onSubmit={handleQuickAirportInputSubmit} className="flex justify-center items-center space-x-2">
            <input
              type="text"
              value={quickAirportInput}  // Ensure this is bound to the state
              onChange={handleQuickAirportInputChange}  // Handle the input change
              placeholder="Enter ICAO code"
              className="p-2 border border-gray-300 rounded-md"
              style={{ textTransform: 'uppercase' }}  // Optional: visually enforce uppercase in the UI
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Submit</button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleQuickAirportInputSubmit}  // Calls the same function as submitting the form
              className="bg-gray-500 text-white p-2 rounded-md"
            >
              Refresh
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => {
                setQuickAirportInput('');  // Clear the input field
                setQuickWeatherData(null); // Clear the weather data
              }}
              className="bg-orange-400 text-white p-2 rounded-md"
            >
              Reset
            </button>


          </form>





        </div>



        <div className='flex'>
          <div className=''>
            <QuickAirportWeatherDisplay
              quickWeatherData={quickWeatherData}
              gfaDataQuick={gfaDataQuick}
              gfaTypeQuick={gfaTypeQuick}
              setGfaTypeQuick={setGfaTypeQuick}
              selectedTimestamp={selectedTimestamp}
              setSelectedTimestamp={setSelectedTimestamp}
              leftWidth={leftWidth}
              setIsResizing={setIsResizing}
              handleNotamTypeChangeQuick={handleNotamTypeChangeQuick}  // Correct
              countFilteredNotams={countFilteredNotams}
              searchTermQuick={searchTermQuick}
              handleSearchChangeQuick={handleSearchChangeQuick}
              categorizedNotams={categorizedNotams}
              isCraneFilterActiveQuick={isCraneFilterActiveQuick}
              toggleCraneFilterQuick={toggleCraneFilterQuick}
              selectedNotamTypeQuick={selectedNotamTypeQuick}
              renderNotamCardQuick={renderNotamCardQuick}
              selectedForm={selectedForm}
              flightDetails={flightDetails}
              selectedAirport={selectedAirport}

            />
          </div>
        </div>




      </div>
    </div>

  );
}
