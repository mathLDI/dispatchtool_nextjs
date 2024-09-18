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
import AirportDotCategory from '../../lib/component/AirportDotCategory'; // Updated import

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
    flightNumber: '',
    icaoAirports: '',
    alternates: '',
    icaoAirportALTN: '', // Add this for icaoAirportALTN warnings
  });


  const handleChange = (e, field) => {
    const value = e.target.value.toUpperCase();
    setWarnings({
      ...warnings,
      [field]: value.length > 4 ? 'Airport code must be exactly 4 letters' : '',
    });
    setFlightDetails({ ...flightDetails, [field]: value });
  };


  const handleIcaoChange = (e) => {
    const newIcao = e.target.value.toUpperCase(); // Get the new ICAO code
    setFlightDetails((prevDetails) => ({
      ...prevDetails,
      icaoAirports: newIcao.split(' '), // Split input by spaces and store each ICAO code in an array
    }));
  };


  const handleIcaoAltnChange = (e) => {
    const newIcaoAltn = e.target.value.toUpperCase(); // Convert input to uppercase and split by space

    // Update only the icaoAirportALTN field in the current routing
    setFlightDetails((prevDetails) => ({
      ...prevDetails,
      icaoAirportALTN: newIcaoAltn.split(' '), // 
    }));

  };



  const updateSavedRouting = (newIcaoAltn) => {

    setSavedRoutings((prevRoutings) =>
      prevRoutings.map((routing) =>
        routing.flightNumber === flightDetails.flightNumber &&
          routing.departure === flightDetails.departure &&
          routing.destination === flightDetails.destination
          ? { ...routing, icaoAirportALTN: newIcaoAltn } // Update the icaoAirportALTN for the existing routing
          : routing
      )
    );
  };



  const handleSave = () => {
    const icaoAirports = flightDetails.icaoAirports || []; // Default to empty array if undefined
    const icaoAirportALTN = flightDetails.icaoAirportALTN || []; // Default to empty array if undefined

    // Check if flightNumber, icaoAirports, and icaoAirportALTN are valid
    if (flightDetails.flightNumber && icaoAirports.length > 0 && icaoAirportALTN.length > 0) {
      onSave(flightDetails); // Proceed with saving if all fields are valid
    } else {
      // Check and show alert messages for missing fields
      if (!flightDetails.flightNumber) {
        alert("Please provide a valid flight number.");
      }
      if (icaoAirports.length === 0) {
        alert("Please provide at least one ICAO airport.");
      }
      if (icaoAirportALTN.length === 0) {
        alert("Please provide at least one ICAO alternate airport.");
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



  return (
    <div className="flex items-center space-x-4 mt-4 flex-wrap">


      <div className='flex flex-1 flex-col '>

        <div>
          <input
            type="text"
            placeholder="FLIGHT #"
            value={flightDetails.flightNumber || ''}
            onChange={(e) => setFlightDetails({ ...flightDetails, flightNumber: e.target.value.toUpperCase() })}
            className="p-2 border border-gray-300 rounded-md text-center"
            style={{ width: '150px', textTransform: 'uppercase' }}  // Ensures text is displayed in uppercase
          />
        </div>


        {/**testing a list of airports********************************* */}

        <div className="pt-4">
          <form className="mb-4 relative">
            <input
              type="text"
              value={(flightDetails.icaoAirports || []).join(' ') || ''}
              onChange={handleIcaoChange}
              placeholder="Add ICAO Airports (use ICAO codes)"
              className="border p-2 rounded w-full"
              style={{ textTransform: 'uppercase' }}
            />
            {warnings.icaoAirports && <p className="bg-orange-400 text-red-700 mt-2">{warnings.icaoAirports}</p>}
          </form>
        </div>


        {/**add list of alternates */}

        <div className="pt-4 bg-indigo-200">
          <form className="mb-4 relative">
            <input
              type="text"
              value={(flightDetails.icaoAirportALTN || []).join(' ') || ''}
              onChange={handleIcaoAltnChange}
              placeholder="Add Alternate ICAO Airports (use ICAO codes)"
              className="border p-2 rounded w-full"
              style={{ textTransform: 'uppercase' }}
            />


            {warnings.icaoAirportALTN && <p className="bg-orange-400 text-red-700 mt-2">{warnings.icaoAirportALTN}</p>}
          </form>

        </div>




        <div className="flex items-center space-x-2 p-2 bg-yellow-300">
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

  ///add the state below to context///////
  //////////////////////////////////////
  //////////////////////////////////////

  const [utcTime, setUtcTime] = useState('');
  const [localTime, setLocalTime] = useState('');
  const [lastWeatherRefreshTime, setLastWeatherRefreshTime] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state


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
    return date.toLocaleTimeString([], { hour12: false }); // 24-hour format
  };

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

  /////////////////////////////////////////////////////


  const filteredRoutings = savedRoutings.filter((routing) => {
    // Check if all search terms are found in any of the routing fields
    return searchTerms.every((term) =>
      (routing.flightNumber?.toUpperCase() || '').includes(term) ||  // Use optional chaining and default to an empty string
      (routing.departure?.toUpperCase() || '').includes(term) ||     // Same for departure
      (routing.destination?.toUpperCase() || '').includes(term) ||   // Same for destination
      (routing.alternate1?.toUpperCase() || '').includes(term) ||    // Same for alternate1
      (routing.alternate2?.toUpperCase() || '').includes(term) ||    // Same for alternate2
      (Array.isArray(routing.icaoAirports) && routing.icaoAirports.some(icao => icao?.toUpperCase().includes(term))) || // Check for icaoAirports
      (Array.isArray(routing.icaoAirportALTN) && routing.icaoAirportALTN.some(icao => icao?.toUpperCase().includes(term))) // Check for icaoAirportALTN
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
      const airportsToFetch = savedRoutings.flatMap((routing) => [
        routing.departure,
        routing.destination,
        ...(routing.icaoAirports || []),  // Always include ICAO Airports from saved routings
        ...(routing.icaoAirportALTN || []),  // Include ICAO alternate airports from saved routings
      ]).filter(Boolean);  // Remove falsy values

      for (const airportCode of airportsToFetch) {
        try {
          const data = await fetchWeather(airportCode);

          setAllWeatherData((prevData) => ({
            ...prevData,
            [airportCode]: data,  // Add fetched data to the allWeatherData object
          }));
        } catch (error) {
          console.error(`Failed to fetch weather data for ${airportCode}:`, error);
        }
      }
    };
    // Fetch initial data and every 2 minutes
    fetchAllWeatherData();
    const intervalId = setInterval(fetchAllWeatherData, 120000);
    return () => clearInterval(intervalId);

  }, [savedRoutings, fetchWeather, setAllWeatherData]);  // Fetch when savedRoutings change






  const airportsToShow = selectedForm === 'Airport Search'
    ? [...airportValues] // Only show airportValues when "Airport Search" is selected
    : [
      flightDetails.departure && { code: flightDetails.departure },
      flightDetails.destination && { code: flightDetails.destination },
      flightDetails.alternate1 && { code: flightDetails.alternate1 },
      flightDetails.alternate2 && { code: flightDetails.alternate2 },
      ...(flightDetails.icaoAirports || []).map(icao => ({ code: icao })),
    ].filter(Boolean); // Show routing airports when "Routing Search" is selected


  useEffect(() => {
    if (selectedForm === 'Airport Search' && airportValues.length > 0) {
      handleAirportClick(airportValues[0].code);
    } else if (selectedForm === 'Routing Search') {
      if (flightDetails.departure) {
        handleAirportClick(flightDetails.departure);
      }
      if (flightDetails.icaoAirports && flightDetails.icaoAirports.length > 0) {
        flightDetails.icaoAirports.forEach(icao => handleAirportClick(icao));
      }
    }
  }, [selectedForm, flightDetails.departure, flightDetails.icaoAirports, airportValues, handleAirportClick]);





  // Fetch weather data based on the selected form
  useEffect(() => {
    const fetchWeatherDataForRouting = async () => {
      const data = { ...allWeatherDataRef.current };

      const airports = savedRoutings.flatMap((routing) => [
        { code: routing.departure },
        { code: routing.destination },
        routing.alternate1 && { code: routing.alternate1 },
        routing.alternate2 && { code: routing.alternate2 },
        ...(Array.isArray(routing.icaoAirports) ? routing.icaoAirports.map((icao) => ({ code: icao })) : []),  // Ensure it's an array
        ...(Array.isArray(routing.icaoAirportALTN) ? routing.icaoAirportALTN.map((icao) => ({ code: icao })) : []),  // Include ICAO alternate airports
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
          ...(flightDetails.icaoAirports || []).map(icao => ({ code: icao })), // Include primary ICAO airports
          ...(flightDetails.icaoAirportALTN || []).map(icao => ({ code: icao })), // Include alternate ICAO airports
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
        ...(Array.isArray(routing.icaoAirportALTN) ? routing.icaoAirportALTN.map(icao => ({ code: icao })) : []) // Include ICAO Alternate Airports
      ]).filter(Boolean);  // Remove any null or undefined values

      // Combine airports from saved routings, airportValues, icaoAirports, and icaoAirportALTN
      const airportsToInclude = [
        ...airportValues, // Existing airport values
        ...airportsFromSavedRoutings, // Airports from saved routings
        ...(flightDetails.icaoAirports || []).map(icao => ({ code: icao })), // Convert ICAO Airports to objects
        ...(flightDetails.icaoAirportALTN || []).map(icao => ({ code: icao })) // Convert ICAO Alternate Airports to objects
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
  }, [allWeatherData, airportValues, savedRoutings, flightDetails.icaoAirports, setAirportCategories, flightDetails.icaoAirportALTN]);




  const handleSaveRouting = (newRouting) => {
    // Function to filter valid 4-letter/number ICAO airports and ignore invalid or whitespace-only entries
    const filterValidAirports = (airports) => airports.filter(airport => /^[A-Za-z0-9]{4}$/.test(airport.trim()));

    // Function to check if there are any invalid airports (not exactly 4 characters)
    const hasInvalidAirports = (airports) => airports.some(airport => airport.trim() !== '' && !/^[A-Za-z0-9]{4}$/.test(airport.trim()));

    // Filter out invalid airports (not exactly 4 characters or whitespace)
    const filteredIcaoAirports = filterValidAirports(flightDetails.icaoAirports || []);
    const filteredIcaoAirportALTN = filterValidAirports(flightDetails.icaoAirportALTN || []);

    // Check if there are any invalid airports (not 4 alphanumeric characters) and show a warning if found
    if (hasInvalidAirports(flightDetails.icaoAirports) || hasInvalidAirports(flightDetails.icaoAirportALTN)) {
      alert('Incorrect entry'); // Show warning message to the user for invalid (non-whitespace) entries
      return; // Exit early to prevent saving an invalid routing
    }

    // If both filtered icaoAirports and icaoAirportALTN are empty, prevent saving
    if (filteredIcaoAirports.length === 0 || filteredIcaoAirportALTN.length === 0) {
      alert('Please provide valid ICAO airports and alternate airports.');
      return; // Exit early to prevent saving an invalid routing
    }

    // Find if a routing with the same flightNumber, departure, and destination already exists
    const existingRoutingIndex = savedRoutings.findIndex((routing) => {
      return (
        routing.flightNumber === newRouting.flightNumber &&
        routing.departure === newRouting.departure &&
        routing.destination === newRouting.destination
      );
    });

    // Create a new routing with filtered icaoAirports and icaoAirportALTN
    const routingWithIcao = {
      ...newRouting,
      icaoAirports: filteredIcaoAirports, // Use the filtered airports
      icaoAirportALTN: filteredIcaoAirportALTN, // Use the filtered alternate airports
    };

    // If an existing routing is found, compare the icaoAirports and icaoAirportALTN
    if (existingRoutingIndex !== -1) {
      const existingRouting = savedRoutings[existingRoutingIndex];

      // Check if the icaoAirports or icaoAirportALTN have changed
      const hasIcaoAirportsChanged =
        JSON.stringify(existingRouting.icaoAirports) !==
        JSON.stringify(routingWithIcao.icaoAirports);

      const hasIcaoAirportALTNChanged =
        JSON.stringify(existingRouting.icaoAirportALTN) !==
        JSON.stringify(routingWithIcao.icaoAirportALTN);

      // If there are changes in the airports, open the modal
      if (hasIcaoAirportsChanged || hasIcaoAirportALTNChanged) {
        setPendingRouting(routingWithIcao);
        setIsModalOpen(true); // Trigger the modal to confirm changes
      } else {
        // If no changes, proceed with the update (or do nothing)
        const updatedRoutings = [...savedRoutings];
        updatedRoutings[existingRoutingIndex] = routingWithIcao;

        setSavedRoutings(updatedRoutings);

        // Update localStorage if available
        if (typeof window !== 'undefined') {
          localStorage.setItem('savedRoutings', JSON.stringify(updatedRoutings));
        }
      }
    } else {
      // If no existing routing, just add the new one
      const updatedRoutings = [...savedRoutings, routingWithIcao];
      setSavedRoutings(updatedRoutings);

      // Update localStorage if available
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
      <div className='flex pr-4 '>
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          onModify={handleModify}
        />

        <div className='flex-1  bg-gray-300'>

          <div className="flex">
            {selectedForm === 'Routing Search' && (
              <div className="flex justify-center items-center p-2 relative">
                {/* Search box to filter routings */}
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <SearchIcon className="h-5 w-5 text-gray-500" />
                </span>
                <input
                  type="text"
                  placeholder="Search by Term(s)"
                  value={searchRouting}
                  onChange={(e) => setSearchRouting(e.target.value.toUpperCase())} // Convert input to uppercase
                  className="p-2 pl-10 border border-gray-300 rounded-md w-full"
                  style={{ textTransform: 'uppercase' }} // Visually display the input in uppercase
                />
              </div>
            )}
          </div>



          <div className="flex  h-screen overflow-y-auto   ">
            {selectedForm === 'Routing Search' && (
              <div className="flex justify-center items-center h-full w-full ">
                <SideNav
                  savedRoutings={filteredRoutings} // Pass filtered routings based on search
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

      </div>

      <div className="flex-1 flex-wrap flex-col h-screen " ref={containerRef}>
        <div className="flex-1  ">

          <div className='flex justify-between'>
            <div className='flex'>
              <NewChoiceListbox
                choices={['Airport Search', 'Routing Search']}
                callback={handleFormChange}
              />
            </div>

            <div className='ml-auto'>
              <div>UTC Time: {utcTime.split(' ')[4]}</div> {/* Extracting just the time part from UTC */}

              <div className='ml-auto'>
                Local Time: {localTime} {/* Already formatted in 24-hour format */}
              </div>

              <div className='ml-auto'>
                Last Weather Refresh: {lastWeatherRefreshTime ? lastWeatherRefreshTime : 'N/A'}
              </div>
            </div>


          </div>


          <div className='pb-4'>
            {selectedForm === 'Routing Search' && <RoutingWXXForm onSave={handleSaveRouting} />}
          </div>

          {/* AirportSearchForm is displayed when 'Airport Search' is selected */}
          <div className="flex flex-grow">
            {selectedForm === 'Airport Search' && <AirportSearchForm fetchWeather={fetchWeather} />}
          </div>

          {/* AirportList is displayed when 'Routing Search' is selected */}
          <div className='flex'>
            {selectedForm === 'Routing Search' && (
              <AirportList
                airportsToShow={airportsToShow}
                onAirportClick={handleAirportClick}
              />
            )}
          </div>
        </div>


        <div className=''>
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
