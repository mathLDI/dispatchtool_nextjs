import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { allAirportsFlightCategory, transformAllWeatherDataToAirportValues } from './functions/weatherAndNotam'; // Import from the correct path

const AirportDotCategory = ({ allWeatherData }) => {
  const [airportCategories, setAirportCategories] = useState({});
  const [transformedAirports, setTransformedAirports] = useState([]);

  // Perform the transformation of allWeatherData to airportValues-like structure
  useEffect(() => {
    const transformed = transformAllWeatherDataToAirportValues(allWeatherData);
    console.log('Transformed Airports:', transformed); // Log the result for debugging
    setTransformedAirports(transformed); // Store the transformed airports
  }, [allWeatherData]);

  // Calculate airport categories based on the transformed airports and weather data
  useEffect(() => {
    if (allWeatherData && transformedAirports.length > 0) {
      const categories = allAirportsFlightCategory(transformedAirports, allWeatherData);
      console.log('Calculated airport categories:', categories); // Log the result for debugging
      setAirportCategories(categories);
    }
  }, [allWeatherData, transformedAirports]);

  // Create an array of airports that have weather data
  const airportsWithWeather = Object.keys(allWeatherData || {});

  // If no weather data is available, return a message
  if (!airportsWithWeather.length) {
    return <div>No airports with weather data available.</div>;
  }

  // Render the categories and transformed airports in the UI for debugging purposes
  return (
    <div className="airport-dot-category">

      
      {airportsWithWeather.map((airportCode) => {
        const airportCategory = airportCategories?.[airportCode]; // Safely check if the category exists
        const category = airportCategory?.category || 'Unknown';  // Fallback to 'Unknown' if category is undefined
        const colorClass = airportCategory?.color || 'text-gray-500';  // Fallback to gray if color is undefined

        return (
          <div key={airportCode} className="flex items-center space-x-2 bg-red-300">
            <span>{airportCode}</span>
            {/* Display the color dot for each airport */}
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
  allWeatherData: PropTypes.object.isRequired, // allWeatherData is required for the component
};

export default AirportDotCategory;
