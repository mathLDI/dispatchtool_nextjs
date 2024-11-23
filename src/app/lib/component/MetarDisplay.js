// src/app/lib/component/MetarDisplay.js

import React, { useMemo, useEffect } from 'react';
import { parseMETAR } from './functions/weatherAndNotam';
import { useRccContext } from '../../dashboard/RccCalculatorContext';


const MetarDisplay = ({ weatherData }) => {
  const { weatherDataUpdated, setWeatherDataUpdated } = useRccContext();

  // Handle weather data updates
  useEffect(() => {
    if (weatherDataUpdated) {
      setWeatherDataUpdated(false);
    }
  }, [weatherDataUpdated, setWeatherDataUpdated]);

  // Existing memoization logic
  const metarContent = useMemo(() => {
    if (!weatherData || weatherData.data.length === 0) {
      return <p>No METAR data available</p>;
    }

    return weatherData.data
      .filter((item) => item.type === 'metar' || item.type === 'speci')
      .sort((a, b) => {
        const timeA = a.text.match(/\d{2}\d{4}Z/)[0];
        const timeB = b.text.match(/\d{2}\d{4}Z/)[0];
        return timeB.localeCompare(timeA);
      })
      .slice(0, 4) // Limit to the last 4 METARs
      .map((metar, index) => {
        const parsedMetar = parseMETAR(metar.text);
        const { metarString, ceiling, visibilityValue, category, color } = parsedMetar;

        return (
          <div key={index} className="mb-1.5">
            <p className={color}>{formatMetarTextJSX(metarString, ceiling, visibilityValue, category)}</p>
          </div>
        );
      });
  }, [weatherData]);

  return <div>{metarContent}</div>;
};

export default MetarDisplay;


// Convert formatted METAR text to JSX elements for better control
function formatMetarTextJSX(metarText, ceiling, visibility, category) {
  const ceilingRegex = /\b(VV|OVC|BKN|FEW|SCT)\d{3}\b/;
  const visibilityRegex = /\b(\d+\s?\d?\/?\d*SM|\d+\/\d+SM)\b/;

  const termsToHighlight = [
    '\\+SHRA',
    '\\-SHRA',
    '\\SHRA',
    '\\+TSRA',
    '\\TSRA',
    '\\-TSRA',
    '\\VCTS',
    '\\+RA',
    'RA',
    'TS',
    '\\+TS',
    '\\-TS',
    '\\+BLSN',
    'BLSN',
    'SN',
    '\\+SN',
    'LLWS',
    'CB',
    'SQ',
    'FC',
    'BL',
    'SH',
    '\\+SH',
    '\\-SH',
    'GR',
    '\\+FZ',
    'FZ',
  ];
  const termsRegex = new RegExp(`(${termsToHighlight.join('|')})`, 'g');

  const ceilingMatch = metarText.match(ceilingRegex);
  const visibilityMatch = metarText.match(visibilityRegex);

  // Use JSX to handle the rendering of highlighted terms and important information
  return metarText.split(' ').map((part, index) => {
    // Apply strong tags for important ceiling/visibility terms
    if (category === 'LIFR' || category === 'IFR') {
      if (ceiling < 1000 && ceilingMatch && part.includes(ceilingMatch[0])) {
        return <strong key={index}>{part} </strong>;
      } else if (visibility < 3 && visibilityMatch && part.includes(visibilityMatch[0])) {
        return <strong key={index}>{part} </strong>;
      }
    }

    // Apply strong tags for any other weather terms we want to highlight
    if (termsRegex.test(part)) {
      return <strong key={index}>{part} </strong>;
    }

    // Otherwise, return the normal part
    return <span key={index}>{part} </span>;
  });
}

