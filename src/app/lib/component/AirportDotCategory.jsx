import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRccContext } from '@/app/dashboard/RccCalculatorContext';
import { allAirportsFlightCategory, transformAllWeatherDataToAirportValues } from './functions/weatherAndNotam'; // Ensure correct imports

const AirportDotCategory = ({ allWeatherData }) => {
  const [airportCategories, setAirportCategories] = useState({});
  const [transformedAirports, setTransformedAirports] = useState([]);
  const { selectedAirport } = useRccContext();

  useEffect(() => {
    // Combine ICAO Airports and ICAO Alternate Airports into one list
    const transformed = transformAllWeatherDataToAirportValues(allWeatherData);
    setTransformedAirports(transformed);
  }, [allWeatherData]);

  useEffect(() => {
    if (allWeatherData && transformedAirports.length > 0) {
      const categories = allAirportsFlightCategory(transformedAirports, allWeatherData);
      setAirportCategories(categories);
    }
  }, [allWeatherData, transformedAirports]);

  const airportsWithWeather = Object.keys(allWeatherData || {});

  if (!airportsWithWeather.length) {
    return <div>No airports with weather data available.</div>;
  }

  return (
    <div className="airport-dot-category bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
      <h3 className="text-sm font-bold mb-2">Weather Status</h3>
      <div className="flex flex-wrap gap-3">
        {airportsWithWeather.map((airportCode) => {
          const airportCategory = airportCategories?.[airportCode];
          const category = airportCategory?.category || 'Unknown';
          const colorClass = airportCategory?.color || 'text-gray-500';
          const isSelected = selectedAirport?.code === airportCode;

          return (
            <div 
              key={airportCode} 
              className={`flex items-center space-x-2 p-2 rounded-md transition-all ${
                isSelected 
                  ? 'bg-sky-200 dark:bg-sky-700 border-2 border-sky-500 shadow-lg' 
                  : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
              }`}
            >
              <span className="font-semibold">{airportCode}</span>
              <span className={`${colorClass}`} style={{ fontSize: '1.2rem' }}>
                ●
              </span>
              <span className="text-xs font-medium">{category}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

AirportDotCategory.propTypes = {
  allWeatherData: PropTypes.object.isRequired,
};

export default AirportDotCategory;
