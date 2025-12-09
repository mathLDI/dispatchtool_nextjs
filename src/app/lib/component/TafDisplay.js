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

    // Format line with bold highlighting for determining elements
    const formattedLine = formatTafLineJSX(line, ceiling, visibility, category);

    return (
      <p key={index} className={`${lineColor} mb-1.5`}>
        {formattedLine}
      </p>
    );
  });
}

function formatTafLineJSX(line, ceiling, visibility, category) {
  const ceilingRegex = /\b(OVC|BKN|VV)\d{3}\b/;
  const visibilityRegex = /\b(\d+\s?\d?\/?\d*SM|\d+\/\d+SM)\b/;

  const ceilingMatch = line.match(ceilingRegex);
  const visibilityMatch = line.match(visibilityRegex);

  // Determine which element (ceiling or visibility) determines the category
  let boldCeiling = false;
  let boldVisibility = false;

  if (category !== 'VFR' && category !== 'Unknown' && category !== 'LWIS') {
    if (category === 'LIFR') {
      if (ceiling < 500 && visibility >= 1) {
        boldCeiling = true;
      } else if (visibility < 1 && ceiling >= 500) {
        boldVisibility = true;
      } else if (ceiling < 500 && visibility < 1) {
        boldCeiling = ceiling < visibility ? true : false;
        boldVisibility = !boldCeiling;
      }
    } else if (category === 'IFR') {
      if (ceiling >= 500 && ceiling < 1000 && visibility >= 3) {
        boldCeiling = true;
      } else if (visibility >= 1 && visibility < 3 && ceiling >= 1000) {
        boldVisibility = true;
      } else if (ceiling >= 500 && ceiling < 1000 && visibility >= 1 && visibility < 3) {
        boldCeiling = (1000 - ceiling) > (3 - visibility) ? true : false;
        boldVisibility = !boldCeiling;
      }
    } else if (category === 'MVFR') {
      if (ceiling >= 1000 && ceiling <= 3000 && visibility > 5) {
        boldCeiling = true;
      } else if (visibility >= 3 && visibility <= 5 && ceiling > 3000) {
        boldVisibility = true;
      } else if (ceiling >= 1000 && ceiling <= 3000 && visibility >= 3 && visibility <= 5) {
        boldCeiling = (3000 - ceiling) < (5 - visibility) ? true : false;
        boldVisibility = !boldCeiling;
      }
    }
  }

  const elements = line.split(' ').map((part, idx) => {
    if (boldCeiling && ceilingMatch && part.includes(ceilingMatch[0])) {
      return <strong key={idx}>{part}</strong>;
    } else if (boldVisibility && visibilityMatch && part.includes(visibilityMatch[0])) {
      return <strong key={idx}>{part}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });

  // Interleave spaces between elements for proper rendering
  const result = [];
  elements.forEach((elem, idx) => {
    result.push(elem);
    if (idx < elements.length - 1) {
      result.push(' ');
    }
  });
  return <>{result}</>;
}


function getFlightCategory(ceiling, visibility) {
  // LIFR: ceiling < 500 feet OR visibility < 1 mile
  if (ceiling < 500 || visibility < 1) {
    return { category: 'LIFR', color: 'text-custom-lifr' };
  }
  // IFR: ceiling 500-999 feet OR visibility 1-2.99 miles
  else if ((ceiling >= 500 && ceiling < 1000) || (visibility >= 1 && visibility < 3)) {
    return { category: 'IFR', color: 'text-custom-ifr' };
  }
  // MVFR: ceiling 1000-3000 feet OR visibility 3-5 miles
  else if ((ceiling >= 1000 && ceiling <= 3000) || (visibility >= 3 && visibility <= 5)) {
    return { category: 'MVFR', color: 'text-custom-mvfr' };
  }
  // VFR: ceiling > 3000 feet AND visibility > 5 miles
  else if (ceiling > 3000 && visibility > 5) {
    return { category: 'VFR', color: 'text-custom-vfr' };
  }
  // Unknown: when conditions cannot be determined
  else {
    return { category: 'Unknown', color: 'text-gray-500' };
  }
}

export default TafDisplay;