'use client';

import React, { useEffect } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext';
import AirportSearchForm from './AirportSearchForm';

function formatMetarText(metarText, ceiling, visibility, category) {
  const ceilingRegex = /\b(VV|OVC|BKN|FEW|SCT)\d{3}\b/;
  const visibilityRegex = /\b(\d+\s?\d?\/?\d*SM|\d+\/\d+SM)\b/;

  const termsToHighlight = ["\\+SHRA", "\\-SHRA", "\\SHRA", "\\+TSRA", "\\TSRA", "\\-TSRA", "\\VCTS", "\\+RA", "RA", "TS", "\\+TS", "\\-TS", "\\+BLSN", "BLSN", "SN", "\\+SN", "LLWS", "CB", "SQ", "FC", "BL", "SH", "\\+SH", "\\-SH", "GR", "\\+FZ", "FZ"];
  const termsRegex = new RegExp(`(${termsToHighlight.join('|')})`, 'g');

  const ceilingMatch = metarText.match(ceilingRegex);
  const visibilityMatch = metarText.match(visibilityRegex);

  if (category === 'LIFR' || category === 'IFR') {
    if (ceiling < 1000 && ceilingMatch) {
      metarText = metarText.replace(ceilingMatch[0], `<strong>${ceilingMatch[0]}</strong>`);
    } else if (visibility < 3 && visibilityMatch) {
      metarText = metarText.replace(visibilityMatch[0], `<strong>${visibilityMatch[0]}</strong>`);
    }
  }

  metarText = metarText.replace(termsRegex, '<strong>$1</strong>');

  return metarText;
}

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

  let currentCategory = 'Unknown';
  let currentColor = 'text-gray-500';
  let firstLineCategory = 'Unknown';
  let firstLineColor = 'text-gray-500';

  return processedLines.map((line, index) => {
    let ceiling = Infinity;
    let visibility = Infinity;

    const ceilingMatch = line.match(/\b(OVC|BKN|VV)\d{3}\b/);
    const visibilityMatch = line.match(/\b(\d+\/?\d*SM|\d+\/\d+SM|\d*\/?\d+SM)\b/);

    if (ceilingMatch) {
      ceiling = parseInt(ceilingMatch[0].slice(-3)) * 100;
    }
    if (visibilityMatch) {
      visibility = visibilityMatch[0].includes('/') 
        ? parseFloat(visibilityMatch[0].split('/')[0]) / parseFloat(visibilityMatch[0].split('/')[1]) 
        : parseFloat(visibilityMatch[0].replace('SM', ''));
    }

    const { category, color } = getFlightCategory(ceiling, visibility);

    if (index === 0) {
      firstLineCategory = category;
      firstLineColor = color;
    }

    if (line.startsWith('FM')) {
      currentCategory = category;
      currentColor = color;
    }

    const lineColor = ceiling !== Infinity || visibility !== Infinity ? color : (currentColor !== 'text-gray-500' ? currentColor : firstLineColor);

    return <p key={index} className={lineColor}>{line}</p>;
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

function parseMETAR(metarString) {
  const components = metarString.split(' ');
  let wind = '';
  let visibility = '';
  let ceiling = Infinity;
  let visibilityValue = Infinity;

  for (const component of components) {
    if (component.match(/^\d{3}\d{2}KT$/) || component.match(/^\d{3}V\d{3}$/)) {
      wind = component;
    } else if (component.match(/^\d+SM$/)) {
      visibilityValue = parseFloat(component.replace('SM', '').replace('/', '.'));
      visibility = component;
    } else if (component.match(/\b(VV|OVC|BKN|FEW|SCT)\d{3}\b/)) {
      const ceilingValue = parseInt(component.slice(-3)) * 100;
      if (component.startsWith('BKN') || component.startsWith('OVC') || component.startsWith('VV')) {
        if (ceilingValue < ceiling) {
          ceiling = ceilingValue;
        }
      }
    }
  }

  const { category, color } = getFlightCategory(ceiling, visibilityValue);
  return { metarString, ceiling, visibilityValue, category, color };
}

function parseNotamDate(dateString) {
  const year = parseInt('20' + dateString.slice(0, 2), 10);
  const month = parseInt(dateString.slice(2, 4), 10) - 1; // Months are 0-based in JS Date
  const day = parseInt(dateString.slice(4, 6), 10);
  const hour = parseInt(dateString.slice(6, 8), 10);
  const minute = parseInt(dateString.slice(8, 10), 10);
  return new Date(Date.UTC(year, month, day, hour, minute));
}

function filterActiveNotams(notams) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Set to the start of the day in UTC
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);

  return notams.filter(notam => {
    const startMatch = notam.text.match(/B\)\s*(\d{10})/);
    const endMatch = notam.text.match(/C\)\s*(\d{10})/);

    if (!startMatch || !endMatch) return false;

    const startDate = parseNotamDate(startMatch[1]);
    const endDate = parseNotamDate(endMatch[1]);

    console.log(`NOTAM Start Date: ${startDate}`);
    console.log(`NOTAM End Date: ${endDate}`);
    console.log(`Today's Date: ${today}`);
    console.log(`Tomorrow's Date: ${tomorrow}`);

    return startDate < tomorrow && endDate >= today;
  });
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

  const extractTextBeforeFR = (text) => {
    const frIndex = text.indexOf('FR:');
    return frIndex !== -1 ? text.substring(0, frIndex).trim() : text.trim();
  };

  const activeNotams = weatherData ? filterActiveNotams(weatherData.data.filter(item => item.type === 'notam')) : [];

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
                    weatherData.data
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
                <h2 className="text-lg font-bold">TODAY</h2>
                {activeNotams.length > 0 ? (
                  activeNotams.map((notam, index) => {
                    const notamText = JSON.parse(notam.text);
                    const displayText = extractTextBeforeFR(notamText.raw);
                    const startMatch = notam.text.match(/B\)\s*(\d{10})/);
                    const endMatch = notam.text.match(/C\)\s*(\d{10})/);

                    if (!startMatch || !endMatch) return null;

                    const startDate = parseNotamDate(startMatch[1]);
                    const endDate = parseNotamDate(endMatch[1]);

                    return (
                      <div key={index} className="mb-4">
                        {displayText.split('\n').map((line, lineIndex) => (
                          <p key={lineIndex} className="mb-1">{line}</p>
                        ))}
                        <p>Start Date: {startDate.toUTCString()}</p>
                        <p>End Date: {endDate.toUTCString()}</p>
                      </div>
                    );
                  })
                ) : (
                  <p>No active NOTAMs for today</p>
                )}
                <h2 className="text-lg font-bold mt-4">ALL</h2>
                {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                  weatherData.data.filter((item) => item.type === 'notam').length > 0 ? (
                    weatherData.data.filter((item) => item.type === 'notam').map((notam, index) => {
                      const notamText = JSON.parse(notam.text);
                      const displayText = extractTextBeforeFR(notamText.raw);
                      const startMatch = notam.text.match(/B\)\s*(\d{10})/);
                      const endMatch = notam.text.match(/C\)\s*(\d{10})/);

                      if (!startMatch || !endMatch) return null;

                      const startDate = parseNotamDate(startMatch[1]);
                      const endDate = parseNotamDate(endMatch[1]);

                      return (
                        <div key={index} className="mb-4">
                          {displayText.split('\n').map((line, lineIndex) => (
                            <p key={lineIndex} className="mb-1">{line}</p>
                          ))}
                          <p>Start Date: {startDate.toUTCString()}</p>
                          <p>End Date: {endDate.toUTCString()}</p>
                        </div>
                      );
                    })
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
