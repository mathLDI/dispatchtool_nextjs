// src/app/lib/services/runwayService.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Data source note: airport and runway metadata used here comes from OurAirports
// https://ourairports.com/
// The data is stored locally as a CSV in src/app/lib/data/runways.csv.

export interface RunwayData {
  airport_ident: string;
  le_ident: string;
  he_ident: string;
}

type RunwayMap = Record<string, string[]>;

let runwayMapCache: RunwayMap | null = null;

function loadRunwayMap(): RunwayMap {
  if (runwayMapCache) {
    return runwayMapCache;
  }

  const filePath = path.join(process.cwd(), 'src', 'app', 'lib', 'data', 'runways.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  const runwayMap: RunwayMap = {};
  records.forEach((record: RunwayData) => {
    if (!runwayMap[record.airport_ident]) {
      runwayMap[record.airport_ident] = [];
    }
    runwayMap[record.airport_ident].push(`${record.le_ident}/${record.he_ident}`);
  });

  runwayMapCache = runwayMap;
  return runwayMap;
}

export const getRunways = (airportCode?: string): RunwayMap => {
  const runwayMap = loadRunwayMap();

  if (!airportCode) {
    return runwayMap;
  }

  const normalizedAirportCode = airportCode.toUpperCase();
  return {
    [normalizedAirportCode]: runwayMap[normalizedAirportCode] || [],
  };
};