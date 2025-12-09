import React from 'react';
import { parseMETAR } from './QuickWeatherAndNotam';

// Helper function to remove variable winds component
function removeVariableWinds(metarString) {
  return metarString.replace(/\s\d{3}V\d{3}\b/, '');
}

const QuickMetarDisplay = ({ quickWeatherData }) => {
  if (!quickWeatherData || quickWeatherData.data.length === 0) {
    return <p>No METAR data available</p>;
  }

  return (
    <div>
      {quickWeatherData.data
        .filter((item) => item.type === 'metar' || item.type === 'speci')
        .sort((a, b) => {
          const timeA = a.text.match(/\d{2}\d{4}Z/)[0];
          const timeB = b.text.match(/\d{2}\d{4}Z/)[0];
          return timeB.localeCompare(timeA);
        })
        .slice(0, 4)
        .map((metar, index) => {
          const originalMetar = metar.text;
          const cleanedMetar = removeVariableWinds(originalMetar);
          const parsedMetar = parseMETAR(cleanedMetar);
          const { ceiling, visibilityValue, category, color } = parsedMetar;

          return (
            <div key={index} className="mb-1.5">
              <p className={color}>{formatMetarTextJSX(originalMetar, ceiling, visibilityValue, category)}</p>
            </div>
          );
        })}
    </div>
  );
};

function formatMetarTextJSX(metarText, ceiling, visibility, category) {
  
  metarText = metarText.replace(/−/g, '-');

  const ceilingRegex = /\b(VV|OVC|BKN)\d{3}\b/;
  const visibilityRegex = /\b(\d+\s?\d?\/?\d*SM|\d+\/\d+SM)\b/;

  const termsToHighlight = [
    '\\+SHRA', '\\-SHRA', '\\SHRA', '\\+TSRA', '\\TSRA', '\\-TSRA',
    '\\VCTS', '\\+RA', 'RA', 'TS', '\\+TS', '\\-TS', '\\+BLSN',
    'BLSN', 'SN', '\\+SN', 'LLWS', 'CB', 'SQ', 'FC', 'BL', 'SH',
    '\\+SH', '\\-SH', 'GR', '\\+FZ', 'FZ',
  ];
  const termsRegex = new RegExp(`(${termsToHighlight.join('|')})`, 'g');

  const ceilingMatch = metarText.match(ceilingRegex);
  const visibilityMatch = metarText.match(visibilityRegex);

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

  const elements = metarText.split(' ').map((part, index) => {
    if (boldCeiling && ceilingMatch && part.includes(ceilingMatch[0])) {
      return <strong key={index}>{part}</strong>;
    } else if (boldVisibility && visibilityMatch && part.includes(visibilityMatch[0])) {
      return <strong key={index}>{part}</strong>;
    }

    if (termsRegex.test(part)) {
      return <strong key={index}>{part}</strong>;
    }

    return <span key={index}>{part}</span>;
  });

  // Interleave spaces between elements
  const result = [];
  elements.forEach((elem, idx) => {
    result.push(elem);
    if (idx < elements.length - 1) {
      result.push(' ');
    }
  });
  return <>{result}</>;
}

export default QuickMetarDisplay;