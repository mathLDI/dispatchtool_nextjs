'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext';
import AirportSearchForm from './AirportSearchForm';
import SideNav from '@/app/ui/dashboard/sidenav';
import AirportWeatherDisplay from '../../lib/component/AirportWeatherDisplay';
import TafDisplay from '../../lib/component/TafDisplay';
import ConfirmModal from '../../lib/component/ConfirmModal';
import AirportList from '../../lib/component/AirportList';
import NewChoiceListbox from '../../lib/component/NewChoiceListbox'; // Updated import

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
} from '../../lib/component/functions/weatherAndNotam';

const RoutingWXXForm = ({ onSave }) => {
  const { flightDetails, setFlightDetails } = useRccContext();
  const [warnings, setWarnings] = useState({
    departure: '',
    destination: '',
    alternate1: '',
    alternate2: '',
  });

  const handleChange = (e, field) => {
    const value = e.target.value.toUpperCase();
    setWarnings({
      ...warnings,
      [field]: value.length > 4 ? 'Airport code must be exactly 4 letters' : '',
    });
    setFlightDetails({ ...flightDetails, [field]: value });
  };

  const handleSave = () => {
    if (flightDetails.flightNumber && flightDetails.departure && flightDetails.destination) {
      onSave(flightDetails);
    } else {
      setWarnings({
        flightNumber: !flightDetails.flightNumber ? 'Flight number is required' : '',
        departure: !flightDetails.departure ? 'Departure is required' : '',
        destination: !flightDetails.destination ? 'Destination is required' : '',
      });
    }
  };

  const handleClear = () => {
    setFlightDetails({
      flightNumber: '',
      departure: '',
      destination: '',
      alternate1: '',
      alternate2: '',
    });
  };

  return (
    <div className="flex items-center space-x-4 mt-4 flex-wrap">
      <div>
        <input
          type="text"
          placeholder="FLIGHT #"
          value={flightDetails.flightNumber || ''}
          onChange={(e) => setFlightDetails({ ...flightDetails, flightNumber: e.target.value })}
          className="p-2 border border-gray-300 rounded-md text-center"
          style={{ width: '100px' }}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="DEPARTURE"
          value={flightDetails.departure || ''}
          onChange={(e) => handleChange(e, 'departure')}
          className="p-2 border border-gray-300 rounded-md text-center"
          style={{ width: '125px' }}
        />
        {warnings.departure && <span className="text-red-500">{warnings.departure}</span>}
      </div>

      <div>
        <input
          type="text"
          placeholder="DESTINATION"
          value={flightDetails.destination || ''}
          onChange={(e) => handleChange(e, 'destination')}
          className="p-2 border border-gray-300 rounded-md text-center"
          style={{ width: '125px' }}
        />
        {warnings.destination && <span className="text-red-500">{warnings.destination}</span>}
      </div>

      <div>
        <input
          type="text"
          placeholder="ALTERNATE 1"
          value={flightDetails.alternate1 || ''}
          onChange={(e) => handleChange(e, 'alternate1')}
          className="p-2 border border-gray-300 rounded-md text-center"
          style={{ width: '125px' }}
        />
        {warnings.alternate1 && <span className="text-red-500">{warnings.alternate1}</span>}
      </div>

      <div>
        <input
          type="text"
          placeholder="ALTERNATE 2"
          value={flightDetails.alternate2 || ''}
          onChange={(e) => handleChange(e, 'alternate2')}
          className="p-2 border border-gray-300 rounded-md text-center"
          style={{ width: '125px' }}
        />
        {warnings.alternate2 && <span className="text-red-500">{warnings.alternate2}</span>}
      </div>

      <div className="flex items-center space-x-2 p-2">
        <button
          onClick={handleSave}
          className="p-2 bg-red-500 text-white rounded-md"
        >
          Save
        </button>
        <button
          onClick={handleClear}
          className="p-2 bg-gray-500 text-white rounded-md"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default function ClientComponent({ fetchWeather, fetchGFA }) {
  const {
    weatherData,
    selectedAirport,
    setSelectedAirport,
    setWeatherData,
    selectedNotamType,
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
    flightDetails,
    setFlightDetails,
    savedRoutings,
    setSavedRoutings,
    selectedForm,
    setSelectedForm,
  } = useRccContext();

  const handleFormChange = (newForm) => {
    setSelectedForm(newForm);               // Update the selectedForm state
  };

  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef(null);
  const resizerRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const allWeatherDataRef = useRef(allWeatherData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingRouting, setPendingRouting] = useState(null);

  const handleDeleteRouting = (index) => {
    const updatedRoutings = savedRoutings.filter((_, i) => i !== index);
    setSavedRoutings(updatedRoutings);

    // Check for window object and update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedRoutings', JSON.stringify(updatedRoutings));
    }

    setFlightDetails({
      flightNumber: '',
      departure: '',
      destination: '',
      alternate1: '',
      alternate2: '',
    });
  };

  const handleAirportClick = useCallback(async (airportCode) => {
    try {
      const data = await fetchWeather(airportCode);
      setWeatherData(data);
      setSelectedAirport({ code: airportCode });
    } catch (error) {
      console.error(`Failed to fetch weather data for ${airportCode}:`, error);
    }
  }, [fetchWeather, setWeatherData, setSelectedAirport]);

  const updateLocalStorage = useCallback((key, data) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, []);

  const fetchAndUpdateWeatherData = useCallback(async (airportCode) => {
    try {
      const data = await fetchWeather(airportCode);
      let existingData = {};

      if (typeof window !== 'undefined') {
        existingData = JSON.parse(localStorage.getItem('weatherData')) || {};
      }

      // Only update if the data is new or different
      if (!existingData[airportCode] || JSON.stringify(existingData[airportCode]) !== JSON.stringify(data)) {
        existingData[airportCode] = data;
        updateLocalStorage('weatherData', existingData);
        setWeatherData(data);
      }
    } catch (error) {
      console.error(`Failed to fetch weather data for ${airportCode}:`, error);
    }
  }, [fetchWeather, setWeatherData, updateLocalStorage]);

  useEffect(() => {
    const fetchAllWeatherData = async () => {
      const airports = savedRoutings.flatMap((routing) => [
        routing.departure,
        routing.destination,
        routing.alternate1,
        routing.alternate2,
      ]).filter(Boolean);

      for (const airportCode of airports) {
        await fetchAndUpdateWeatherData(airportCode);
      }
    };

    // Initial data fetch
    fetchAllWeatherData();

    // Set up the timer to refresh data every 2 minutes
    const intervalId = setInterval(fetchAllWeatherData, 120000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [savedRoutings, fetchAndUpdateWeatherData]);

  const airportsToShow = selectedForm === 'Routing Search'
    ? [
      flightDetails.departure && { code: flightDetails.departure },
      flightDetails.destination && { code: flightDetails.destination },
      flightDetails.alternate1 && { code: flightDetails.alternate1 },
      flightDetails.alternate2 && { code: flightDetails.alternate2 },
    ].filter(Boolean)
    : airportValues;

  useEffect(() => {
    if (selectedForm === 'Airport Search' && airportValues.length > 0) {
      handleAirportClick(airportValues[0].code);
    } else if (selectedForm === 'Routing Search' && flightDetails.departure) {
      handleAirportClick(flightDetails.departure);
    }
  }, [selectedForm, flightDetails.departure, airportValues, handleAirportClick]);

  // Fetch weather data based on the selected form
  useEffect(() => {
    const fetchWeatherDataForRouting = async () => {
      const data = { ...allWeatherDataRef.current };
      const airports = savedRoutings.flatMap((routing) => [
        { code: routing.departure },
        { code: routing.destination },
        routing.alternate1 && { code: routing.alternate1 },
        routing.alternate2 && { code: routing.alternate2 },
      ]).filter(Boolean);

      for (const airport of airports) {
        if (!data[airport.code]) {
          try {
            const responseData = await fetchWeather(airport.code);
            data[airport.code] = responseData;
          } catch (error) {
            console.error(`Failed to fetch weather data for ${airport.code}:`, error);
          }
        }
      }

      setAllWeatherData(data);
      allWeatherDataRef.current = data;
    };

    const fetchWeatherDataForSearch = async () => {
      const data = {};
      const airports = selectedForm === 'Routing Search' && flightDetails.departure
        ? [
          { code: flightDetails.departure },
          flightDetails.destination && { code: flightDetails.destination },
          flightDetails.alternate1 && { code: flightDetails.alternate1 },
          flightDetails.alternate2 && { code: flightDetails.alternate2 },
        ].filter(Boolean)
        : airportValues;

      for (const airport of airports) {
        const storageKey = `weatherData_${airport.code}`;
        let cachedData = {};
        let cacheTimestamp = '';

        // Client-side check for localStorage
        if (typeof window !== 'undefined') {
          const storedData = localStorage.getItem(storageKey);

          if (storedData) { // Check if storedData is not null or undefined
            try {
              cachedData = JSON.parse(storedData);
            } catch (e) {
              console.error("Error parsing JSON data from localStorage", e);
              cachedData = {}; // Set default value if parsing fails
            }
          }

          cacheTimestamp = localStorage.getItem(`${storageKey}_timestamp`);
        }


        // Check if cache exists and is recent
        if (cachedData && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp, 10);

          // If data is less than 2 minutes old, use cached data
          if (cacheAge < 2 * 60 * 1000) {
            console.log(`Using cached data for ${airport.code}`);
            data[airport.code] = cachedData;
            continue;
          }
        }

        // Fetch fresh data from the server
        try {
          const responseData = await fetchWeather(airport.code);
          data[airport.code] = responseData;

          // Update localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(responseData));
            localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());
          }
        } catch (error) {
          console.error(`Failed to fetch weather data for ${airport.code}:`, error);
        }
      }
      setAllWeatherData(data);
    };

    if (selectedForm === 'Routing Search' && savedRoutings.length > 0) {
      fetchWeatherDataForRouting();
    } else if (selectedForm === 'Airport Search' && airportValues.length > 0) {
      fetchWeatherDataForSearch();
    }
  }, [fetchWeather, airportValues, flightDetails, savedRoutings, selectedForm, setAllWeatherData]);

  useEffect(() => {
    if (Object.keys(allWeatherData).length > 0) {
      const airportsFromSavedRoutings = savedRoutings.flatMap((routing) => [
        { code: routing.departure },
        { code: routing.destination },
        routing.alternate1 && { code: routing.alternate1 },
        routing.alternate2 && { code: routing.alternate2 },
      ]).filter(Boolean);

      const airportsToInclude = [...airportValues, ...airportsFromSavedRoutings];

      const uniqueAirportsToInclude = Array.from(
        new Set(airportsToInclude.map((airport) => airport.code))
      ).map((code) => ({ code }));

      const categories = allAirportsFlightCategory(uniqueAirportsToInclude, allWeatherData);
      setAirportCategories(categories);
    }
  }, [allWeatherData, airportValues, savedRoutings, setAirportCategories]);

  const handleSaveRouting = (newRouting) => {
    const existingRoutingIndex = savedRoutings.findIndex(
      (routing) =>
        routing.flightNumber === newRouting.flightNumber &&
        routing.departure === newRouting.departure &&
        routing.destination === newRouting.destination
    );

    if (existingRoutingIndex !== -1) {
      setPendingRouting(newRouting);
      setIsModalOpen(true);
    } else {
      const updatedRoutings = [...savedRoutings, newRouting];
      setSavedRoutings(updatedRoutings);

      // Client-side check before updating localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('savedRoutings', JSON.stringify(updatedRoutings));
      }
    }
  };

  const handleConfirm = () => {
    if (pendingRouting) {
      const updatedRoutings = [...savedRoutings, pendingRouting];
      setSavedRoutings(updatedRoutings);

      // Client-side check before updating localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('savedRoutings', JSON.stringify(updatedRoutings));
      }
      setPendingRouting(null);
    }
    setIsModalOpen(false);
  };

  const handleModify = () => {
    if (pendingRouting) {
      const updatedRoutings = savedRoutings.map((routing) =>
        routing.flightNumber === pendingRouting.flightNumber &&
          routing.departure === pendingRouting.departure &&
          routing.destination === pendingRouting.destination
          ? pendingRouting
          : routing
      );
      setSavedRoutings(updatedRoutings);

      // Client-side check before updating localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('savedRoutings', JSON.stringify(updatedRoutings));
      }
      setPendingRouting(null);
    }
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setPendingRouting(null);
  };

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
    if (weatherData) {
    }
  }, [weatherData]);

  const categorizedNotams = weatherData
    ? categorizeNotams(weatherData.data.filter((item) => item.type === 'notam'))
    : {};

  const handleNotamTypeChange = (newNotamType) => {
    setSelectedNotamType(newNotamType);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value || '');
  };

  const renderNotamCard = () => {
    switch (selectedNotamType) {
      case 'AERODROME':
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
      case 'ENROUTE':
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
      case 'WARNING':
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
        <h2 className="text-lg font-bold bg-gray-100 p-2 rounded">{title}</h2>
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
                {processedLines.map((line, lineIndex) => (
                  <p key={lineIndex} className="mb-1" dangerouslySetInnerHTML={{ __html: line }}></p>
                ))}
                <p className="text-blue-800">Effective (UTC): {notam.startDate.toUTCString()}</p>
                <p className="text-blue-800">Effective (Local): {localTime}</p>
                {expirationDate && (
                  <>
                    <p className="text-blue-800">Expires (UTC): {expirationDate.toUTCString()}</p>
                    <p className="text-blue-800">Expires (Local): {formatLocalDate(localExpirationDate)}</p>
                  </>
                )}
                {/* Divider below each NOTAM entry except the last one */}
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
    <div className="flex min-h-screen">

      <div className='flex'>
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          onModify={handleModify}
        />
        <div className="flex  h-screen overflow-y-auto p-2 ">
          {selectedForm === 'Routing Search' && (
            <div className="flex justify-center items-center h-full w-full">
              <SideNav
                savedRoutings={savedRoutings}
                onDeleteRouting={handleDeleteRouting}
                showWeatherAndRcam={false}
                showLogo={false}
                showPrinterIcon={false}
                airportCategories={airportCategories}
              />
            </div>
          )}
        </div>
      </div>



      <div className="flex-1 flex-wrap flex-col h-screen " ref={containerRef}>

        <div className="flex-1  ">

          <div className='flex'>
            <NewChoiceListbox
              choices={['Airport Search', 'Routing Search']}
              callback={handleFormChange}
            />
          </div>


          <div className='pb-4'>
            {selectedForm === 'Routing Search' && <RoutingWXXForm onSave={handleSaveRouting} />}
          </div>

          {/* below is the AirportSearchForm when AirportSearch is selected.  AirportSearchForm has the component AirportList  */}
          {/* this mean AirportList and AirportSearch come together, be carefull when styling!*/}
          <div class="flex flex-grow  ">
            {selectedForm === 'Airport Search' && <AirportSearchForm fetchWeather={fetchWeather} />}

          </div>


          {/* below is the AirportList when Routing Search is selected */}
          <div className='flex   '>
            {selectedForm === 'Routing Search' && (
              <AirportList
                airportsToShow={airportsToShow}
                onAirportClick={handleAirportClick}  // Pass handleAirportClick to AirportList
              />
            )}
          </div>

        </div>

        <div className=''>
          <div className='flex-1 overflow-y-auto '>
            <AirportWeatherDisplay
              weatherData={weatherData}
              gfaData={gfaData}
              gfaType={gfaType}
              setGfaType={setGfaType}
              selectedTimestamp={selectedTimestamp}
              setSelectedTimestamp={setSelectedTimestamp}
              leftWidth={leftWidth}
              resizerRef={resizerRef}
              isResizing={isResizing}
              setIsResizing={setIsResizing}
              handleNotamTypeChange={setSelectedNotamType}
              countFilteredNotams={countFilteredNotams}
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
              categorizedNotams={categorizedNotams}
              isCraneFilterActive={isCraneFilterActive}
              toggleCraneFilter={toggleCraneFilter}
              selectedNotamType={selectedNotamType}
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
