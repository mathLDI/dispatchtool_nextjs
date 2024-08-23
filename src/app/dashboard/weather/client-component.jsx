'use client';

import React, { useEffect, useState, useRef } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext';
import AirportSearchForm from './AirportSearchForm';
import MetarDisplay from '../../lib/component/MetarDisplay';
import TafDisplay from '../../lib/component/TafDisplay';
import GfaDisplay from '../../lib/component/GfaDisplay';
import { ChoiceListbox } from '../../lib/component/ListBox';
import SideNav from '@/app/ui/dashboard/sidenav';
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/outline';

import {
  formatLocalDate,
  parseNotamDate,
  categorizeNotams,
  renderNotamsW,
  renderNotamsE,
  allAirportsFlightCategory,
  calculateAirportCategories,
} from '../../lib/component/functions/weatherAndNotam';

// Function for the Routing WXX form
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
    setWarnings({ ...warnings, [field]: value.length > 4 ? 'Airport code must be exactly 4 letters' : '' });
    setFlightDetails({ ...flightDetails, [field]: value });
  };

  const handleSave = () => {
    if (flightDetails.flightNumber && flightDetails.departure && flightDetails.destination) {
      onSave(flightDetails);
      // No need to reset flightDetails, so we comment out or remove the next line
      // setFlightDetails({ flightNumber: '', departure: '', destination: '', alternate1: '', alternate2: '' });
    } else {
      setWarnings({
        flightNumber: !flightDetails.flightNumber ? 'Flight number is required' : '',
        departure: !flightDetails.departure ? 'Departure is required' : '',
        destination: !flightDetails.destination ? 'Destination is required' : '',
      });
    }
  };

  const handleClear = () => {
    setFlightDetails({ flightNumber: '', departure: '', destination: '', alternate1: '', alternate2: '' });
  };

  return (
    <div className="flex space-x-4 mt-4 flex-wrap">
      <input
        type="text"
        placeholder="FLIGHT #"
        value={flightDetails.flightNumber || ''}
        onChange={(e) => setFlightDetails({ ...flightDetails, flightNumber: e.target.value })}
        className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
      />
      <div>
        <input
          type="text"
          placeholder="DEPARTURE"
          value={flightDetails.departure || ''}
          onChange={(e) => handleChange(e, 'departure')}
          className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
        />
        {warnings.departure && <span className="text-red-500">{warnings.departure}</span>}
      </div>
      <div>
        <input
          type="text"
          placeholder="DESTINATION"
          value={flightDetails.destination || ''}
          onChange={(e) => handleChange(e, 'destination')}
          className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
        />
        {warnings.destination && <span className="text-red-500">{warnings.destination}</span>}
      </div>
      <div>
        <input
          type="text"
          placeholder="ALTERNATE 1"
          value={flightDetails.alternate1 || ''}
          onChange={(e) => handleChange(e, 'alternate1')}
          className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
        />
        {warnings.alternate1 && <span className="text-red-500">{warnings.alternate1}</span>}
      </div>
      <div>
        <input
          type="text"
          placeholder="ALTERNATE 2"
          value={flightDetails.alternate2 || ''}
          onChange={(e) => handleChange(e, 'alternate2')}
          className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
        />
        {warnings.alternate2 && <span className="text-red-500">{warnings.alternate2}</span>}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="mt-2 p-2 bg-red-500 text-white rounded-md w-full md:w-auto"
        >
          Save
        </button>
        <button
          onClick={handleClear}
          className="mt-2 p-2 bg-gray-500 text-white rounded-md w-full md:w-auto"
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
  } = useRccContext();

  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef(null);
  const resizerRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedForm, setSelectedForm] = useState('airportSearchForm');

  useEffect(() => {
    const fetchWeatherData = async () => {
      const data = {};

      for (const airport of airportValues) {
        try {
          const responseData = await fetchWeather(airport.code);
          data[airport.code] = responseData;
        } catch (error) {
          console.error(`Failed to fetch weather data for ${airport.code}:`, error);
        }
      }
      console.log('Fetched weather data:', data);
      setAllWeatherData(data);
    };

    if (airportValues.length > 0) {
      fetchWeatherData();
    }
  }, [fetchWeather, airportValues]);

  useEffect(() => {
    if (Object.keys(allWeatherData).length > 0) {
      const categories = allAirportsFlightCategory(airportValues, allWeatherData);
      console.log('Calculated airport categories:', categories);
      setAirportCategories(categories);
    }
  }, [allWeatherData]);

  const handleSaveRouting = (newRouting) => {
    const updatedRoutings = [...savedRoutings, newRouting];
    setSavedRoutings(updatedRoutings);
    localStorage.setItem('savedRoutings', JSON.stringify(updatedRoutings));
  };

  const toggleCraneFilter = () => {
    setIsCraneFilterActive(!isCraneFilterActive);
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setLeftWidth(Math.min(Math.max(newLeftWidth, 20), 80));
  };

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
  }, [isResizing]);

  useEffect(() => {
    if (selectedAirport) {
      fetchWeather(selectedAirport.code).then((data) => {
        setWeatherData(data);
      });

      fetchGFA(selectedAirport.code, gfaType).then((data) => {
        setGfaData(data);
      });
    }
  }, [selectedAirport, gfaType, fetchWeather, fetchGFA, setWeatherData]);

  useEffect(() => {
    if (weatherData) {
      console.log('Updated Weather Data:', weatherData);
    }
  }, [weatherData]);

  const extractTextBeforeFR = (text) => {
    const frIndex = text.indexOf('FR:');
    return frIndex !== -1 ? text.substring(0, frIndex).trim() : text.trim();
  };

  const categorizedNotams = weatherData
    ? categorizeNotams(weatherData.data.filter((item) => item.type === 'notam'))
    : {};

  const handleNotamTypeChange = (newNotamType) => {
    setSelectedNotamType(newNotamType);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filterAndHighlightNotams = (notams) => {
    const ifrTerms = /\b(CLOSED|CLSD|OUT OF SERVICE|RWY|U\/S)\b/gi;
    const lifrTerms = /\b(AUTH|RSC|SERVICE)\b/gi;
    const mvfrTerms = /\b(TWY CLOSED)\b/gi;

    return notams
      .filter((notam) => {
        const notamText = JSON.parse(notam.text).raw;

        // Exclude NOTAMs with "CRANE" in the E) section if the filter is active
        if (isCraneFilterActive && /E\).*CRANE/.test(notamText)) {
          return false;
        }

        return notamText.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .map((notam) => {
        const notamText = JSON.parse(notam.text).raw;

        let highlightedText = notamText
          .replace(ifrTerms, '<span class="text-custom-ifr">$&</span>')
          .replace(lifrTerms, '<span class="text-custom-lifr">$&</span>')
          .replace(mvfrTerms, '<span class="text-custom-mvfr">$&</span>');

        if (searchTerm) {
          const searchTermRegex = new RegExp(`(${searchTerm})`, 'gi');
          highlightedText = highlightedText.replace(
            searchTermRegex,
            '<mark>$1</mark>'
          );
        }

        return { ...notam, highlightedText };
      });
  };

  const countFilteredNotams = (notams, type, searchTerm, isCraneFilterActive) => {
    const filteredNotams = filterAndHighlightNotams(notams, searchTerm, isCraneFilterActive);

    return filteredNotams.filter((notam) => {
      const displayText = extractTextBeforeFR(JSON.parse(notam.text).raw);
      const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
      if (!qLineMatch) return false;
      return qLineMatch[2].startsWith(type);
    }).length;
  };

  const renderNotamCard = () => {
    switch (selectedNotamType) {
      case 'AERODROME':
        return (
          <Card title="NOTAM AERODROME" status={null} className="h-full">
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.futureNotams || []), 'FUTURE')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.todayNotams || []), 'TODAY')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.last7DaysNotams || []), 'LAST 7 DAYS')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.last30DaysNotams || []), 'LAST 30 DAYS')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.olderNotams || []), 'OLDER')}
          </Card>
        );
      case 'ENROUTE':
        return (
          <Card title="NOTAM ENROUTE" status={null} className="h-full">
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.futureNotams || []), 'FUTURE')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.todayNotams || []), 'TODAY')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.last7DaysNotams || []), 'LAST 7 DAYS')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.last30DaysNotams || []), 'LAST 30 DAYS')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.olderNotams || []), 'OLDER')}
          </Card>
        );
      case 'WARNING':
        return (
          <Card title="NOTAM WARNING" status={null} className="h-full">
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.futureNotams || []), 'FUTURE')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.todayNotams || []), 'TODAY')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.last7DaysNotams || []), 'LAST 7 DAYS')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.last30DaysNotams || []), 'LAST 30 DAYS')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.olderNotams || []), 'OLDER')}
          </Card>
        );
      default:
        return null;
    }
  };

  ///FUNCTION for NOTAMs with Q-Line that have an "A"///
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
            const expirationDate = expirationMatch
              ? parseNotamDate(expirationMatch[1])
              : null;
            const localExpirationDate = expirationDate
              ? new Date(
                expirationDate.getTime() -
                expirationDate.getTimezoneOffset() * 60000
              )
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
                  <p
                    key={lineIndex}
                    className="mb-1"
                    dangerouslySetInnerHTML={{ __html: line }}
                  ></p>
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
      {/* Conditionally render SideNav only when routingWXXForm is selected */}
      {selectedForm === 'routingWXXForm' && (
        <SideNav 
          savedRoutings={savedRoutings} 
          showWeatherAndRcam={false} 
          showLogo={false} 
          showPrinterIcon={false} 
        />
      )}
      <div className="flex flex-col h-screen flex-1" ref={containerRef}>
        <div className="flex items-center bg-lime-600 space-x-4 flex-wrap p-2">
          <ChoiceListbox
            choices={['airportSearchForm', 'routingWXXForm']}
            callback={(value) => setSelectedForm(value)}
            value={selectedForm}
            width=""
          />

        {/* Conditional Rendering of Forms */}
          {selectedForm === 'routingWXXForm' && (
            <RoutingWXXForm onSave={handleSaveRouting} />
          )}
          {selectedForm === 'airportSearchForm' && (
            <AirportSearchForm fetchWeather={fetchWeather} />
          )}
        </div>

        <div className="flex-1 overflow-hidden bg-yellow-600">
          <div className="flex flex-row h-full">

          {/* Left Column for METAR and TAF */}
            <div
              className="flex flex-col overflow-y-auto p-2"
              style={{ width: `${leftWidth}%`, minWidth: '20%', maxWidth: '80%' }}
            >
              <h1 className="font-bold text-lg">METAR</h1>
              <div className="flex">
                <Card title="METAR" status={null} className="h-full">
                  <MetarDisplay weatherData={weatherData} />
                </Card>
              </div>

              <h1 className="font-bold text-lg">TAF</h1>
              <div className="flex-grow">
                <Card title="TAF" status={null} className="h-full">
                  <TafDisplay weatherData={weatherData} />
                </Card>
              </div>

              <h1 className="font-bold text-lg">GFA</h1>
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

          {/* Resizer */}
            <div
              ref={resizerRef}
              className="w-1 bg-gray-500 cursor-col-resize"
              onMouseDown={() => setIsResizing(true)}
            />

          {/* Right Column for NOTAM */}
            <div
              className="flex flex-col p-2 overflow-y-auto"
              style={{ width: `${100 - leftWidth}%`, minWidth: '20%', maxWidth: '80%' }}
            >
              <div className="mb-4">
                <label className="font-bold mr-2 text-lg">NOTAM</label>
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

              {/* Search Box */}
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
      </div>
    </div>
  );
}
