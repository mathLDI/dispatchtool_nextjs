// src/app/lib/component/TafDisplay.js

import React, { useEffect } from 'react';
import { useRccContext } from '../../dashboard/RccCalculatorContext';
import { parseVisibility } from './functions/weatherAndNotam';


const TafDisplay = ({ weatherData }) => {
  const { weatherDataUpdated, setWeatherDataUpdated } = useRccContext();

  // Handle weather data updates
  useEffect(() => {
    if (weatherDataUpdated) {
      setWeatherDataUpdated(false);
    }
  }, [weatherDataUpdated, setWeatherDataUpdated]);

  if (!weatherData || weatherData.data.length === 0) {
    return <p>No TAF data available</p>;
  }

  const tafText = weatherData.data.find((item) => item.type === 'taf')?.text;

  if (!tafText) {
    return <p>No TAF data available</p>;
  }

  return <div>{formatTAF(tafText)}</div>;
};


function formatTAF(tafText) {
  if (!tafText) return '';

  // Replace all occurrences of "−" with "-" 
  tafText = tafText.replace(/−/g, '-');

  const switchTerms = ['BECMG', 'TEMPO', 'PROB30', 'PROB40', 'FM'];
  const regex = new RegExp(`\\b(${switchTerms.join('|')})\\b`, 'g');

  const formattedText = tafText.replace(regex, '\n$1');
  const lines = formattedText.split('\n');

  const processedLines = [];
  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (switchTerms.some((term) => trimmedLine.startsWith(term))) {
      processedLines.push(trimmedLine);
    } else if (processedLines.length > 0) {
      const lastLine = processedLines.pop();
      processedLines.push(lastLine + ' ' + trimmedLine);
    } else {
      processedLines.push(trimmedLine);
    }
  });

  let currentCategory = 'Unknown';
  let currentColor = 'text-gray-500';
  let firstLineCategory = 'Unknown';
  let firstLineColor = 'text-gray-500';

  return processedLines.map((line, index) => {
    let ceiling = Infinity;
    
    // Parse ceiling
    const ceilingMatch = line.match(/\b(OVC|BKN|VV)\d{3}\b/);
    if (ceilingMatch) {
      ceiling = parseInt(ceilingMatch[0].slice(-3)) * 100;
    }

    // Use parseVisibility for consistent visibility parsing
    const visibility = parseVisibility(line);

    const { category, color } = getFlightCategory(ceiling, visibility);

    if (index === 0) {
      firstLineCategory = category;
      firstLineColor = color;
    }

    if (line.startsWith('FM')) {
      currentCategory = category;
      currentColor = color;
    }

    let lineColor =
      ceiling !== Infinity || visibility !== Infinity
        ? color
        : currentColor !== 'text-gray-500'
        ? currentColor
        : firstLineColor;
    
    // Only override to VFR if NSW present AND no ceiling/visibility values
    if (line.includes('NSW') && ceiling === Infinity && visibility === Infinity) {
      lineColor = 'text-custom-vfr';
    }

    return (
      <p key={index} className={`${lineColor} mb-1.5`}>
        {line}
      </p>
    );
  });
}


function getFlightCategory(ceiling, visibility) {
  if (ceiling < 500 || visibility < 1) {
    return { category: 'LIFR', color: 'text-custom-lifr' };
  } else if (ceiling < 1000 || visibility < 3) {
    return { category: 'IFR', color: 'text-custom-ifr' };
  } else if (ceiling <= 3000 || visibility <= 5) {
    return { category: 'MVFR', color: 'text-custom-mvfr' };
  } else if (ceiling > 3000 && visibility > 5) {
    return { category: 'VFR', color: 'text-custom-vfr' };
  } else {
    return { category: 'Unknown', color: 'text-gray-500' };
  }
}

export default TafDisplay;