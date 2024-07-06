'use client';

import React, { useEffect } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext'; // Use relative path
import WeatherForm from './WeatherForm'; // Import the new component

export default function ClientComponent({ fetchWeather }) {
  const { weatherData, selectedAirport } = useRccContext();

  useEffect(() => {
    if (weatherData) {
      console.log('Updated Weather Data:', weatherData);
    }
  }, [weatherData]);


  return (
    <div className="flex h-full">
      
      <div className="flex bg-rose-900  fixed top-0 bottom-0 p-5">
        <WeatherForm fetchWeather={fetchWeather} />
      </div>

      <div className="flex-1 ml-64 p-5 overflow-y-auto">
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
              <p>{weatherData.data.find(item => item.type === 'taf')?.text || 'No TAF data available'}</p>
            ) : (
              <p>No weather data available</p>
            )}
          </div>
        </Card>
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
  );
}
