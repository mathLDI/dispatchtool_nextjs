"use client"

// src/app/dashboard/AircraftContext.tsx

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
}

// Create the context with a default value
const RccContext = createContext<RccContextType | undefined>(undefined);

// Custom hook to use the AircraftContext
export const useRccContext = () => {
  const context = useContext(RccContext);
  if (!context) {
    throw new Error('useRccContext must be used within an RccProvider');
  }
  return context;
};

// AircraftProvider component to wrap around parts of the app that need access to this context
export const RccProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [aircraftType, setAircraftType] = useState("DHC-8");
  const [contaminationCoverage1, setContaminationCoverage1] = useState("");
  const [contaminationCoverage2, setContaminationCoverage2] = useState("");
  const [contaminationCoverage3, setContaminationCoverage3] = useState("");
  const [contaminationCoverage4, setContaminationCoverage4] = useState("");
  const [runwayConditionDescriptionGravel1, setRunwayConditionDescriptionGravel1] = useState("");
  const [runwayConditionDescriptionPaved2, setRunwayConditionDescriptionPaved2] = useState("");
  const [runwayConditionDescriptionGravel3, setRunwayConditionDescriptionGravel3] = useState("");
  const [runwayConditionDescriptionPaved4, setRunwayConditionDescriptionPaved4] = useState("");
  const [dropDownPavedOrGravel, setDropDownPavedOrGravel] = useState("");

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
      dropDownPavedOrGravel, setDropDownPavedOrGravel
    }}>
      {children}
    </RccContext.Provider>
  );
};
