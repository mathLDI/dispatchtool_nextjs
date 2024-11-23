'use client';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Define the shape of the context state
interface Airport {
  id: string;
  name: string;
  code: string;
}

interface FlightDetails {
  flightNumber: string;
  departure: string;
  destination: string;
  icaoAirports: string[]; // Existing ICAO airports list
  icaoAirportALTN: string[]; // New ICAO alternate airports list
}

interface Routing {
  flightNumber: string;
  departure: string;
  destination: string;
  alternate1: string;
  alternate2: string;
}

interface AirportCategory {
  category: 'VFR' | 'MVFR' | 'IFR' | 'LIFR' | 'Unknown';
  color: string;
  time?: string; // Add time property to store the time of the change
}

interface RccContextType {
  aircraftType: string;
  setAircraftType: (type: string) => void;
  contaminationCoverage1: string;
  setContaminationCoverage1: (coverage: string) => void;
  contaminationCoverage2: string;
  setContaminationCoverage2: (coverage: string) => void;
  contaminationCoverage3: string;
  setContaminationCoverage3: (coverage: string) => void;
  contaminationCoverage4: string;
  setContaminationCoverage4: (coverage: string) => void;
  runwayConditionDescriptionGravel1: string;
  setRunwayConditionDescriptionGravel1: (description: string) => void;
  runwayConditionDescriptionPaved2: string;
  setRunwayConditionDescriptionPaved2: (description: string) => void;
  runwayConditionDescriptionGravel3: string;
  setRunwayConditionDescriptionGravel3: (description: string) => void;
  runwayConditionDescriptionPaved4: string;
  setRunwayConditionDescriptionPaved4: (description: string) => void;
  dropDownPavedOrGravel: string;
  setDropDownPavedOrGravel: (option: string) => void;
  rwycc1: number;
  setRwycc1: (value: number) => void;
  rwycc2: number;
  setRwycc2: (value: number) => void;
  rwycc3: number;
  setRwycc3: (value: number) => void;
  correctedLandingDistance: number;
  setCorrectedLandingDistance: (value: number) => void;
  runwayLength: number;
  setRunwayLength: (value: number) => void;
  initialAircraftType: string;
  setAircraftTypeHandler: (type: string) => void;
  initialRunwayHeading: number;
  setRunwayHeadingHandler: (heading: number) => void;
  initialWindDirection: number;
  setWindDirectionHandler: (direction: number) => void;
  initialWindSpeed: number;
  setWindSpeedHandler: (speed: number) => void;
  initialMagneticVar: number;
  setMagneticVarHandler: (variance: number) => void;
  initialEastOrWestVar: string;
  setEastOrWestVarHandler: (option: string) => void;
  runwayHeading: number;
  setRunwayHeading: (heading: number) => void;
  windDirection: number;
  setWindDirection: (direction: number) => void;
  windSpeed: number;
  setWindSpeed: (speed: number) => void;
  magneticVar: number;
  setMagneticVar: (variance: number) => void;
  eastOrWestVar: string;
  setEastOrWestVar: (option: string) => void;
  airportValues: Airport[];
  setAirportValues: (values: Airport[]) => void;
  addAirportValue: (newAirport: Airport) => void;
  removeAirportValue: (airportCode: string) => void;
  selectedAirport: Airport | null;
  setSelectedAirport: (airport: Airport | null) => void;
  selectedNotamType: string;
  setSelectedNotamType: (type: string) => void;
  selectedNotamTypeQuick: string;
  setSelectedNotamTypeQuick: (type: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchTermQuick: string;
  setSearchTermQuick: (term: string) => void;
  gfaType: string;
  setGfaType: (type: string) => void;
  gfaData: any;
  setGfaData: (data: any) => void;
  selectedTimestamp: number;
  setSelectedTimestamp: (timestamp: number) => void;
  allWeatherData: any;
  setAllWeatherData: (data: any) => void;
  airportCategories: Record<string, AirportCategory>;
  setAirportCategories: (categories: Record<string, AirportCategory>) => void;
  isCraneFilterActive: boolean;
  setIsCraneFilterActive: (active: boolean) => void;
  isCraneFilterActiveQuick: boolean;
  setIsCraneFilterActiveQuick: (active: boolean) => void;
  flightDetails: FlightDetails;
  setFlightDetails: (details: FlightDetails) => void;
  savedRoutings: Routing[];
  setSavedRoutings: (routings: Routing[]) => void;
  selectedForm: string;
  setSelectedForm: (form: string) => void;
  searchRouting: string;
  setSearchRouting: (value: string) => void;
  searchAirport: string;
  setSearchAirport: (value: string) => void;
  quickWeatherData: any;
  setQuickWeatherData: (data: any) => void;
  lastUpdated: number;
  setLastUpdated: (timestamp: number) => void;
  changedAirports: string[];
  setChangedAirports: (airports: string[]) => void;
  weatherData: any;
  setWeatherData: React.Dispatch<React.SetStateAction<any>>;
  weatherDataUpdated: boolean;
  setWeatherDataUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with a default value
const RccContext = createContext<RccContextType | undefined>(undefined);

// Custom hook to use the RccContext
export const useRccContext = () => {
  const context = useContext(RccContext);
  if (!context) {
    throw new Error('useRccContext must be used within an RccProvider');
  }
  return context;
};

// RccProvider component to wrap around parts of the app that need access to this context
export const RccProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures client-only logic
  }, []);

  const [aircraftType, setAircraftType] = useState("DHC-8");
  const [contaminationCoverage1, setContaminationCoverage1] = useState(" ");
  const [contaminationCoverage2, setContaminationCoverage2] = useState(" ");
  const [contaminationCoverage3, setContaminationCoverage3] = useState(" ");
  const [contaminationCoverage4, setContaminationCoverage4] = useState(" ");
  const [runwayConditionDescriptionGravel1, setRunwayConditionDescriptionGravel1] = useState("SELECT GRAVEL CONTAMINANT");
  const [runwayConditionDescriptionPaved2, setRunwayConditionDescriptionPaved2] = useState("SELECT PAVED CONTAMINANT");
  const [runwayConditionDescriptionGravel3, setRunwayConditionDescriptionGravel3] = useState("SELECT GRAVEL CONTAMINANT");
  const [runwayConditionDescriptionPaved4, setRunwayConditionDescriptionPaved4] = useState("SELECT PAVED CONTAMINANT");
  const [dropDownPavedOrGravel, setDropDownPavedOrGravel] = useState("GRAVEL");
  const [rwycc1, setRwycc1] = useState(6);
  const [rwycc2, setRwycc2] = useState(6);
  const [rwycc3, setRwycc3] = useState(6);
  const [correctedLandingDistance, setCorrectedLandingDistance] = useState(0);
  const [runwayLength, setRunwayLength] = useState(0);
  const [initialAircraftType, setAircraftTypeHandler] = useState("");
  const [initialRunwayHeading, setRunwayHeadingHandler] = useState(0);
  const [initialWindDirection, setWindDirectionHandler] = useState(0);
  const [initialWindSpeed, setWindSpeedHandler] = useState(0);
  const [initialMagneticVar, setMagneticVarHandler] = useState(0);
  const [initialEastOrWestVar, setEastOrWestVarHandler] = useState("");
  const [runwayHeading, setRunwayHeading] = useState(0);
  const [windDirection, setWindDirection] = useState(0);
  const [windSpeed, setWindSpeed] = useState(0);
  const [magneticVar, setMagneticVar] = useState(0);
  const [eastOrWestVar, setEastOrWestVar] = useState("West");
  const [searchRouting, setSearchRouting] = useState(''); // New search state for filtering routings
  const [searchAirport, setSearchAirport] = useState('');
  const [quickWeatherData, setQuickWeatherData] = useState<any>(null); // Initialize the quickWeatherData state
  const [changedAirports, setChangedAirports] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherDataUpdated, setWeatherDataUpdated] = useState(false);
  useEffect(() => {
    setIsClient(true); // Ensures client-only logic
  }, []);

  
  const [airportValues, setAirportValues] = useState<Airport[]>(() => {
    if (typeof window !== 'undefined') {
      const storedAirportValues = localStorage.getItem('airportValues');
      return storedAirportValues ? JSON.parse(storedAirportValues) : [];
    }
    return [];
  });

  // Client-side only useEffect for localStorage interactions
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('airportValues', JSON.stringify(airportValues));
    }
  }, [airportValues, isClient]);

  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [selectedNotamType, setSelectedNotamType] = useState('AERODROME');
  const [selectedNotamTypeQuick, setSelectedNotamTypeQuick] = useState('AERODROME');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermQuick, setSearchTermQuick] = useState('');
  const [gfaType, setGfaType] = useState('CLDWX');
  const [gfaData, setGfaData] = useState<any>(null);
  const [selectedTimestamp, setSelectedTimestamp] = useState(0);
  const [allWeatherData, setAllWeatherData] = useState<any>({});
  const [airportCategories, setAirportCategories] = useState<Record<string, AirportCategory>>({});
  const [isCraneFilterActive, setIsCraneFilterActive] = useState(true);
  const [isCraneFilterActiveQuick, setIsCraneFilterActiveQuick] = useState(true);
  const [selectedForm, setSelectedForm] = useState<string>('Routing Search');
  

  // Initialize flightDetails from localStorage (client-side check)
  const [flightDetails, setFlightDetails] = useState<FlightDetails>(() => {
    if (typeof window !== 'undefined') {
      const storedFlightDetails = localStorage.getItem('flightDetails');
      return storedFlightDetails ? JSON.parse(storedFlightDetails) : {
        flightNumber: '',
        departure: '',
        destination: '',
        icaoAirports: [], // Initialize as empty array
        icaoAirportALTN: [], // Initialize as empty array for alternate airports
      };
    }
    return {
      flightNumber: '',
      departure: '',
      destination: '',
      icaoAirports: [], // Initialize as empty array
      icaoAirportALTN: [], // Initialize as empty array for alternate airports
    };
  });

  // Save flightDetails to localStorage (client-side check)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('flightDetails', JSON.stringify(flightDetails));
    }
  }, [flightDetails, isClient]);

  // Initialize savedRoutings from localStorage (client-side check)
  const [savedRoutings, setSavedRoutings] = useState<Routing[]>(() => {
    if (typeof window !== 'undefined') {
      const storedRoutings = localStorage.getItem('savedRoutings');
      return storedRoutings ? JSON.parse(storedRoutings) : [];
    }
    return [];
  });

  // Save savedRoutings to localStorage (client-side check)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('savedRoutings', JSON.stringify(savedRoutings));
    }
  }, [savedRoutings, isClient]);

  // Functions to manage airportValues array
  const addAirportValue = (newAirport: Airport) => {
    setAirportValues((currentValues) => [...currentValues, newAirport]);
  };

  const removeAirportValue = (airportCode: string) => {
    setAirportValues(airportValues.filter(airport => airport.code !== airportCode));
  };

  return (
    <RccContext.Provider value={{
      aircraftType, setAircraftType,
      contaminationCoverage1, setContaminationCoverage1,
      contaminationCoverage2, setContaminationCoverage2,
      contaminationCoverage3, setContaminationCoverage3,
      contaminationCoverage4, setContaminationCoverage4,
      runwayConditionDescriptionGravel1, setRunwayConditionDescriptionGravel1,
      runwayConditionDescriptionPaved2, setRunwayConditionDescriptionPaved2,
      runwayConditionDescriptionGravel3, setRunwayConditionDescriptionGravel3,
      runwayConditionDescriptionPaved4, setRunwayConditionDescriptionPaved4,
      dropDownPavedOrGravel, setDropDownPavedOrGravel,
      rwycc1, setRwycc1,
      rwycc2, setRwycc2,
      rwycc3, setRwycc3,
      correctedLandingDistance, setCorrectedLandingDistance,
      runwayLength, setRunwayLength,
      initialAircraftType, setAircraftTypeHandler,
      initialRunwayHeading, setRunwayHeadingHandler,
      initialWindDirection, setWindDirectionHandler,
      initialWindSpeed, setWindSpeedHandler,
      initialMagneticVar, setMagneticVarHandler,
      initialEastOrWestVar, setEastOrWestVarHandler,
      runwayHeading, setRunwayHeading,
      windDirection, setWindDirection,
      windSpeed, setWindSpeed,
      magneticVar, setMagneticVar,
      eastOrWestVar, setEastOrWestVar,
      airportValues, setAirportValues,
      addAirportValue,
      removeAirportValue,
      selectedAirport, setSelectedAirport,
      selectedNotamType, setSelectedNotamType,
      selectedNotamTypeQuick, setSelectedNotamTypeQuick,
      searchTerm, setSearchTerm,
      searchTermQuick, setSearchTermQuick,
      gfaType, setGfaType,
      gfaData, setGfaData,
      selectedTimestamp, setSelectedTimestamp,
      allWeatherData, setAllWeatherData,
      airportCategories, setAirportCategories,
      isCraneFilterActive, setIsCraneFilterActive,
      isCraneFilterActiveQuick, setIsCraneFilterActiveQuick,
      flightDetails, setFlightDetails,
      savedRoutings, setSavedRoutings,
      selectedForm, setSelectedForm,
      searchRouting, setSearchRouting,
      searchAirport, setSearchAirport,
      quickWeatherData, setQuickWeatherData,
      lastUpdated,
      setLastUpdated,
      changedAirports,
      setChangedAirports,
      weatherData,
      setWeatherData,
      weatherDataUpdated,
      setWeatherDataUpdated,
    }}>
      {children}
    </RccContext.Provider>
  );
};