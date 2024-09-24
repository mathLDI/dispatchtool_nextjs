import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { allAirportsFlightCategory, transformAllWeatherDataToAirportValues } from './functions/weatherAndNotam'; // Ensure correct imports

const AirportDotCategory = ({ allWeatherData }) => {
  const [airportCategories, setAirportCategories] = useState({});
  const [transformedAirports, setTransformedAirports] = useState([]);

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
    <div className="airport-dot-category">
      {airportsWithWeather.map((airportCode) => {
        const airportCategory = airportCategories?.[airportCode];
        const category = airportCategory?.category || 'Unknown';
        const colorClass = airportCategory?.color || 'text-gray-500';

        return (
          <div key={airportCode} className="flex items-center space-x-2 bg-red-300">
            <span>{airportCode}</span>
            <span className={`ml-2 ${colorClass}`} style={{ fontSize: '1.5rem' }}>
              &#9679;
            </span>
            <span className="text-sm">{category}</span>
          </div>
        );
      })}
    </div>
  );
};

AirportDotCategory.propTypes = {
  allWeatherData: PropTypes.object.isRequired,
};

export default AirportDotCategory;
