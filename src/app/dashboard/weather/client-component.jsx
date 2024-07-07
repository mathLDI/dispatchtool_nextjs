'use client';

import React, { useEffect } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext'; // Use relative path
import AirportSearchForm from './AirportSearchForm'; // Import the new component

/////////////////////////TAF FORMAT FUNCTION///////////////////////////
// Updated function to format TAF text
function formatTAF(tafText) {
  // Define the terms that should cause a line switch
  const switchTerms = ["BECMG", "TEMPO", "PROB", "FM"];
  
  // Split the TAF text into words
  const words = tafText.split(" ");
  
  // Process each word to insert newline characters as needed
  const processedWords = words.map((word, index) => {
    // Check if the word is one of the switch terms
    if (switchTerms.includes(word)) {
      // Insert a newline character before the word, except for the first term
      return `${index > 0 ? '\n' : ''}${word}`;
    }
    return word;
  });
  
  // Join the processed words back into a string and trim any leading/trailing whitespace
  return processedWords.join(" ").trim();
}
///////////////////////////////////////////////////////////////////////////////



export default function ClientComponent({ fetchWeather }) {
  const { weatherData, selectedAirport } = useRccContext();

  useEffect(() => {
    if (weatherData) {
      console.log('Updated Weather Data:', weatherData);
    }
  }, [weatherData]);

  return (
    <div className="flex h-full bg-lime-200 ">
      {/* AirportSearchForm is now at the top */}
      <div className="flex fixed  z-10 ">
        <AirportSearchForm fetchWeather={fetchWeather} />
      </div>

      <div className="flex-1 overflow-y-auto pt-16"> {/* Adjust padding-top to ensure content is not hidden behind the fixed position form */}
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ flex: 1 }}> {/* Left container */}
            <h1 className='py-5'>METAR</h1>
            <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>
              <div>
                {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                  weatherData.data
                    .filter(item => item.type === 'metar')
                    .sort((a, b) => {
                      const timeA = a.text.match(/\d{4}Z/);
                      const timeB = b.text.match(/\d{4}Z/);
                      return timeB[0].localeCompare(timeA[0]);
                    })
                    .map((metar, index) => (
                      <div key={index} className="mb-4"> {/* Add margin bottom for spacing */}
                        <p>{metar.text}</p>
                      </div>
                    ))
                ) : (
                  <p>No METAR data available</p>
                )}
              </div>
            </Card>
            <h1 className='py-5'>TAF</h1>
            <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>
              <div>
                {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                  formatTAF(weatherData.data.find(item => item.type === 'taf')?.text || 'No TAF data available')
                    .split('\n') // Split the formatted TAF by newline characters
                    .map((line, index) => (
                      <p key={index}>{line}</p> // Render each line in a separate paragraph
                    ))
                ) : (
                  <p>No weather data available</p>
                )}
              </div>
            </Card>
          </div>
          
          <div style={{ flex: 1 }}> {/* Right container */}
            <h1 className='py-5'>NOTAM</h1>
            <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>
              <div>
                {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                  weatherData.data.filter(item => item.type === 'notam').length > 0 ? (
                    weatherData.data.filter(item => item.type === 'notam').map((notam, index) => (
                      <div key={index} className="mb-4"> {/* Adjust mb-4 for the desired gap between NOTAMs */}
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