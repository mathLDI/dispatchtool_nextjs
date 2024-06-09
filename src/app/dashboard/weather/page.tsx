"use client"

import React, { useState } from 'react';
import { useRccContext } from '../RccCalculatorContext'; // Use relative path

const Page: React.FC = () => {
  const { aircraftType, setAircraftType } = useRccContext();

  console.log("aircraftType for page TSX:", aircraftType);

  return (
    <div>
      <p>Weather Page</p>
      <div>
        <p>Current Aircraft Type: {aircraftType}</p>
        <button onClick={() => setAircraftType("Boeing 989")}>Change Aircraft Type</button>
      </div>
    </div>
  );
};

export default Page;
