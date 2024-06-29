import React, { createContext, useContext, useState } from 'react';

// Define the shape of the context state
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
  runwayHeading: number; // Add runwayHeading here
  setRunwayHeading: (heading: number) => void; // Add setRunwayHeading here
  windDirection: number;
  setWindDirection: (direction: number) => void;
  windSpeed: number;
  setWindSpeed: (speed: number) => void;
  magneticVar: number;
  setMagneticVar: (variance: number) => void;
  eastOrWestVar: string;
  setEastOrWestVar: (option: string) => void;
  airportValue: string;
  setAirportValue: (value: string) => void;
  weatherData: any; // Consider specifying a more detailed type if possible
  setWeatherData: (data: any) => void;
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
  const [aircraftType, setAircraftType] = useState("DHC-8");
  const [contaminationCoverage1, setContaminationCoverage1] = useState("");
  const [contaminationCoverage2, setContaminationCoverage2] = useState("");
  const [contaminationCoverage3, setContaminationCoverage3] = useState("");
  const [contaminationCoverage4, setContaminationCoverage4] = useState("");
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
  const [airportValue, setAirportValue] = useState('');
  const [weatherData, setWeatherData] = useState(null);

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
      airportValue, setAirportValue,
      weatherData, setWeatherData,
    }}>
      {children}
    </RccContext.Provider>
  );
};
