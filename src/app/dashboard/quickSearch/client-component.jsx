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
  countFilteredNotams,
  filterAndHighlightNotams,
  extractTextBeforeFR,
} from '../../lib/component/functions/weatherAndNotam';




export default function ClientComponent({ fetchQuickWeather, fetchGFA }) {
  const {
    selectedAirport,
    setSelectedAirport,
    selectedNotamTypeQuick,
    setSelectedNotamType,
    searchTerm,
    setSearchTerm,
    gfaType,
    setGfaType,
    gfaData,
    setGfaData,
    selectedTimestamp,
    setSelectedTimestamp,
    airportValues,
    allWeatherData,
    setAllWeatherData,
    airportCategories,
    setAirportCategories,
    isCraneFilterActive,
    setIsCraneFilterActive,
    selectedForm,
    setSelectedForm,
    searchRouting,
    setSearchRouting,
    savedRoutings = [],
    setSavedRoutings,
    flightDetails = {},
    setFlightDetails,
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

  const toggleCraneFilter = () => {
    setIsCraneFilterActive((prevState) => !prevState);
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
    if (selectedAirport && gfaType) {
      fetchGFA(selectedAirport.code, gfaType).then((data) => {
        setGfaData(data);
      });
    }
  }, [selectedAirport, gfaType, fetchGFA, setGfaData]);

  useEffect(() => {
    if (quickWeatherData) {
    }
  }, [quickWeatherData]);

  const categorizedNotams = quickWeatherData
    ? categorizeNotams(quickWeatherData.data.filter((item) => item.type === 'notam'))
    : {};

  const handleNotamTypeChange = (newNotamType) => {
    setSelectedNotamType(newNotamType);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value || '');
  };

  const renderNotamCard = () => {
    switch (selectedNotamTypeQuick) {
      case 'AERODROME QUICK':
        return (
          <Card title="NOTAM AERODROME" status={null} className="h-full">
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams.futureNotams || [], searchTerm, isCraneFilterActive),
              'FUTURE'
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams.todayNotams || [], searchTerm, isCraneFilterActive),
              'TODAY'
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams.last7DaysNotams || [], searchTerm, isCraneFilterActive),
              'LAST 7 DAYS'
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams.last30DaysNotams || [], searchTerm, isCraneFilterActive),
              'LAST 30 DAYS'
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams.olderNotams || [], searchTerm, isCraneFilterActive),
              'OLDER'
            )}
          </Card>
        );
      case 'ENROUTE QUICK':
        return (
          <Card title="NOTAM ENROUTE" status={null} className="h-full">
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams.futureNotams || [], searchTerm, isCraneFilterActive),
              'FUTURE'
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams.todayNotams || [], searchTerm, isCraneFilterActive),
              'TODAY'
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams.last7DaysNotams || [], searchTerm, isCraneFilterActive),
              'LAST 7 DAYS'
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams.last30DaysNotams || [], searchTerm, isCraneFilterActive),
              'LAST 30 DAYS'
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams.olderNotams || [], searchTerm, isCraneFilterActive),
              'OLDER'
            )}
          </Card>
        );
      case 'WARNING QUICK':
        return (
          <Card title="NOTAM WARNING" status={null} className="h-full">
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams.futureNotams || [], searchTerm, isCraneFilterActive),
              'FUTURE'
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams.todayNotams || [], searchTerm, isCraneFilterActive),
              'TODAY'
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams.last7DaysNotams || [], searchTerm, isCraneFilterActive),
              'LAST 7 DAYS'
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams.last30DaysNotams || [], searchTerm, isCraneFilterActive),
              'LAST 30 DAYS'
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams.olderNotams || [], searchTerm, isCraneFilterActive),
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



  return (
    <div className="flex min-h-screen">


      <div className="flex-1 flex-wrap flex-col h-screen " ref={containerRef}>
        <div className="flex-1  ">
          {/* Quick Airport Input Box */}
          <form onSubmit={handleQuickAirportInputSubmit}>
            <input
              type="text"
              value={quickAirportInput}  // Ensure this is bound to the state
              onChange={handleQuickAirportInputChange}  // Handle the input change
              placeholder="Enter ICAO airport code"
              className="p-2 border border-gray-300 rounded-md mb-4"
              style={{ textTransform: 'uppercase' }}  // Optional: visually enforce uppercase in the UI
            />

            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Submit</button>
          </form>
        </div>



        <div className=''>
          <div className=''>
            <QuickAirportWeatherDisplay
              quickWeatherData={quickWeatherData} // Pass quick search weather data
              gfaData={gfaData}
              gfaType={gfaType}
              setGfaType={setGfaType}
              selectedTimestamp={selectedTimestamp}
              setSelectedTimestamp={setSelectedTimestamp}
              leftWidth={leftWidth}
              setIsResizing={setIsResizing}
              handleNotamTypeChange={setSelectedNotamType}
              countFilteredNotams={countFilteredNotams}
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
              categorizedNotams={categorizedNotams}
              isCraneFilterActive={isCraneFilterActive}
              toggleCraneFilter={toggleCraneFilter}
              selectedNotamTypeQuick={selectedNotamTypeQuick}
              renderNotamCard={renderNotamCard}
              selectedForm={selectedForm}
              flightDetails={flightDetails}
              allWeatherData={allWeatherData}
              selectedAirport={selectedAirport}
            />
          </div>
        </div>

  



      </div>
    </div>

  );
}
