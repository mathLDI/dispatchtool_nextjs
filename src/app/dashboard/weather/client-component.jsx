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
import { SearchIcon } from '@heroicons/react/outline';

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
  highlightNotamTermsJSX,
} from '../../lib/component/functions/weatherAndNotam';

const RoutingWXXForm = ({ onSave, fetchWeather }) => {
  const { flightDetails, setFlightDetails, addAirportValue, removeAirportValue, setAllWeatherData, setWeatherData, setSelectedAirport, airportValues, selectedAirport } = useRccContext();
  const [warnings, setWarnings] = useState({
    flightNumber: '',
    icaoAirports: '',
    alternates: '',
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
    const icaoAirports = Array.isArray(flightDetails.icaoAirports) ? flightDetails.icaoAirports : []; // Default to empty array if undefined

    // Check if flightNumber and icaoAirports are valid
    if (flightDetails.flightNumber && icaoAirports.length > 0) {
      onSave(flightDetails); // Proceed with saving if all fields are valid
    } else {
      // Check and show alert messages for missing fields
      if (!flightDetails.flightNumber) {
        alert("Please provide a valid flight number.");
      }
      if (icaoAirports.length === 0) {
        alert("Please provide at least one ICAO airport.");
      }
    }
  };

  const handleClear = () => {
    // Clear all fields including icaoAirports
    setFlightDetails({
      flightNumber: '',
      icaoAirports: [],  // Clear the ICAO airports
      alternate1: '',
      alternate2: '',
    });

    // Clear any warnings
    setWarnings({
      flightNumber: '',
      icaoAirports: '',
    });
  };

  // Add / Remove airports controls (placed below Save/Clear)
  const [addInput, setAddInput] = useState('');

  const handleAddSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const codes = addInput.split(/\s+/).map(c => c.trim().toUpperCase()).filter(Boolean);
    if (codes.length === 0) return;

    const weatherMap = {};
    for (const code of codes) {
      if (!/^[A-Za-z0-9]{4}$/.test(code)) continue;
      if (airportValues.some(a => a.code === code)) continue; // skip duplicates
      addAirportValue({ id: code, name: `Airport ${code}`, code });
      try {
        if (fetchWeather) {
          const data = await fetchWeather(code);
          if (data) weatherMap[code] = data;
        }
      } catch (err) {
        console.error(`Failed to fetch weather for ${code}:`, err);
      }
    }

    if (Object.keys(weatherMap).length > 0) {
      setAllWeatherData(prev => ({ ...prev, ...weatherMap }));
      const first = Object.keys(weatherMap)[0];
      setWeatherData(weatherMap[first]);
      setSelectedAirport({ id: first, name: `Airport ${first}`, code: first });
    }

    // Update flightDetails with newly added airports and save routing (flightNumber + airports)
    const existingIcaos = Array.isArray(flightDetails.icaoAirports) ? [...flightDetails.icaoAirports] : [];
    const newIcaos = [...existingIcaos, ...codes.filter(c => !existingIcaos.includes(c))];
    const newFlightDetails = { ...flightDetails, icaoAirports: newIcaos };
    setFlightDetails(newFlightDetails);

    // Call onSave to persist the routing (will update savedRoutings and localStorage)
    try {
      onSave && onSave(newFlightDetails);
    } catch (err) {
      console.error('Failed to save routing after adding airports', err);
    }

    setAddInput('');
  };

  const handleRemoveAirport = (code) => {
    removeAirportValue(code);
    setAllWeatherData(prev => {
      const copy = { ...prev };
      delete copy[code];
      return copy;
    });
    if (selectedAirport?.code === code) {
      setSelectedAirport(null);
      setWeatherData(null);
    }
    // Also remove from flightDetails and update saved routings
    const existingIcaos = Array.isArray(flightDetails.icaoAirports) ? [...flightDetails.icaoAirports] : [];
    const updatedIcaos = existingIcaos.filter(c => c !== code);
    const newFlightDetails = { ...flightDetails, icaoAirports: updatedIcaos };
    setFlightDetails(newFlightDetails);
    try {
      onSave && onSave(newFlightDetails);
    } catch (err) {
      console.error('Failed to save routing after removing airport', err);
    }
  };

  return (
    <div className="flex items-center flex-wrap">


      <div className='flex flex-1 flex-col '>

        <div className="flex items-center">
          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-l-lg font-medium">CRQ</span>
          <input
            type="text"
            placeholder="Enter Flight #"
            value={flightDetails.flightNumber ? flightDetails.flightNumber.replace(/^CRQ/, '') : ''} // Remove 'CRQ' from the input value
            onChange={(e) => {
              const input = e.target.value.toUpperCase();
              setFlightDetails({ ...flightDetails, flightNumber: `CRQ${input}` }); // Always prepend 'CRQ'
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500 text-center"
            style={{ width: '150px', textTransform: 'uppercase' }}  // Ensures text is displayed in uppercase
          />
        </div>

        <div className="flex items-center pt-1 gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:scale-95"
          >
            Save
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-lg font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:scale-95"
          >
            Clear
          </button>
        </div>

        <div className="pt-3 w-full">
          <form onSubmit={handleAddSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add Airport(s) (space-separated ICAO)"
              value={addInput}
              onChange={(e) => setAddInput(e.target.value.toUpperCase())}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500 w-full text-center"
              style={{ textTransform: 'uppercase' }}
            />
            <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:scale-95">Add</button>
          </form>

          {airportValues && airportValues.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {airportValues.map((ap) => (
                <div key={ap.code} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{ap.code}</span>
                  <button onClick={() => handleRemoveAirport(ap.code)} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-transparent px-1 transition-colors duration-150">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

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
    selectedForm,
    setSelectedForm,
    searchRouting,
    setSearchRouting,
    savedRoutings = [],
    setSavedRoutings,
    flightDetails = {},
    setFlightDetails,

  } = useRccContext();

  {/**  const handleFormChange = (newForm) => {
    setSelectedForm(newForm);               // Update the selectedForm state
  }; */}

  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingRouting, setPendingRouting] = useState(null);
  const [utcTime, setUtcTime] = useState('');
  const [localTime, setLocalTime] = useState('');
  const [lastWeatherRefreshTime, setLastWeatherRefreshTime] = useState(null);
  const [formattedRefreshTime, setFormattedRefreshTime] = useState('');

  // Filtering logic for the routing search
  const searchTerms = searchRouting.split(/\s+/).map(term => term.toUpperCase()); // Split by spaces and convert each term to uppercase

  // Function to get UTC time
  const getUtcTime = () => {
    const now = new Date();
    return now.toUTCString(); // Full UTC string
  };

  // Function to get Local time in 24-hour format
  const getLocalTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour12: false }); // 24-hour format
  };

  // Function to format the weather refresh time into local time (24-hour format)
  const formatRefreshTime = (date) => {
    if (!(date instanceof Date)) {
      return '';
    }
    return date.toLocaleTimeString([], { hour12: false }); // 24-hour format
  };

  // Update the last weather refresh time and its formatted version when weatherData is updated
  useEffect(() => {
    if (weatherData) {
      const now = new Date();
      setLastWeatherRefreshTime(now);
      setFormattedRefreshTime(formatRefreshTime(now));
    }
  }, [weatherData]);

  // Update the UTC and local time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime(getUtcTime());
      setLocalTime(getLocalTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update the last weather refresh time when weatherData is updated
  useEffect(() => {
    if (weatherData) {
      const now = new Date();
      setLastWeatherRefreshTime(formatRefreshTime(now)); // Store local time of the refresh
    }
  }, [weatherData]);

  const filteredRoutings = savedRoutings.filter((routing) => {
    // Check if all search terms are found in any of the routing fields
    return searchTerms.every((term) =>
      (routing.flightNumber?.toUpperCase() || '').includes(term) ||  // Use optional chaining and default to an empty string
      (routing.departure?.toUpperCase() || '').includes(term) ||     // Same for departure
      (routing.destination?.toUpperCase() || '').includes(term) ||   // Same for destination
      (routing.alternate1?.toUpperCase() || '').includes(term) ||    // Same for alternate1
      (routing.alternate2?.toUpperCase() || '').includes(term) ||    // Same for alternate2
      (Array.isArray(routing.icaoAirports) && routing.icaoAirports.some(icao => icao?.toUpperCase().includes(term))) // Check for icaoAirports
    );
  });

  const handleDeleteRouting = (index) => {
    const updatedRoutings = savedRoutings.filter((_, i) => i !== index);
    setSavedRoutings(updatedRoutings);

    // Check for window object and update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedRoutings', JSON.stringify(updatedRoutings));
    }

    // Reset flight details, including clearing icaoAirports
    setFlightDetails({
      flightNumber: '',
      departure: '',
      destination: '',
      alternate1: '',
      alternate2: '',
      icaoAirports: [], // Clear the ICAO airports as part of the flight details reset
    });
  };

  const handleAirportClick = useCallback(async (airportCode) => {
    try {
      const data = await fetchWeather(airportCode);
      setWeatherData(data);
      setSelectedAirport({ code: airportCode });
      // Add this to update allWeatherData
      setAllWeatherData(prev => ({
        ...prev,
        [airportCode]: data
      }));
    } catch (error) {
      console.error(`Failed to fetch weather data for ${airportCode}:`, error);
    }
  }, [fetchWeather, setWeatherData, setSelectedAirport, setAllWeatherData]);

  // Fetch weather data based on the selected form
  useEffect(() => {
    const fetchAllWeatherData = async () => {
      const airportsToFetch = savedRoutings.flatMap((routing) => [
        routing.departure,
        routing.destination,
        ...(Array.isArray(routing.icaoAirports) ? routing.icaoAirports : []),
      ]).filter(Boolean);

      const uniqueAirports = [...new Set(airportsToFetch)];

      const newWeatherData = {};
      for (const airportCode of uniqueAirports) {
        try {
          const data = await fetchWeather(airportCode);
          newWeatherData[airportCode] = data;
        } catch (error) {
          console.error(`Failed to fetch weather data for ${airportCode}:`, error);
        }
      }

      setAllWeatherData((prevData) => ({
        ...prevData,
        ...newWeatherData,
      }));

      const now = new Date();
      setLastWeatherRefreshTime(now);
      setFormattedRefreshTime(formatRefreshTime(now));
    };
    
    fetchAllWeatherData();
    const intervalId = setInterval(fetchAllWeatherData, 60000); // Fetch every 1 minute

    return () => clearInterval(intervalId);
  }, [savedRoutings, fetchWeather, setAllWeatherData]);

  // Display formatted time - use this where you need to show the refresh time
  const displayRefreshTime = lastWeatherRefreshTime ? formatRefreshTime(lastWeatherRefreshTime) : '';
  const airportsToShow = [
    flightDetails.departure && { code: flightDetails.departure },
    flightDetails.destination && { code: flightDetails.destination },
    flightDetails.alternate1 && { code: flightDetails.alternate1 },
    flightDetails.alternate2 && { code: flightDetails.alternate2 },
    ...(Array.isArray(flightDetails.icaoAirports) ? flightDetails.icaoAirports.map(icao => ({ code: icao })) : []),
  ].filter(Boolean); // Show routing airports only


  useEffect(() => {
    if (flightDetails.icaoAirports && flightDetails.icaoAirports.length > 0) {
      // Select the first airport in icaoAirports if available
      handleAirportClick(flightDetails.icaoAirports[0]);
    }
  }, [flightDetails.icaoAirports, handleAirportClick]);


  // Fetch weather data based on the selected form
  {/**  useEffect(() => {
    const fetchWeatherDataForRouting = async () => {
      const data = { ...allWeatherDataRef.current };

      const airports = savedRoutings.flatMap((routing) => [
        { code: routing.departure },
        { code: routing.destination },
        routing.alternate1 && { code: routing.alternate1 },
        routing.alternate2 && { code: routing.alternate2 },
        ...(Array.isArray(routing.icaoAirports) ? routing.icaoAirports.map((icao) => ({ code: icao })) : []),  // Ensure it's an array
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

    if (savedRoutings.length > 0) {
      fetchWeatherDataForRouting();
    }
  }, [fetchWeather, flightDetails, savedRoutings, setAllWeatherData]);
 */}

  {/**Function below control how the addition of airport is control. The new code now include the routing.icaoAirports as
    persistent airports in the list  */}

  useEffect(() => {
    if (Object.keys(allWeatherData).length > 0) {
      const airportsFromSavedRoutings = savedRoutings.flatMap((routing) => [
        routing.departure && { code: routing.departure },  // Ensure departure exists
        routing.destination && { code: routing.destination },  // Ensure destination exists
        routing.alternate1 && { code: routing.alternate1 },
        routing.alternate2 && { code: routing.alternate2 },
        ...(Array.isArray(routing.icaoAirports) ? routing.icaoAirports.map(icao => ({ code: icao })) : []), // Ensure ICAO Airports are included only if it's an array
      ]).filter(Boolean);  // Remove any null or undefined values

      // Combine airports from saved routings, airportValues, and icaoAirports
      const airportsToInclude = [
        ...airportValues, // Existing airport values
        ...airportsFromSavedRoutings, // Airports from saved routings
        ...(Array.isArray(flightDetails.icaoAirports) ? flightDetails.icaoAirports.map(icao => ({ code: icao })) : []), // Convert ICAO Airports to objects
      ];

      // Ensure unique airports
      const uniqueAirportsToInclude = Array.from(
        new Set(airportsToInclude.map((airport) => airport.code))
      ).map((code) => ({ code }));

      // Categorize airports
      const newCategories = allAirportsFlightCategory(uniqueAirportsToInclude, allWeatherData);

      // Merge new categories into existing categories, ensuring old airports are not removed
      setAirportCategories((prevCategories) => ({
        ...prevCategories,
        ...newCategories,  // Add or update categories for new airports
      }));
    }
  }, [allWeatherData, airportValues, savedRoutings, flightDetails.icaoAirports, setAirportCategories]);


  const handleSaveRouting = (newRouting) => {
    // Function to filter valid 4-letter/number ICAO airports and ignore invalid or whitespace-only entries
    const filterValidAirports = (airports) => airports.filter(airport => /^[A-Za-z0-9]{4}$/.test(airport.trim()));

    // Function to check if there are any invalid airports (not exactly 4 characters)
    const hasInvalidAirports = (airports) => airports.some(airport => airport.trim() !== '' && !/^[A-Za-z0-9]{4}$/.test(airport.trim()));

    // Filter out invalid airports (not exactly 4 characters or whitespace)
    const filteredIcaoAirports = filterValidAirports(Array.isArray(flightDetails.icaoAirports) ? flightDetails.icaoAirports : []);

    // Check if there are any invalid airports (not 4 alphanumeric characters) and show a warning if found
    if (hasInvalidAirports(Array.isArray(flightDetails.icaoAirports) ? flightDetails.icaoAirports : [])) {
      alert('Incorrect entry'); // Show warning message to the user for invalid (non-whitespace) entries
      return; // Exit early to prevent saving an invalid routing
    }

    // If there are no valid icaoAirports, prevent saving
    if (filteredIcaoAirports.length === 0) {
      alert('Please provide at least one valid ICAO airport.');
      return; // Exit early to prevent saving an invalid routing
    }

    // Create a new routing with filtered icaoAirports
    const routingWithIcao = {
      ...newRouting,
      icaoAirports: filteredIcaoAirports, // Use the filtered main airports
    };

    let updatedRoutings;

    // Find if a routing with the same flightNumber and icaoAirports already exists
    const existingRoutingIndex = savedRoutings.findIndex((routing) => {
      return routing.flightNumber === newRouting.flightNumber;
    });

    if (existingRoutingIndex !== -1) {
      const existingRouting = savedRoutings[existingRoutingIndex];
      const existingIcaoAirports = Array.isArray(existingRouting.icaoAirports) ? existingRouting.icaoAirports : [];

      // Check if the current icaoAirports are exactly the same as the existing routing's icaoAirports
      const isIcaoAirportsSame =
        JSON.stringify(existingIcaoAirports) === JSON.stringify(filteredIcaoAirports);

      // If no changes to main ICAO airports, show the "Routing already exists" message
      if (isIcaoAirportsSame) {
        alert("Routing already exists.");
        return; // Exit early to prevent redundant saving
      }

      // Check if new ICAO airports are added (i.e., if the new list has airports that weren't in the existing routing)
      const newAirportsAdded = filteredIcaoAirports.some(
        (airport) => !existingIcaoAirports.includes(airport)
      );

      // If new ICAO airports are added, show a confirmation prompt
      if (newAirportsAdded) {
        const confirmed = window.confirm("You are adding new ICAO airports to an existing routing. Do you want to proceed?");
        if (!confirmed) {
          return; // Exit early if the user doesn't confirm
        }
      }

      // Update the existing routing
      updatedRoutings = [...savedRoutings];
      updatedRoutings[existingRoutingIndex] = routingWithIcao;
    } else {
      // Add the new routing
      updatedRoutings = [...savedRoutings, routingWithIcao];
    }

    // Update the state with the updated routings
    setSavedRoutings(updatedRoutings);

    // Update localStorage if available
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedRoutings', JSON.stringify(updatedRoutings));
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

// In src/app/dashboard/weather/client-component.jsx
// Around line 625 where the existing GFA useEffect is

useEffect(() => {
  if (selectedAirport && gfaType) {
    fetchGFA(selectedAirport.code, gfaType).then((data) => {
      setGfaData(data);
    });
  }
}, [selectedAirport, gfaType, fetchGFA, setGfaData]);

// Add the new periodic fetch effect here
useEffect(() => {
  const fetchGfaData = async () => {
    if (selectedAirport && gfaType) {
      const data = await fetchGFA(selectedAirport.code, gfaType);
      setGfaData(data);
    }
  };

  // Initial fetch
  fetchGfaData();

  // Refresh every 5 minutes
  const intervalId = setInterval(fetchGfaData, 5 * 60 * 1000);

  return () => clearInterval(intervalId);
}, [selectedAirport, gfaType, fetchGFA, setGfaData]);


  const categorizedNotams = weatherData
    ? categorizeNotams(weatherData.data.filter((item) => item.type === 'notam'))
    : [[], [], [], [], []]; // Default to an array of empty arrays if no data


  {/**  const handleNotamTypeChange = (newNotamType) => {
    setSelectedNotamType(newNotamType);
  }; */}

  const handleSearchChange = (event) => {
    const upperCaseSearchTerm = event.target.value.toUpperCase(); // Convert the input to uppercase
    setSearchTerm(upperCaseSearchTerm);
  };

  const renderNotamCard = () => {
    switch (selectedNotamType) {
      case 'AERODROME':
        return (
          <Card title="NOTAM AERODROME" status={null} className="h-full">
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams[0] || [], searchTerm, isCraneFilterActive), // Future NOTAMs for AERODROME
              'FUTURE',
              searchTerm // Pass the search term for highlighting
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams[1] || [], searchTerm, isCraneFilterActive), // Today NOTAMs for AERODROME
              'TODAY',
              searchTerm
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams[2] || [], searchTerm, isCraneFilterActive), // Last 7 Days NOTAMs for AERODROME
              'LAST 7 DAYS',
              searchTerm
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams[3] || [], searchTerm, isCraneFilterActive), // Last 30 Days NOTAMs for AERODROME
              'LAST 30 DAYS',
              searchTerm
            )}
            {renderNotamsAandAE(
              filterAndHighlightNotams(categorizedNotams[4] || [], searchTerm, isCraneFilterActive), // Older NOTAMs for AERODROME
              'OLDER',
              searchTerm
            )}
          </Card>
        );
      case 'ENROUTE':
        return (
          <Card title="NOTAM ENROUTE" status={null} className="h-full">
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams[0] || [], searchTerm, isCraneFilterActive), // Future NOTAMs for ENROUTE
              'FUTURE',
              searchTerm
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams[1] || [], searchTerm, isCraneFilterActive), // Today NOTAMs for ENROUTE
              'TODAY',
              searchTerm
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams[2] || [], searchTerm, isCraneFilterActive), // Last 7 Days NOTAMs for ENROUTE
              'LAST 7 DAYS',
              searchTerm
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams[3] || [], searchTerm, isCraneFilterActive), // Last 30 Days NOTAMs for ENROUTE
              'LAST 30 DAYS',
              searchTerm
            )}
            {renderNotamsE(
              filterAndHighlightNotams(categorizedNotams[4] || [], searchTerm, isCraneFilterActive), // Older NOTAMs for ENROUTE
              'OLDER',
              searchTerm
            )}
          </Card>
        );
      case 'WARNING':
        return (
          <Card title="NOTAM WARNING" status={null} className="h-full">
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams[0] || [], searchTerm, isCraneFilterActive), // Future NOTAMs for WARNING
              'FUTURE',
              searchTerm
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams[1] || [], searchTerm, isCraneFilterActive), // Today NOTAMs for WARNING
              'TODAY',
              searchTerm
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams[2] || [], searchTerm, isCraneFilterActive), // Last 7 Days NOTAMs for WARNING
              'LAST 7 DAYS',
              searchTerm
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams[3] || [], searchTerm, isCraneFilterActive), // Last 30 Days NOTAMs for WARNING
              'LAST 30 DAYS',
              searchTerm
            )}
            {renderNotamsW(
              filterAndHighlightNotams(categorizedNotams[4] || [], searchTerm, isCraneFilterActive), // Older NOTAMs for WARNING
              'OLDER',
              searchTerm
            )}
          </Card>
        );
      default:
        return null;
    }
  };

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


  return (
    <div className="flex overflow-auto">

      <div className='flex'>
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          onModify={handleModify}
        />

        <div className='flex-1'>

          <div className="flex">

            <input
              type="text"
              placeholder="Search by Term(s)"
              value={searchRouting}
              onChange={(e) => setSearchRouting(e.target.value.toUpperCase())} // Convert input to uppercase
              className="p-1 pl-1 border border-gray-300 rounded-md"
              style={{ textTransform: 'uppercase', width: '135px' }} // Set a fixed width of 300px
            />


          </div>



          <div className="flex-1 bg-gray-300 dark:bg-gray-700 flex flex-col justify-center items-center"
          > {/* Ensure full height with h-full */}
            <div
              className="flex-1 "
              style={{ maxHeight: '95vh', overflowY: 'auto', paddingBottom: '50px' }} // Add padding for better spacing and scrolling
            >
              {/* Increased padding at the bottom */}
              <SideNav
                savedRoutings={filteredRoutings} // Pass filtered routings based on search
                onDeleteRouting={handleDeleteRouting}
                showWeatherAndRcam={false}
                showLogo={false}
                showPrinterIcon={false}
                airportCategories={airportCategories}
              />
            </div>
          </div>



        </div>

      </div>

      <div className="flex-1 flex-wrap flex-col p-1 " ref={containerRef}>
        <div className="flex-1  ">

          <div className='flex justify-between'>


            <div className='ml-auto'>
              <div>UTC Time: {utcTime.split(' ')[4]}</div> {/* Extracting just the time part from UTC */}

              <div className='ml-auto'>
                Local Time: {localTime} {/* Already formatted in 24-hour format */}
              </div>

              <div className='ml-auto'>
                Last Weather Refresh: {formattedRefreshTime || 'N/A'}
              </div>
            </div>


          </div>


          <div className='pb-1'>
            <RoutingWXXForm onSave={handleSaveRouting} fetchWeather={fetchWeather} />
          </div>

          {/* AirportList - Shows ICAO airports with colored weather bubbles */}
          <div className='flex'>
            <AirportList
              onAirportClick={handleAirportClick}
            />
          </div>
        </div>


        <div className='flex-1 '>
          <div className=''>
            <AirportWeatherDisplay
              weatherData={weatherData}
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
