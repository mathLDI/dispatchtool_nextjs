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

  // Replace matched terms with a newline followed by the term
  const formattedText = tafText.replace(regex, '\n$1');

  // Split the formatted text into lines
  const lines = formattedText.split('\n');

  // Further process each line to ensure proper alignment of weather elements
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
                    .map((metar, index) => (
                      <div key={index} className="mb-4">
                        <p>{metar.text}</p>
                      </div>
                    ))
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
