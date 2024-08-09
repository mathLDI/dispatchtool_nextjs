'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../lib/component/Card';
import { useRccContext } from '../RccCalculatorContext';
import AirportSearchForm from './AirportSearchForm';

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

function formatTAF(tafText) {
  if (!tafText) return '';

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
    let visibility = Infinity;

    const ceilingMatch = line.match(/\b(OVC|BKN|VV)\d{3}\b/);
    const visibilityMatch = line.match(
      /\b(\d+\/?\d*SM|\d+\/\d+SM|\d*\/?\d+SM)\b/
    );

    if (ceilingMatch) {
      ceiling = parseInt(ceilingMatch[0].slice(-3)) * 100;
    }
    if (visibilityMatch) {
      visibility = visibilityMatch[0].includes('/')
        ? parseFloat(visibilityMatch[0].split('/')[0]) /
        parseFloat(visibilityMatch[0].split('/')[1])
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

    const lineColor =
      ceiling !== Infinity || visibility !== Infinity
        ? color
        : currentColor !== 'text-gray-500'
          ? currentColor
          : firstLineColor;

    return (
      <p key={index} className={lineColor}>
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
      if (
        component.startsWith('BKN') ||
        component.startsWith('OVC') ||
        component.startsWith('VV')
      ) {
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

// Function to format the date as "Mon, 05 Jul 2024 14:20:00"
function formatLocalDate(date) {
  // Use Intl.DateTimeFormat for custom format order
  const options = {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  // Formatting the date and time
  const dateTimeFormat = new Intl.DateTimeFormat('en-US', options);
  const parts = dateTimeFormat.formatToParts(date);

  // Arrange the parts into the desired format: "Mon, 05 Jul 2024 14:20:00"
  const formattedDate = `${parts.find(part => part.type === 'weekday').value}, ${parts.find(part => part.type === 'day').value} ${parts.find(part => part.type === 'month').value} ${parts.find(part => part.type === 'year').value} ${parts.find(part => part.type === 'hour').value}:${parts.find(part => part.type === 'minute').value}:${parts.find(part => part.type === 'second').value}`;

  return formattedDate;
}

function categorizeNotams(notams) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0); // Set to the start of the day in local time
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999); // Set to the end of the day in local time

  const last7Days = new Date(todayStart);
  last7Days.setDate(todayStart.getDate() - 7);

  const last30Days = new Date(todayStart);
  last30Days.setDate(todayStart.getDate() - 30);

  const futureNotams = [];
  const todayNotams = [];
  const last7DaysNotams = [];
  const last30DaysNotams = [];
  const olderNotams = [];

  notams.forEach((notam) => {
    const startMatch = notam.text.match(/B\)\s*(\d{10})/);

    if (!startMatch) return;

    const startDate = parseNotamDate(startMatch[1]);
    const localStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000); // Convert to local time

    if (localStartDate > now) {
      futureNotams.push({ ...notam, startDate });
    } else if (localStartDate >= todayStart && localStartDate <= todayEnd) {
      todayNotams.push({ ...notam, startDate });
    } else if (localStartDate > last7Days) {
      last7DaysNotams.push({ ...notam, startDate });
    } else if (localStartDate > last30Days) {
      last30DaysNotams.push({ ...notam, startDate });
    } else {
      olderNotams.push({ ...notam, startDate });
    }
  });

  return {
    futureNotams,
    todayNotams,
    last7DaysNotams,
    last30DaysNotams,
    olderNotams,
  };
}

// Define GFA issuance times and valid times
const issuanceTimes = [
  { issuance: '2330', valid: ['0000', '0600', '1200'] },
  { issuance: '0530', valid: ['0600', '1200', '1800'] },
  { issuance: '1130', valid: ['1200', '1800', '0000'] },
  { issuance: '1730', valid: ['1800', '0000', '0600'] },
];

// Function to get the current UTC time in HHMM format
const getCurrentUTCTime = () => {
  const now = new Date();
  const hours = now.getUTCHours().toString().padStart(2, '0');
  const minutes = now.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}${minutes}`;
};

// Function to determine the current batch of GFA images
const getCurrentBatch = () => {
  const currentTime = getCurrentUTCTime();
  for (let i = issuanceTimes.length - 1; i >= 0; i--) {
    if (currentTime >= issuanceTimes[i].issuance) {
      return issuanceTimes[i].valid;
    }
  }
  return issuanceTimes[issuanceTimes.length - 1].valid; // Default to the last batch if no match
};

export default function ClientComponent({ fetchWeather, fetchGFA }) {
  const {
    weatherData,
    selectedAirport,
    setWeatherData,
    selectedNotamType,
    setSelectedNotamType,
    searchTerm,
    setSearchTerm,
  } = useRccContext();

  const [gfaType, setGfaType] = useState('CLDWX'); // Default to Clouds
  const [gfaData, setGfaData] = useState(null);
  const [selectedTimestamp, setSelectedTimestamp] = useState(0);

  useEffect(() => {
    if (selectedAirport) {
      fetchWeather(selectedAirport.code).then((data) => {
        setWeatherData(data);
      });

      fetchGFA(selectedAirport.code, gfaType).then((data) => {
        console.log('GFA Data:::', data); // Log the fetched GFA data
        setGfaData(data);
      });
    }
  }, [selectedAirport, gfaType, fetchWeather, fetchGFA, setWeatherData]);

  // Helper function to get the frames from the last frame list
  const getLastFrames = (frameLists) => {
    const lastFrameList = frameLists[frameLists.length - 1];
    return lastFrameList.frames;
  };

  // Helper function to get the image URL from GFA data
  const getImageUrl = () => {
    if (!gfaData || !gfaData.data || gfaData.data.length === 0) return '';

    // Parse the GFA text field to get frame lists
    const frameLists = JSON.parse(gfaData.data[0].text).frame_lists;

    console.log('Frame Lists:::::', frameLists);

    // Get the frames from the last frame list
    const lastFrames = getLastFrames(frameLists);

    // Get the selected frame based on the selected timestamp
    const selectedFrame = lastFrames[selectedTimestamp];

    // Extract the image ID from the selected frame
    const imageId = selectedFrame?.images[0]?.id;

    // Construct the image URL using the extracted image ID
    return imageId ? `https://plan.navcanada.ca/weather/images/${imageId}.image` : '';
  };

  // Helper function to format the validity time
  const formatValidityTime = (frame) => {
    const date = new Date(frame.sv);
    return `${date.getUTCDate()} ${date.toLocaleString('en-US', { month: 'short' })} @ ${date.getUTCHours().toString().padStart(2, '0')}00Z`;
  };

  useEffect(() => {
    if (weatherData) {
      console.log('Updated Weather Data:', weatherData);
    }
  }, [weatherData]);

  const extractTextBeforeFR = (text) => {
    const frIndex = text.indexOf('FR:');
    return frIndex !== -1 ? text.substring(0, frIndex).trim() : text.trim();
  };

  const categorizedNotams = weatherData
    ? categorizeNotams(weatherData.data.filter((item) => item.type === 'notam'))
    : {};

  const handleNotamTypeChange = (newNotamType) => {
    setSelectedNotamType(newNotamType);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filterAndHighlightNotams = (notams) => {
    // Define regex for each category of terms to be highlighted
    const ifrTerms = /\b(CLOSED|CLSD|OUT OF SERVICE|RWY|U\/S)\b/gi;
    const lifrTerms = /\b(AUTH|RSC|SERVICE)\b/gi;
    const mvfrTerms = /\b(TWY CLOSED)\b/gi;

    // First filter by search term, then highlight
    return notams
      .filter((notam) => {
        const notamText = JSON.parse(notam.text).raw;
        return notamText.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .map((notam) => {
        const notamText = JSON.parse(notam.text).raw;

        // Highlight different terms with different classes
        let highlightedText = notamText
          .replace(ifrTerms, '<span class="text-custom-ifr">$&</span>')
          .replace(lifrTerms, '<span class="text-custom-lifr">$&</span>')
          .replace(mvfrTerms, '<span class="text-custom-mvfr">$&</span>');

        // Highlight search terms separately
        if (searchTerm) {
          const searchTermRegex = new RegExp(`(${searchTerm})`, 'gi');
          highlightedText = highlightedText.replace(
            searchTermRegex,
            '<mark>$1</mark>'
          );
        }

        return { ...notam, highlightedText }; // Add highlighted text to notam
      });
  };

  const countFilteredNotams = (notams, type) => {
    const filteredNotams = filterAndHighlightNotams(notams);
    return filteredNotams.filter((notam) => {
      const displayText = extractTextBeforeFR(JSON.parse(notam.text).raw);
      const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
      if (!qLineMatch) return false;
      return qLineMatch[2].startsWith(type);
    }).length;
  };

  const renderNotamCard = () => {
    switch (selectedNotamType) {
      case 'AERODROME':
        return (
          <Card title="NOTAM AERODROME" className="h-full">
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.futureNotams || []), 'FUTURE')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.todayNotams || []), 'TODAY')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.last7DaysNotams || []), 'LAST 7 DAYS')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.last30DaysNotams || []), 'LAST 30 DAYS')}
            {renderNotamsAandAE(filterAndHighlightNotams(categorizedNotams.olderNotams || []), 'OLDER')}
          </Card>
        );
      case 'ENROUTE':
        return (
          <Card title="NOTAM ENROUTE" className="h-full">
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.futureNotams || []), 'FUTURE')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.todayNotams || []), 'TODAY')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.last7DaysNotams || []), 'LAST 7 DAYS')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.last30DaysNotams || []), 'LAST 30 DAYS')}
            {renderNotamsE(filterAndHighlightNotams(categorizedNotams.olderNotams || []), 'OLDER')}
          </Card>
        );
      case 'WARNING':
        return (
          <Card title="NOTAM WARNING" className="h-full">
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.futureNotams || []), 'FUTURE')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.todayNotams || []), 'TODAY')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.last7DaysNotams || []), 'LAST 7 DAYS')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.last30DaysNotams || []), 'LAST 30 DAYS')}
            {renderNotamsW(filterAndHighlightNotams(categorizedNotams.olderNotams || []), 'OLDER')}
          </Card>
        );
      default:
        return null;
    }
  };

  ///FUNCTION for NOTAMs with Q-Line that have an "A"///
  const renderNotamsAandAE = (notams, title) => {
    const notamsToRender = notams.filter((notam) => {
      const notamText = JSON.parse(notam.text);
      const displayText = extractTextBeforeFR(notamText.raw);

      const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
      return qLineMatch && qLineMatch[2].startsWith('A');
    });

    return (
      <div>
        <h2 className="text-lg font-bold bg-gray-100 p-2 rounded">{title}</h2>
        {notamsToRender.length === 0 ? (
          <p>No Applicable NOTAMs</p>
        ) : (
          notamsToRender.map((notam, index) => {
            const notamText = JSON.parse(notam.text);
            const displayText = extractTextBeforeFR(notam.highlightedText || notamText.raw);
            const localTime = formatLocalDate(notam.startDate);

            // Parse the expiration date using the C) field
            const expirationMatch = notam.text.match(/C\)\s*(\d{10})/);
            const expirationDate = expirationMatch
              ? parseNotamDate(expirationMatch[1])
              : null;
            const localExpirationDate = expirationDate
              ? new Date(
                expirationDate.getTime() -
                expirationDate.getTimezoneOffset() * 60000
              )
              : null;

            const lines = displayText.split('\n');
            let inBold = false;
            const processedLines = lines.map((line) => {
              if (line.includes('E)')) inBold = true;
              if (line.includes('F)')) inBold = false;
              return inBold ? `<strong>${line}</strong>` : line;
            });

            return (
              <div key={index} className="mb-4">
                {processedLines.map((line, lineIndex) => (
                  <p
                    key={lineIndex}
                    className="mb-1"
                    dangerouslySetInnerHTML={{ __html: line }}
                  ></p>
                ))}
                <p className="text-blue-800">Effective (UTC): {notam.startDate.toUTCString()}</p>
                <p className="text-blue-800">Effective (Local): {localTime}</p>
                {expirationDate && (
                  <>
                    <p className="text-blue-800">Expires (UTC): {expirationDate.toUTCString()}</p>
                    <p className="text-blue-800">Expires (Local): {formatLocalDate(localExpirationDate)}</p>
                  </>
                )}
                {/* Divider below each NOTAM entry except the last one */}
                {index !== notamsToRender.length - 1 && (
                  <hr className="my-2 border-gray-300" />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  ///FUNCTION for NOTAMs with Q-Line that have an "E"///
  const renderNotamsE = (notams, title) => {
    const notamsToRender = notams.filter(notam => {
      const notamText = JSON.parse(notam.text);
      const displayText = extractTextBeforeFR(notamText.raw);

      // Check if the Q-Line indicates 'E'
      const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
      return qLineMatch && qLineMatch[2].startsWith('E');
    });

    return (
      <div>
        <h2 className="text-lg font-bold bg-gray-100 p-2 rounded">{title}</h2>
        {notamsToRender.length === 0 ? (
          <p>No Applicable NOTAMs</p>
        ) : (
          notamsToRender.map((notam, index) => {
            const notamText = JSON.parse(notam.text);
            const displayText = extractTextBeforeFR(notam.highlightedText || notamText.raw);
            const localTime = formatLocalDate(notam.startDate);

            // Parse the expiration date using the C) field
            const expirationMatch = notam.text.match(/C\)\s*(\d{10})/);
            const expirationDate = expirationMatch
              ? parseNotamDate(expirationMatch[1])
              : null;
            const localExpirationDate = expirationDate
              ? new Date(
                expirationDate.getTime() -
                expirationDate.getTimezoneOffset() * 60000
              )
              : null;

            const lines = displayText.split('\n');
            let inBold = false;
            const processedLines = lines.map((line) => {
              if (line.includes('E)')) inBold = true;
              if (line.includes('F)')) inBold = false;
              return inBold ? `<strong>${line}</strong>` : line;
            });

            return (
              <div key={index} className="mb-4">
                {processedLines.map((line, lineIndex) => (
                  <p
                    key={lineIndex}
                    className="mb-1"
                    dangerouslySetInnerHTML={{ __html: line }}
                  ></p>
                ))}
                <p className="text-blue-800">Effective (UTC): {notam.startDate.toUTCString()}</p>
                <p className="text-blue-800">Effective (Local): {localTime}</p>
                {expirationDate && (
                  <>
                    <p className="text-blue-800">Expires (UTC): {expirationDate.toUTCString()}</p>
                    <p className="text-blue-800">Expires (Local): {formatLocalDate(localExpirationDate)}</p>
                  </>
                )}
                {/* Divider below each NOTAM entry except the last one */}
                {index !== notamsToRender.length - 1 && (
                  <hr className="my-2 border-gray-300" />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  ///FUNCTION for NOTAMs with Q-Line that have a "W"///
  const renderNotamsW = (notams, title) => {
    const notamsToRender = notams.filter(notam => {
      const notamText = JSON.parse(notam.text);
      const displayText = extractTextBeforeFR(notamText.raw);

      // Regex to match everything after 'Q)' until the fifth '/'
      const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);

      // Check if the match is successful and the sixth segment (after the fourth slash) starts with 'W'
      return qLineMatch && qLineMatch[2].startsWith('W');
    });

    return (
      <div>
        <h2 className="text-lg font-bold bg-gray-100 p-2 rounded">{title}</h2>
        {notamsToRender.length === 0 ? (
          <p>No Applicable NOTAMs</p>
        ) : (
          notamsToRender.map((notam, index) => {
            const notamText = JSON.parse(notam.text);
            const displayText = extractTextBeforeFR(notam.highlightedText || notamText.raw);
            const localTime = formatLocalDate(notam.startDate);

            // Parse the expiration date using the C) field
            const expirationMatch = notam.text.match(/C\)\s*(\d{10})/);
            const expirationDate = expirationMatch
              ? parseNotamDate(expirationMatch[1])
              : null;
            const localExpirationDate = expirationDate
              ? new Date(
                expirationDate.getTime() -
                expirationDate.getTimezoneOffset() * 60000
              )
              : null;

            const lines = displayText.split('\n');
            let inBold = false;
            const processedLines = lines.map((line) => {
              if (line.includes('E)')) inBold = true;
              if (line.includes('F)')) inBold = false;
              return inBold ? `<strong>${line}</strong>` : line;
            });

            return (
              <div key={index} className="mb-4">
                {processedLines.map((line, lineIndex) => (
                  <p
                    key={lineIndex}
                    className="mb-1"
                    dangerouslySetInnerHTML={{ __html: line }}
                  ></p>
                ))}
                <p className="text-blue-800">Effective (UTC): {notam.startDate.toUTCString()}</p>
                <p className="text-blue-800">Effective (Local): {localTime}</p>
                {expirationDate && (
                  <>
                    <p className="text-blue-800">Expires (UTC): {expirationDate.toUTCString()}</p>
                    <p className="text-blue-800">Expires (Local): {formatLocalDate(localExpirationDate)}</p>
                  </>
                )}
                {/* Divider below each NOTAM entry except the last one */}
                {index !== notamsToRender.length - 1 && (
                  <hr className="my-2 border-gray-300" />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen"> {/* Ensures the component takes full viewport height */}
      <div className="fixed z-10">
        <AirportSearchForm fetchWeather={fetchWeather} />
      </div>

      <div className="flex-1 overflow-hidden pt-16"> {/* Manages overflow at the column level */}
        <div className="flex flex-row justify-between h-full"> {/* Ensures flex children stretch to full height of their parent */}

          {/* Left Column for METAR and TAF */}
          <div className="flex flex-col w-full md:min-w-[500px] flex-grow overflow-y-auto" style={{ maxHeight: '80vh' }}> {/* Outer container for METAR and TAF with overflow */}
            <h1 className="font-bold py-5 text-lg">METAR</h1>
            <div className="flex">
              <Card title="METAR" className="h-full">
                {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                  weatherData.data
                    .filter((item) => item.type === 'metar' || item.type === 'speci')
                    .sort((a, b) => {
                      const timeA = a.text.match(/\d{2}\d{4}Z/)[0];
                      const timeB = b.text.match(/\d{2}\d{4}Z/)[0];
                      return timeB.localeCompare(timeA);
                    })
                    .map((metar, index) => {
                      const parsedMetar = parseMETAR(metar.text);
                      const {
                        metarString,
                        ceiling,
                        visibilityValue,
                        category,
                        color,
                      } = parsedMetar;

                      const formattedText = formatMetarText(
                        metarString,
                        ceiling,
                        visibilityValue,
                        category
                      );

                      return (
                        <div key={index} className="mb-4">
                          <p
                            className={color}
                            dangerouslySetInnerHTML={{ __html: formattedText }}
                          ></p>
                        </div>
                      );
                    })
                ) : (
                  <p>No METAR data available</p>
                )}
              </Card>
            </div>

            <h1 className="font-bold text-lg">TAF</h1>
            <div className="flex-grow">
              <Card title="TAF" className="h-full">
                <div>
                  {weatherData && weatherData.data && weatherData.data.length > 0 ? (
                    formatTAF(
                      weatherData.data.find((item) => item.type === 'taf')?.text ||
                      'No TAF data available'
                    )
                  ) : (
                    <p>No weather data available</p>
                  )}
                </div>
              </Card>
            </div>

            <h1 className="font-bold text-lg">GFA</h1>
            <div className="flex-grow">
              <Card title="GFA" className="h-full">
                <div className="flex justify-center mb-2">
                  <button
                    onClick={() => setGfaType('CLDWX')}
                    className={`px-4 py-2 rounded ${gfaType === 'CLDWX' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    Clouds
                  </button>
                  <button
                    onClick={() => setGfaType('TURBC')}
                    className={`px-4 py-2 rounded ${gfaType === 'TURBC' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    Turbulence
                  </button>
                </div>

                {/* Display the image */}
                <img src={getImageUrl()} alt="GFA Image" />

                <div className="flex justify-center mt-2 space-x-4">
                  {gfaData && getLastFrames(JSON.parse(gfaData.data[0].text).frame_lists).map((frame, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTimestamp(index)}
                      className={`bg-gray-200 text-black px-4 py-2 rounded ${selectedTimestamp === index ? 'bg-blue-300' : ''}`}
                    >
                      {formatValidityTime(frame)}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div title='spacer between METAR/TAF and NOTAM' className='p-2'></div>

          {/* Right Column for NOTAM */}
          <div className="flex flex-col py-5 w-full md:min-w-[500px] flex-grow overflow-y-auto" style={{ maxHeight: '80vh' }}>
            <div className="mb-4">
              <label className="font-bold mr-2 text-lg">NOTAM</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleNotamTypeChange('AERODROME')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamType === 'AERODROME' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  AERODROME | {countFilteredNotams((categorizedNotams.futureNotams ?? []).concat(categorizedNotams.todayNotams ?? [], categorizedNotams.last7DaysNotams ?? [], categorizedNotams.last30DaysNotams ?? [], categorizedNotams.olderNotams ?? []), 'A')}
                </button>
                <button
                  onClick={() => handleNotamTypeChange('ENROUTE')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamType === 'ENROUTE' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  ENROUTE | {countFilteredNotams((categorizedNotams.futureNotams ?? []).concat(categorizedNotams.todayNotams ?? [], categorizedNotams.last7DaysNotams ?? [], categorizedNotams.last30DaysNotams ?? [], categorizedNotams.olderNotams ?? []), 'E')}
                </button>
                <button
                  onClick={() => handleNotamTypeChange('WARNING')}
                  className={`flex bg-gray-100 dark:bg-gray-700 justify-between items-center p-2 rounded-md shadow-sm ${selectedNotamType === 'WARNING' ? 'bg-sky-100 text-blue-600' : 'text-black hover:bg-sky-100 hover:text-blue-600'} cursor-pointer`}
                >
                  WARNING | {countFilteredNotams((categorizedNotams.futureNotams ?? []).concat(categorizedNotams.todayNotams ?? [], categorizedNotams.last7DaysNotams ?? [], categorizedNotams.last30DaysNotams ?? [], categorizedNotams.olderNotams ?? []), 'W')}
                </button>
              </div>

              {/* Search Box */}
              <input
                type="text"
                placeholder="Search NOTAMs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="mt-2 p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            {renderNotamCard()}
          </div>
        </div>
      </div>
    </div>
  );
}
