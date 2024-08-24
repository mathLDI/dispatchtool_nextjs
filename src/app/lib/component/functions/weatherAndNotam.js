// src/app/lib/component/functions/weatherAndNotam.js

////AIRPORT FLIGHT CATEGORY LIST////

export function calculateAirportCategories(airportValues, allWeatherData) {
  // Check if allWeatherData is defined and is an object
  if (!allWeatherData || typeof allWeatherData !== 'object' || Object.keys(allWeatherData).length === 0) {
    return {}; // Return an empty object if allWeatherData is not ready
  }

  const categories = allAirportsFlightCategory(airportValues, allWeatherData);
  console.log('Calculated airport categories:', categories); // Log calculated categories
  return categories;
}


////METAR///

export function parseMETAR(metarString) {
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

export function getFlightCategory(ceiling, visibility) {
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

export function formatLocalDate(date) {
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

  const dateTimeFormat = new Intl.DateTimeFormat('en-US', options);
  const parts = dateTimeFormat.formatToParts(date);

  const formattedDate = `${parts.find(part => part.type === 'weekday').value}, ${parts.find(part => part.type === 'day').value} ${parts.find(part => part.type === 'month').value} ${parts.find(part => part.type === 'year').value} ${parts.find(part => part.type === 'hour').value}:${parts.find(part => part.type === 'minute').value}:${parts.find(part => part.type === 'second').value}`;

  return formattedDate;
}

export function parseNotamDate(dateString) {
  const year = parseInt('20' + dateString.slice(0, 2), 10);
  const month = parseInt(dateString.slice(2, 4), 10) - 1; // Months are 0-based in JS Date
  const day = parseInt(dateString.slice(4, 6), 10);
  const hour = parseInt(dateString.slice(6, 8), 10);
  const minute = parseInt(dateString.slice(8, 10), 10);
  return new Date(Date.UTC(year, month, day, hour, minute));
}

export function categorizeNotams(notams) {
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

export function extractTextBeforeFR(text) {
  const frIndex = text.indexOf('FR:');
  return frIndex !== -1 ? text.substring(0, frIndex).trim() : text.trim();
}

export function filterAndHighlightNotams(notams, searchTerm = '', isCraneFilterActive) {
  const ifrTerms = /\b(CLOSED|CLSD|OUT OF SERVICE|RWY|U\/S)\b/gi;
  const lifrTerms = /\b(AUTH|RSC|SERVICE)\b/gi;
  const mvfrTerms = /\b(TWY CLOSED)\b/gi;

  // Ensure searchTerm is a string
  const normalizedSearchTerm = String(searchTerm).toLowerCase();

  return notams
    .filter((notam) => {
      const notamText = JSON.parse(notam.text).raw;
      if (isCraneFilterActive && notamText.includes('CRANE')) {
        return false; // Exclude NOTAMs that mention "CRANE"
      }
      return notamText.toLowerCase().includes(normalizedSearchTerm);
    })
    .map((notam) => {
      const notamText = JSON.parse(notam.text).raw;
      let highlightedText = notamText
        .replace(ifrTerms, '<span class="text-custom-ifr">$&</span>')
        .replace(lifrTerms, '<span class="text-custom-lifr">$&</span>')
        .replace(mvfrTerms, '<span class="text-custom-mvfr">$&</span>');

      if (normalizedSearchTerm) {
        const searchTermRegex = new RegExp(`(${normalizedSearchTerm})`, 'gi');
        highlightedText = highlightedText.replace(searchTermRegex, '<mark>$1</mark>');
      }

      return { ...notam, highlightedText };
    });
}



export function countFilteredNotams(notams, type, searchTerm, isCraneFilterActive) {
  const filteredNotams = filterAndHighlightNotams(notams, searchTerm, isCraneFilterActive);

  return filteredNotams.filter((notam) => {
    const displayText = extractTextBeforeFR(JSON.parse(notam.text).raw);
    const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
    if (!qLineMatch) return false;
    return qLineMatch[2].startsWith(type);
  }).length;
}


function parseMETARForCeilingAndVisibility(metarString) {
  const components = metarString.split(' ');
  let ceiling = Infinity;
  let visibilityValue = Infinity;

  components.forEach((component) => {
    if (component.match(/^\d+SM$/)) {
      visibilityValue = parseFloat(component.replace('SM', '').replace('/', '.'));
    } else if (component.match(/\b(VV|OVC|BKN|FEW|SCT)\d{3}\b/)) {
      const ceilingValue = parseInt(component.slice(-3)) * 100;
      if (component.startsWith('BKN') || component.startsWith('OVC') || component.startsWith('VV')) {
        if (ceilingValue < ceiling) {
          ceiling = ceilingValue;
        }
      }
    }
  });

  return { ceiling, visibilityValue };
}

export function allAirportsFlightCategory(airportValues, weatherData) {
  const airportCategories = {};

  airportValues.forEach((airport) => {
    const latestMetar = weatherData[airport.code]?.data?.find((item) => item.type === 'metar' || item.type === 'speci');

    if (latestMetar) {
      const { ceiling, visibilityValue } = parseMETARForCeilingAndVisibility(latestMetar.text);

      const { category, color } = getFlightCategory(ceiling, visibilityValue);

      airportCategories[airport.code] = {
        category,
        color,
      };
    } else {
      airportCategories[airport.code] = {
        category: 'Unknown',
        color: 'text-gray-500',
      };
    }
  });

  return airportCategories;
}

export const renderNotamsW = (notams, title) => {
  const notamsToRender = notams.filter(notam => {
    const notamText = JSON.parse(notam.text);
    const displayText = extractTextBeforeFR(notamText.raw);

    const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);

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

export const renderNotamsE = (notams, title) => {
  const notamsToRender = notams.filter(notam => {
    const notamText = JSON.parse(notam.text);
    const displayText = extractTextBeforeFR(notamText.raw);

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
