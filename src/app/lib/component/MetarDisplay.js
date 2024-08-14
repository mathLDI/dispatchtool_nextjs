// src/app/lib/component/MetarDisplay.js

import React from 'react';
import { parseMETAR } from './functions/weatherAndNotam';

const MetarDisplay = ({ weatherData }) => {
  if (!weatherData || weatherData.data.length === 0) {
    return <p>No METAR data available</p>;
  }

  return (
    <div>
      {weatherData.data
        .filter((item) => item.type === 'metar' || item.type === 'speci')
        .sort((a, b) => {
          const timeA = a.text.match(/\d{2}\d{4}Z/)[0];
          const timeB = b.text.match(/\d{2}\d{4}Z/)[0];
          return timeB.localeCompare(timeA);
        })
        .map((metar, index) => {
          const parsedMetar = parseMETAR(metar.text);
          const { metarString, ceiling, visibilityValue, category, color } = parsedMetar;

          const formattedText = formatMetarText(metarString, ceiling, visibilityValue, category);

          return (
            <div key={index} className="mb-4">
              <p className={color} dangerouslySetInnerHTML={{ __html: formattedText }}></p>
            </div>
          );
        })}
    </div>
  );
};

function formatMetarText(metarText, ceiling, visibility, category) {
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

  if (category === 'LIFR' || category === 'IFR') {
    if (ceiling < 1000 && ceilingMatch) {
      metarText = metarText.replace(
        ceilingMatch[0],
        `<strong>${ceilingMatch[0]}</strong>`
      );
    } else if (visibility < 3 && visibilityMatch) {
      metarText = metarText.replace(
        visibilityMatch[0],
        `<strong>${visibilityMatch[0]}</strong>`
      );
    }
  }

  metarText = metarText.replace(termsRegex, '<strong>$1</strong>');

  return metarText;
}

export default MetarDisplay;