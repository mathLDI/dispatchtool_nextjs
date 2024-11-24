// src/app/dashboard/quickSearch/QuickTafDisplay.js

import React from 'react';
import { parseMETARForCeilingAndVisibility, getFlightCategory } from '../../lib/component/functions/weatherAndNotam';

const QuickTafDisplay = ({ quickWeatherData }) => {
  if (!quickWeatherData || quickWeatherData.data.length === 0) {
    return <p>No TAF data available</p>;
  }

  const tafText = quickWeatherData.data.find((item) => item.type === 'taf')?.text;

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
    // Use METAR parsing logic for consistent handling
    const { ceiling, visibilityValue } = parseMETARForCeilingAndVisibility(line);
    const { category, color } = getFlightCategory(ceiling, visibilityValue);

    if (index === 0) {
      firstLineCategory = category;
      firstLineColor = color;
    }

    if (line.startsWith('FM')) {
      currentCategory = category;
      currentColor = color;
    }

    const lineColor =
      ceiling !== Infinity || visibilityValue !== Infinity
        ? color
        : currentColor !== 'text-gray-500'
        ? currentColor
        : firstLineColor;

    return (
      <p key={index} className={`${lineColor} mb-1.5`}>
        {line}
      </p>
    );
  });
}



export default QuickTafDisplay;