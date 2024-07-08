'use client';

import React, { useEffect } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext'; // Use relative path
import AirportSearchForm from './AirportSearchForm'; // Import the new component

// Function to format TAF text
function formatTAF(tafText) {
  if (!tafText) return '';

  const switchTerms = ["BECMG", "TEMPO", "PROB30", "PROB40", "FM"];
  const regex = new RegExp(`\\b(${switchTerms.join('|')})\\b`, 'g');

  const formattedText = tafText.replace(regex, '\n$1');
  const lines = formattedText.split('\n');

  const processedLines = [];
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (switchTerms.some(term => trimmedLine.startsWith(term))) {
      processedLines.push(trimmedLine);
    } else if (processedLines.length > 0) {
      const lastLine = processedLines.pop();
      processedLines.push(lastLine + ' ' + trimmedLine);
    } else {
      processedLines.push(trimmedLine);
    }
  });

  return processedLines.join('\n').trim();
}

// Function to determine flight category and corresponding text color
function getFlightCategory(ceiling, visibility) {
  if (ceiling < 500 || visibility < 1) {
    return { category: 'LIFR', color: 'text-pink-500' }; // Light pink for LIFR
  } else if (ceiling < 1000 || visibility < 3) {
    return { category: 'IFR', color: 'text-red-500' }; // Red for IFR
  } else if (ceiling < 3000 || visibility < 5) {
    return { category: 'MVFR', color: 'text-blue-500' }; // Blue for MVFR
  } else if (ceiling >= 3000 && visibility >= 5) {
    return { category: 'VFR', color: 'text-green-500' }; // Green for VFR
  } else {
    return { category: 'Unknown', color: 'text-gray-500' }; // Gray for Unknown
  }
}

export default function ClientComponent({ fetchWeather }) {
  const { weatherData, selectedAirport, setWeatherData } = useRccContext();

  useEffect(() => {
    if (selectedAirport) {
      fetchWeather(selectedAirport.code).then(data => {
        setWeatherData(data);
      });
    }
  }, [selectedAirport, fetchWeather, setWeatherData]);

  useEffect(() => {
    if (weatherData) {
      console.log('Updated Weather Data:', weatherData);
    }
  }, [weatherData]);

  return (
    <div className="flex h-full">
      <div className="fixed z-10">
        <AirportSearchForm fetchWeather={fetchWeather} />
      </div>

      <div className="flex-1 overflow-y-auto pt-16">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[500px]">
            <h1 className="py-5">METAR</h1>
            <Card title="Weather" className="bg-blue-200">
              <div>
                {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                  weatherData.data
                    .filter((item) => item.type === 'metar')
                    .sort((a, b) => {
                      const timeA = a.text.match(/\d{4}Z/);
                      const timeB = b.text.match(/\d{4}Z/);
                      return timeB[0].localeCompare(timeA[0]);
                    })
                    .map((metar, index) => {
                      const metarText = metar.text;
                      const ceilingMatch = metarText.match(/(BKN|OVC|VV)(\d{3})/);
                      const visibilityMatch = metarText.match(/(\d+(\s?\d?\/?\d*)?SM)/);
                      const variableWindMatch = metarText.match(/\d{3}V\d{3}/);

                      const ceiling = ceilingMatch ? parseInt(ceilingMatch[2]) * 100 : Infinity;
                      const visibility = visibilityMatch ? parseFloat(visibilityMatch[1].replace(/\//, '.')) : Infinity;

                      const { category, color } = getFlightCategory(ceiling, visibility);

                      let formattedText = metarText;
                      if ((category === 'IFR' || category === 'LIFR')) {
                        if (ceilingMatch && (!variableWindMatch || metarText.indexOf(ceilingMatch[0]) < metarText.indexOf(variableWindMatch[0]))) {
                          formattedText = formattedText.replace(ceilingMatch[0], `<strong>${ceilingMatch[0]}</strong>`);
                        }
                        if (visibilityMatch) {
                          formattedText = formattedText.replace(visibilityMatch[0], `<strong>${visibilityMatch[0]}</strong>`);
                        }
                      }

                      return (
                        <div key={index} className="mb-4">
                          <p className={color} dangerouslySetInnerHTML={{ __html: formattedText }}></p>
                        </div>
                      );
                    })
                ) : (
                  <p>No METAR data available</p>
                )}
              </div>
            </Card>
            <h1 className="py-5">TAF</h1>
            <Card title="Weather" className="bg-blue-200">
              <div>
                {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                  formatTAF(weatherData.data.find((item) => item.type === 'taf')?.text || 'No TAF data available')
                    .split('\n')
                    .map((line, index) => (
                      <p key={index}>{line}</p>
                    ))
                ) : (
                  <p>No weather data available</p>
                )}
              </div>
            </Card>
          </div>
          
          <div className="flex-1 min-w-[500px]">
            <h1 className="py-5">NOTAM</h1>
            <Card title="Weather" className="bg-blue-200">
              <div>
                {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                  weatherData.data.filter((item) => item.type === 'notam').length > 0 ? (
                    weatherData.data.filter((item) => item.type === 'notam').map((notam, index) => (
                      <div key={index} className="mb-4">
                        {notam.text.split('\n').map((line, lineIndex) => (
                          <p key={lineIndex} className="mb-1">{line}</p>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p>No NOTAM data available</p>
                  )
                ) : (
                  <p>No weather data available</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
