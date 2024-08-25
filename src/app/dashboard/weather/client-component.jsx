
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext';
import AirportSearchForm from './AirportSearchForm';
import { ChoiceListbox } from '../../lib/component/ListBox';
import SideNav from '@/app/ui/dashboard/sidenav';
import AirportWeatherDisplay from '../../lib/component/AirportWeatherDisplay';
import {
  formatLocalDate,
  parseNotamDate,
  categorizeNotams,
  renderNotamsW,
  renderNotamsE,
  allAirportsFlightCategory,
  countFilteredNotams,
  filterAndHighlightNotams,
  extractTextBeforeFR, // Add this line to import the function
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
      [field]: value.length > 4 ? 'Airport code must be exactly 4 letters' : ''
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

  // Function to delete a routing and clear the inputs
  const handleDeleteRouting = (index) => {
    const updatedRoutings = savedRoutings.filter((_, i) => i !== index);
    setSavedRoutings(updatedRoutings);
    localStorage.setItem('savedRoutings', JSON.stringify(updatedRoutings));

    // Clear the routing inputs
    setFlightDetails({
      flightNumber: '',
      departure: '',
      destination: '',
      alternate1: '',
      alternate2: '',
    });
  };

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
    setIsCraneFilterActive((prevState) => !prevState);
    console.log('Crane filter is now:', !isCraneFilterActive);
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
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.futureNotams || [], searchTerm, isCraneFilterActive), 'FUTURE')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.todayNotams || [], searchTerm, isCraneFilterActive), 'TODAY')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.last7DaysNotams || [], searchTerm, isCraneFilterActive), 'LAST 7 DAYS')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.last30DaysNotams || [], searchTerm, isCraneFilterActive), 'LAST 30 DAYS')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.olderNotams || [], searchTerm, isCraneFilterActive), 'OLDER')}
          </Card>
        );
      case 'ENROUTE':
        return (
          <Card title="NOTAM ENROUTE" status={null} className="h-full">
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.futureNotams || [], searchTerm, isCraneFilterActive), 'FUTURE')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.todayNotams || [], searchTerm, isCraneFilterActive), 'TODAY')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.last7DaysNotams || [], searchTerm, isCraneFilterActive), 'LAST 7 DAYS')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.last30DaysNotams || [], searchTerm, isCraneFilterActive), 'LAST 30 DAYS')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.olderNotams || [], searchTerm, isCraneFilterActive), 'OLDER')}
          </Card>
        );
      case 'WARNING':
        return (
          <Card title="NOTAM WARNING" status={null} className="h-full">
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.futureNotams || [], searchTerm, isCraneFilterActive), 'FUTURE')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.todayNotams || [], searchTerm, isCraneFilterActive), 'TODAY')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.last7DaysNotams || [], searchTerm, isCraneFilterActive), 'LAST 7 DAYS')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.last30DaysNotams || [], searchTerm, isCraneFilterActive), 'LAST 30 DAYS')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.olderNotams || [], searchTerm, isCraneFilterActive), 'OLDER')}
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
          onDeleteRouting={handleDeleteRouting} // Pass the delete function
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
        />
      </div>
    </div>
  );
}
