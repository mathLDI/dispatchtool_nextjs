// src/app/lib/services/runwayService.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface RunwayData {
  airport_ident: string;
  le_ident: string;
  he_ident: string;
}

export const getRunways = () => {
  const filePath = path.join(process.cwd(), 'src', 'app', 'lib', 'data', 'runways.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  const runwayMap: { [key: string]: string[] } = {};
  records.forEach((record: RunwayData) => {
    if (!runwayMap[record.airport_ident]) {
      runwayMap[record.airport_ident] = [];
    }
    runwayMap[record.airport_ident].push(`${record.le_ident}/${record.he_ident}`);
  });

  return runwayMap;
};