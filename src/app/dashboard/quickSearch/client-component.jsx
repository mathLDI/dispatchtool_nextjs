'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext';
import QuickAirportWeatherDisplay from './QuickAirportWeatherDisplay';

import {
  formatLocalDate,
  parseNotamDate,
  categorizeNotams,
  allAirportsFlightCategory,
  countFilteredNotams,
  filterAndHighlightNotams,
  extractTextBeforeFR,
  highlightNotamTermsJSX,
} from './QuickWeatherAndNotam';

// Auto-refresh configuration
const AUTO_REFRESH_INTERVAL = 60 * 1000; // 1 minute (catch SPECI METARs faster)
const DEBOUNCE_DELAY = 300; // Debounce rapid searches

export default function ClientComponent({ fetchQuickWeather }) {
  const {

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
    setSelectedAirport,


  } = useRccContext();


  const handleFormChange = (newForm) => {
    setSelectedForm(newForm);               // Update the selectedForm state
  };

  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);



  // Local state to store weather data if context doesn't provide it
  const [quickAirportInput, setQuickAirportInput] = useState('');
  const inputRef = useRef(null); // Create a ref for the input element
  const autoRefreshTimeoutRef = useRef(null); // Track auto-refresh timer
  const debounceTimeoutRef = useRef(null); // Track debounce timer
  const currentAirportRef = useRef(null); // Track which airport is currently being polled


  // Automatically focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Cleanup auto-refresh and debounce on unmount
    return () => {
      if (autoRefreshTimeoutRef.current) {
        clearInterval(autoRefreshTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      console.log('[Auto-Refresh] Cleanup on unmount');
    };
  }, []);

  const handleQuickAirportInputChange = (e) => {
    const uppercaseValue = e.target.value.toUpperCase().slice(0, 4); // Limit to 4 chars
    setQuickAirportInput(uppercaseValue);
    
    // Auto-fetch when 4 characters are entered
    if (uppercaseValue.length === 4) {
      // Debounce to prevent rapid fetches
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(async () => {
        await fetchWeatherWithAutoRefresh(uppercaseValue);
      }, DEBOUNCE_DELAY);
    }
  };

  /**
   * Fetch weather with auto-refresh enabled
   * Uses weatherService.ts with:
   * - Intelligent 2-minute caching
   * - Request deduplication
   * - Automatic background polling every 3 minutes
   */
  const fetchWeatherWithAutoRefresh = useCallback(async (airportCode) => {
    if (!airportCode) return;

    try {
      // Clean up previous auto-refresh if different airport
      if (currentAirportRef.current !== airportCode && autoRefreshTimeoutRef.current) {
        clearInterval(autoRefreshTimeoutRef.current);
        autoRefreshTimeoutRef.current = null;
      }

      currentAirportRef.current = airportCode;

      // Fetch initial data using server action (weatherService.ts handles caching & deduplication)
      const data = await fetchQuickWeather(airportCode);

      if (setQuickWeatherData) {
        setQuickWeatherData(data);
      }

      setSelectedAirport({ code: airportCode });

      // Set up auto-refresh polling
      if (!autoRefreshTimeoutRef.current) {
        console.log(`[Auto-Refresh] Starting for ${airportCode} every ${AUTO_REFRESH_INTERVAL}ms`);
        autoRefreshTimeoutRef.current = setInterval(async () => {
          try {
            // Silently fetch fresh data in background
            // weatherService.ts provides intelligent caching (2-min window)
            const freshData = await fetchQuickWeather(airportCode);
            setQuickWeatherData(freshData);
            console.log(`[Auto-Refresh] Updated weather for ${airportCode}`);
          } catch (error) {
            console.error(`[Auto-Refresh] Failed for ${airportCode}:`, error);
            // Continue polling even on error
          }
        }, AUTO_REFRESH_INTERVAL);
      }
    } catch (error) {
      console.error(`Failed to fetch weather data for ${airportCode}:`, error);
    }
  }, [fetchQuickWeather, setQuickWeatherData, setSelectedAirport]);

  const handleQuickAirportInputSubmit = async (e) => {
    e.preventDefault();

    // Use current airport from ref if input is empty, otherwise use input value
    const quickAirportCode = quickAirportInput.toUpperCase() || currentAirportRef.current;

    if (!quickAirportCode) {
      return;
    }

    // Debounce rapid submissions
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      await fetchWeatherWithAutoRefresh(quickAirportCode);
    }, DEBOUNCE_DELAY);
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


  {/*   useEffect(() => {
    if (selectedAirport && gfaTypeQuick) {
      fetchGFA(selectedAirport.code, gfaTypeQuick).then((data) => {
        setGfaDataQuick(data);
      });
    }
  }, [selectedAirport, gfaTypeQuick, fetchGFA, setGfaDataQuick]); */ }


  useEffect(() => {
    if (quickWeatherData) {
    }
  }, [quickWeatherData]);


  /////categorizedNotamsQuick is working fine/////////////////////

  const categorizedNotamsQuick = quickWeatherData
    ? categorizeNotams(quickWeatherData.data.filter((item) => item.type === 'notam'))
    : {};


  const handleNotamTypeChangeQuick = (newNotamType) => {
    setSelectedNotamTypeQuick(newNotamType);
  };

  const handleSearchChangeQuick = (event) => {
    const upperCaseSearchTermQuick = event.target.value.toUpperCase(); // Convert to uppercase
    setSearchTermQuick(upperCaseSearchTermQuick);
  };




  ////////////////////////////
  const renderNotamCardQuick = () => {
    switch (selectedNotamTypeQuick) {
      case 'AERODROME':
        return (
          <Card title="NOTAM AERODROME QUICK" status={null} className="h-full">
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotamsQuick.futureNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Future NOTAMs for AERODROME
              'FUTURE',
              searchTermQuick // Pass the search term for highlighting
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotamsQuick.todayNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Today NOTAMs for AERODROME
              'TODAY',
              searchTermQuick
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotamsQuick.last7DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Last 7 Days NOTAMs for AERODROME
              'LAST 7 DAYS',
              searchTermQuick
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotamsQuick.last30DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Last 30 Days NOTAMs for AERODROME
              'LAST 30 DAYS',
              searchTermQuick
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotamsQuick.olderNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Older NOTAMs for AERODROME
              'OLDER',
              searchTermQuick
            )}
          </Card>
        );
      case 'ENROUTE':
        return (
          <Card title="NOTAM ENROUTE QUICK" status={null} className="h-full">
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotamsQuick.futureNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Future NOTAMs for ENROUTE
              'FUTURE',
              searchTermQuick
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotamsQuick.todayNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Today NOTAMs for ENROUTE
              'TODAY',
              searchTermQuick
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotamsQuick.last7DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Last 7 Days NOTAMs for ENROUTE
              'LAST 7 DAYS',
              searchTermQuick
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotamsQuick.last30DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Last 30 Days NOTAMs for ENROUTE
              'LAST 30 DAYS',
              searchTermQuick
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotamsQuick.olderNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Older NOTAMs for ENROUTE
              'OLDER',
              searchTermQuick
            )}
          </Card>
        );
      case 'WARNING':
        return (
          <Card title="NOTAM WARNING QUICK" status={null} className="h-full">
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotamsQuick.futureNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Future NOTAMs for WARNING
              'FUTURE',
              searchTermQuick
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotamsQuick.todayNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Today NOTAMs for WARNING
              'TODAY',
              searchTermQuick
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotamsQuick.last7DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Last 7 Days NOTAMs for WARNING
              'LAST 7 DAYS',
              searchTermQuick
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotamsQuick.last30DaysNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Last 30 Days NOTAMs for WARNING
              'LAST 30 DAYS',
              searchTermQuick
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotamsQuick.olderNotams || [], searchTermQuick, isCraneFilterActiveQuick), // Older NOTAMs for WARNING
              'OLDER',
              searchTermQuick
            )}
          </Card>
        );
      default:
        return null;
    }
  };



  //////////////////////////////////////


  // Function for NOTAMs with Q-Line that have an "A"
  const renderNotamsAandAE = (notams, title, searchTerm) => {
    if (!Array.isArray(notams)) {
      console.error('Expected an array but received:', notams);
      return <p>No Applicable NOTAMs</p>; // Or handle the error appropriately
    }

    const notamsToRender = notams.filter((notam) => {
      const notamText = JSON.parse(notam.text);
      const displayText = extractTextBeforeFR(notamText.raw);

      const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
      return qLineMatch && qLineMatch[2].startsWith('A');
    });

    return (
      <div>
        <h2 className="font-bold bg-gray-100 dark:bg-gray-700 p-2 rounded mb-2">{title}</h2>
        {notamsToRender.length === 0 ? (
          <p>No Applicable NOTAMs</p>
        ) : (
          notamsToRender.map((notam, index) => {
            const notamText = JSON.parse(notam.text);
            const displayText = extractTextBeforeFR(notamText.raw);
            const localTime = formatLocalDate(notam.startDate);

            const expirationMatch = notam.text.match(/C\)\s*(\d{10})/);
            const expirationDate = expirationMatch ? parseNotamDate(expirationMatch[1]) : null;
            const localExpirationDate = expirationDate
              ? new Date(expirationDate.getTime() - expirationDate.getTimezoneOffset() * 60000)
              : null;

            const lines = displayText.split('\n');
            let inBold = false;

            return (
              <div key={index} className="mb-4">
                {lines.map((line, lineIndex) => {
                  if (line.includes('E)')) inBold = true;
                  if (line.includes('F)')) inBold = false;
                  return (
                    <p key={lineIndex} className="mb-1">
                      {inBold ? (
                        <strong>{highlightNotamTermsJSX(line, searchTerm)}</strong>
                      ) : (
                        highlightNotamTermsJSX(line, searchTerm)
                      )}
                    </p>
                  );
                })}
                <p className="text-blue-800 dark:text-blue-400">Effective (UTC): {notam.startDate.toUTCString()}</p>
                <p className="text-blue-800 dark:text-blue-400">Effective (Local): {localTime}</p>
                {expirationDate && (
                  <>
                    <p className="text-blue-800 dark:text-blue-400">Expires (UTC): {expirationDate.toUTCString()}</p>
                    <p className="text-blue-800 dark:text-blue-400">Expires (Local): {formatLocalDate(localExpirationDate)}</p>
                  </>
                )}
                {index !== notamsToRender.length - 1 && (
                  <hr className="my-2 border-gray-300" />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };


  const renderNotamsW = (notams, title, searchTerm) => {
    const notamsToRender = notams.filter((notam) => {
      const notamText = JSON.parse(notam.text);
      const displayText = extractTextBeforeFR(notamText.raw);

      const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
      return qLineMatch && qLineMatch[2].startsWith('W');
    });

    return (
      <div>
        <h2 className="font-bold bg-gray-100 dark:bg-gray-700 p-2 rounded mb-2">{title}</h2>
        {notamsToRender.length === 0 ? (
          <p>No Applicable NOTAMs</p>
        ) : (
          notamsToRender.map((notam, index) => {
            const notamText = JSON.parse(notam.text);
            const displayText = extractTextBeforeFR(notam.highlightedText || notamText.raw);
            const localTime = formatLocalDate(notam.startDate);

            const expirationMatch = notam.text.match(/C\)\s*(\d{10})/);
            const expirationDate = expirationMatch ? parseNotamDate(expirationMatch[1]) : null;
            const localExpirationDate = expirationDate
              ? new Date(expirationDate.getTime() - expirationDate.getTimezoneOffset() * 60000)
              : null;

            const lines = displayText.split('\n');
            let inBold = false;

            return (
              <div key={index} className="mb-4">
                {lines.map((line, lineIndex) => {
                  if (line.includes('E)')) inBold = true;
                  if (line.includes('F)')) inBold = false;
                  return (
                    <p key={lineIndex} className="mb-1">
                      {inBold ? (
                        <strong>{highlightNotamTermsJSX(line, searchTerm)}</strong>
                      ) : (
                        highlightNotamTermsJSX(line, searchTerm)
                      )}
                    </p>
                  );
                })}
                <p className="text-blue-800 dark:text-blue-400">Effective (UTC): {notam.startDate.toUTCString()}</p>
                <p className="text-blue-800 dark:text-blue-400">Effective (Local): {localTime}</p>
                {expirationDate && (
                  <>
                    <p className="text-blue-800 dark:text-blue-400">Expires (UTC): {expirationDate.toUTCString()}</p>
                    <p className="text-blue-800 dark:text-blue-400">Expires (Local): {formatLocalDate(localExpirationDate)}</p>
                  </>
                )}
                {index !== notamsToRender.length - 1 && (
                  <hr className="my-2 border-gray-300" />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };


  const renderNotamsE = (notams, title, searchTerm) => {
    const notamsToRender = notams.filter(notam => {
      const notamText = JSON.parse(notam.text);
      const displayText = extractTextBeforeFR(notamText.raw);

      const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
      return qLineMatch && qLineMatch[2].startsWith('E');
    });

    return (
      <div>
        <h2 className="font-bold bg-gray-100 dark:bg-gray-700 p-2 rounded mb-2">{title}</h2>
        {notamsToRender.length === 0 ? (
          <p>No Applicable NOTAMs</p>
        ) : (
          notamsToRender.map((notam, index) => {
            const notamText = JSON.parse(notam.text);
            const displayText = extractTextBeforeFR(notam.highlightedText || notamText.raw);
            const localTime = formatLocalDate(notam.startDate);

            const expirationMatch = notam.text.match(/C\)\s*(\d{10})/);
            const expirationDate = expirationMatch
              ? parseNotamDate(expirationMatch[1])
              : null;
            const localExpirationDate = expirationDate
              ? new Date(expirationDate.getTime() - expirationDate.getTimezoneOffset() * 60000)
              : null;

            const lines = displayText.split('\n');
            let inBold = false;

            return (
              <div key={index} className="mb-4">
                {lines.map((line, lineIndex) => {
                  if (line.includes('E)')) inBold = true;
                  if (line.includes('F)')) inBold = false;
                  return (
                    <p key={lineIndex} className="mb-1">
                      {inBold ? (
                        <strong>{highlightNotamTermsJSX(line, searchTerm)}</strong>
                      ) : (
                        highlightNotamTermsJSX(line, searchTerm)
                      )}
                    </p>
                  );
                })}
             <p className="text-blue-800 dark:text-blue-400">Effective (UTC): {notam.startDate.toUTCString()}</p>
                <p className="text-blue-800 dark:text-blue-400">Effective (Local): {localTime}</p>
                {expirationDate && (
                  <>
                    <p className="text-blue-800 dark:text-blue-400">Expires (UTC): {expirationDate.toUTCString()}</p>
                    <p className="text-blue-800 dark:text-blue-400">Expires (Local): {formatLocalDate(localExpirationDate)}</p>
                  </>
                )}
                {index !== notamsToRender.length - 1 && (
                  <hr className="my-2 border-gray-300" />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };


  return (
    <div className="flex flex-col text-black dark:text-white" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', lineHeight: '1.0' }}>


      <div className="flex-1 " ref={containerRef}>

        <div className="flex ">
          {/* Quick Airport Input Box */}
          <form onSubmit={(e) => e.preventDefault()} className="flex justify-center items-center space-x-2">
            <input
              ref={inputRef} // Attach the ref to the input element
              type="text"
              value={quickAirportInput} // Ensure this is bound to the state
              onChange={handleQuickAirportInputChange} // Handle the input change
              placeholder="Enter ICAO code"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500"
              style={{ textTransform: 'uppercase' }} // Optional: visually enforce uppercase in the UI
              maxLength={4} // Limit input to 4 characters
            />

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleQuickAirportInputSubmit}  // Calls the same function as submitting the form
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:scale-95"
            >
              Refresh
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => {
                setQuickAirportInput('');
                setQuickWeatherData(null);
                currentAirportRef.current = null;
                if (autoRefreshTimeoutRef.current) {
                  clearInterval(autoRefreshTimeoutRef.current);
                  autoRefreshTimeoutRef.current = null;
                }
                console.log('[Auto-Refresh] Stopped by user reset');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-lg font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:scale-95"
            >
              Reset
            </button>


          </form>





        </div>



        <div className='flex'>
          <div className="h-full w-full flex flex-col overflow-y-auto max-h-screen">
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
              categorizedNotamsQuick={categorizedNotamsQuick}
              isCraneFilterActiveQuick={isCraneFilterActiveQuick}
              toggleCraneFilterQuick={toggleCraneFilterQuick}
              selectedNotamTypeQuick={selectedNotamTypeQuick}
              renderNotamCardQuick={renderNotamCardQuick}
              selectedForm={selectedForm}
              flightDetails={flightDetails}


            />
          </div>
        </div>




      </div>
    </div>

  );
}
