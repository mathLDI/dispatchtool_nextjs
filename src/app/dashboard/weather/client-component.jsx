'use client';

import React, { useEffect } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext'; // Use relative path
import AirportSearchForm from './AirportSearchForm'; // Import the new component

// Function to format METAR text based on specific terms and flight category
function formatMetarText(metarText, category) {
  // Define regular expressions for ceiling and visibility
  const ceilingRegex = /\b(VV|OVC|BKN|FEW|SCT)\d{3}\b/;
  const visibilityRegex = /\b(\d+\/?\d*SM|\d+\/\d+SM)\b/;
  
  // Define specific terms to highlight
  const termsToHighlight = ["TS", "\\+TS", "\\-TS", "\\+TSRA", "SN", "\\+SN", "LLWS", "CB", "SQ", "FC", "BL", "SH", "\\+SH", "\\-SH", "GR", "\\+FZ", "FZ"];
  const termsRegex = new RegExp(`(${termsToHighlight.join('|')})`, 'g');

  // Find matches for ceiling, visibility, and specific terms
  const ceilingMatch = metarText.match(ceilingRegex);
  const visibilityMatch = metarText.match(visibilityRegex);

  // Only add <strong> tags for LIFR and IFR categories for ceiling and visibility
  if (category === 'LIFR' || category === 'IFR') {
    // Replace ceiling match with bold version if found
    if (ceilingMatch) {
      metarText = metarText.replace(ceilingMatch[0], `<strong>${ceilingMatch[0]}</strong>`);
    }

    // Replace visibility match with bold version if found
    if (visibilityMatch) {
      metarText = metarText.replace(visibilityMatch[0], `<strong>${visibilityMatch[0]}</strong>`);
    }
  }

  // Replace specific terms with bold version if found
  metarText = metarText.replace(termsRegex, '<strong>$1</strong>');

  return metarText;
}

// Function to format TAF text
function formatTAF(tafText) {
  if (!tafText) return '';

  const switchTerms = ["BECMG", "TEMPO", "PROB30", "PROB40", "FM"];
  const regex = new RegExp(`\\b(${switchTerms.join('|')})\\b`, 'g');

  const formattedText = tafText.replace(regex, '\n$1');
  const lines = formattedText.split('\n');

  const processedLines = [];
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (switchTerms.some(term => trimmedLine.startsWith(term))) {
      processedLines.push(trimmedLine);
    } else if (processedLines.length > 0) {
      const lastLine = processedLines.pop();
      processedLines.push(lastLine + ' ' + trimmedLine);
    } else {
      processedLines.push(trimmedLine);
    }
  });

  return processedLines.join('\n').trim();
}

// Function to determine flight category and corresponding text color
function getFlightCategory(ceiling, visibility) {
  if (ceiling < 500 || visibility < 1) {
    return { category: 'LIFR', color: 'text-custom-lifr' }; // Custom pink for LIFR
  } else if (ceiling < 1000 || visibility < 3) {
    return { category: 'IFR', color: 'text-custom-ifr' }; // Red for IFR
  } else if (ceiling < 3000 || visibility <= 5) {
    return { category: 'MVFR', color: 'text-custom-mvfr' }; // Blue for MVFR
  } else if (ceiling >= 3000 && visibility > 5) {
    return { category: 'VFR', color: 'text-custom-vfr' }; // Custom green for VFR
  } else {
    return { category: 'Unknown', color: 'text-gray-500' }; // Gray for Unknown
  }
}

// Add the parseMETAR function here
function parseMETAR(metarString) {
  const components = metarString.split(' ');
  let wind = '';
  let visibility = '';

  for (const component of components) {
    // Check if component is wind information
    if (component.match(/^\d{3}\d{2}KT$/) || component.match(/^\d{3}V\d{3}$/)) {
      wind = component;
    } else if (component.match(/^\d+SM$/)) {
      // Assuming visibility is in statute miles (SM)
      visibility = component;
    }
  }

  // Example of setting color based on wind or visibility
  // This is a placeholder for whatever logic you use to set text color
  if (wind && visibility) {
    console.log(`Wind: ${wind}, Visibility: ${visibility}`);
    // Set text color logic here based on wind and visibility
  }
}

export default function ClientComponent({ fetchWeather }) {
  const { weatherData, selectedAirport, setWeatherData } = useRccContext();

  useEffect(() => {
    if (selectedAirport) {
      fetchWeather(selectedAirport.code).then(data => {
        setWeatherData(data);
      });
    }
  }, [selectedAirport, fetchWeather, setWeatherData]);

  useEffect(() => {
    if (weatherData) {
      console.log('Updated Weather Data:', weatherData);
    }
  }, [weatherData]);

  return (
    <div className="flex h-full">
      <div className="fixed z-10">
        <AirportSearchForm fetchWeather={fetchWeather} />
      </div>

      <div className="flex-1 overflow-y-auto pt-16">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[500px]">
            <h1 className="py-5">METAR</h1>
            <Card title="Weather" className="bg-blue-200">
              <div>
                {
                  weatherData && weatherData.data && weatherData.data.length > 0 ? (
                    // Inside your component rendering logic for METAR data
                    weatherData.data
                      .filter((item) => item.type === 'metar' || item.type === 'speci')
                      .sort((a, b) => {
                        const timeA = a.text.match(/\d{2}\d{4}Z/)[0];
                        const timeB = b.text.match(/\d{2}\d{4}Z/)[0];
                        return timeB.localeCompare(timeA);
                      })
                      .map((metar, index) => {
                        const metarText = metar.text;
                        const ceilingMatch = metarText.match(/(BKN|OVC|VV)(\d{3})/);
                        const visibilityMatch = metarText.match(/(\d+(\s?\d?\/?\d*)?SM)/);

                        // Extract ceiling and visibility ignoring variable winds
                        const ceiling = ceilingMatch ? parseInt(ceilingMatch[2]) * 100 : Infinity;
                        const visibility = visibilityMatch ? parseFloat(visibilityMatch[1].replace(/\//, '.')) : Infinity;

                        const { category, color } = getFlightCategory(ceiling, visibility);

                        const formattedText = formatMetarText(metarText, category);

                        return (
                          <div key={index} className="mb-4">
                            <p className={color} dangerouslySetInnerHTML={{ __html: formattedText }}></p>
                          </div>
                        );
                      })
                  ) : (
                    <p>No METAR data available</p>
                  )
                }
              </div>
            </Card>
            <h1 className="py-5">TAF</h1>
            <Card title="Weather" className="bg-blue-200">
              <div>
                {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                  formatTAF(weatherData.data.find((item) => item.type === 'taf')?.text || 'No TAF data available')
                    .split('\n')
                    .map((line, index) => (
                      <p key={index}>{line}</p>
                    ))
                ) : (
                  <p>No weather data available</p>
                )}
              </div>
            </Card>
          </div>

          <div className="flex-1 min-w-[500px]">
            <h1 className="py-5">NOTAM</h1>
            <Card title="Weather" className="bg-blue-200">
              <div>
                {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                  weatherData.data.filter((item) => item.type === 'notam').length > 0 ? (
                    weatherData.data.filter((item) => item.type === 'notam').map((notam, index) => (
                      <div key={index} className="mb-4">
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
      </div>
    </div>
  );
}
