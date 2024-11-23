// src/app/lib/services/latLongService.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface AirportData {
  airport_ident: string;
  le_latitude_deg: number;
  le_longitude_deg: number;
}

export const getLatLong = () => {
  const filePath = path.join(process.cwd(), 'src', 'app', 'lib', 'data', 'runways.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  const latLongMap: { [key: string]: { latitude: number; longitude: number } } = {};
  records.forEach((record: AirportData) => {
    if (record.airport_ident && record.le_latitude_deg && record.le_longitude_deg) {
      latLongMap[record.airport_ident] = {
        latitude: record.le_latitude_deg,
        longitude: record.le_longitude_deg
      };
    }
  });

  return latLongMap;
};