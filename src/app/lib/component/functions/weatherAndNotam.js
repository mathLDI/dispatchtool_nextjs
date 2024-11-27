


// Transform allWeatherData into the format of airportValues with correct property order
// transformAllWeatherDataToAirportValues & calculateAirportCategories & 
//all work together to find the correct category.  
//
export function transformAllWeatherDataToAirportValues(allWeatherData) {
  // Check if allWeatherData is valid
  if (!allWeatherData || typeof allWeatherData !== 'object' || Object.keys(allWeatherData).length === 0) {
    return []; // Return an empty array if there's no weather data
  }

  // Transform each entry in allWeatherData into an airport object with id, name, and code in the correct order
  const transformedAirports = Object.keys(allWeatherData).map((icaoCode) => {
    return {
      id: icaoCode,  // First property: id
      name: `Airport ${icaoCode}`,  // Second property: name
      code: icaoCode  // Third property: code
    };
  });

  return transformedAirports;
}


////AIRPORT FLIGHT CATEGORY LIST////


// Calculate airport categories based on transformed allWeatherData
export function calculateAirportCategories(allWeatherData) {
  // Check if allWeatherData is defined and is an object
  if (!allWeatherData || typeof allWeatherData !== 'object' || Object.keys(allWeatherData).length === 0) {
    return {}; // Return an empty object if allWeatherData is not ready
  }

  // Directly use transformAllWeatherDataToAirportValues without import
  const transformedAirportValues = transformAllWeatherDataToAirportValues(allWeatherData);

  // Calculate categories using transformed airport values and weather data
  const categories = allAirportsFlightCategory(transformedAirportValues, allWeatherData);
  
  return categories;
}

// Calculate the flight categories for each airport
// Update allAirportsFlightCategory function
export function allAirportsFlightCategory(airportValues, weatherData) {
  const airportCategories = {};

  airportValues.forEach((airport) => {
    const latestMetar = weatherData[airport.code]?.data?.find(
      (item) => item.type === 'metar' || item.type === 'speci'
    );

    if (latestMetar) {
      // Use parseVisibility directly for visibility
      const visibilityValue = parseVisibility(latestMetar.text);
     // console.log(`Parsed visibility for ${airport.code}:`, visibilityValue);

      // Keep existing ceiling parsing
      let ceiling = Infinity;
      const components = latestMetar.text.split(' ');
      
      components.forEach((component) => {
        if (component.match(/\b(VV|OVC|BKN|FEW|SCT)\d{3}\b/)) {
          const ceilingValue = parseInt(component.slice(-3)) * 100;
          if (component.startsWith('BKN') || 
              component.startsWith('OVC') || 
              component.startsWith('VV')) {
            if (ceilingValue < ceiling) {
              ceiling = ceilingValue;
            }
          }
        }
      });

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

export function parseVisibility(metarString) {
 // console.log('Parsing visibility from:', metarString);
  const components = metarString.split(' ');
  let visibilityValue = Infinity;

  // Add new mixed number check at the start
  const mixedMatch = metarString.match(/(\d+)\s+(\d+)\/(\d+)SM/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const num = parseInt(mixedMatch[2]);
    const denom = parseInt(mixedMatch[3]);
    const result = whole + (num / denom);
    //console.log('Mixed number match:', { whole, num, denom, result });
    return result;
  }

  function parseFraction(fractionStr) {
    //console.log('Parsing fraction:', fractionStr);
    const fractionMatch = fractionStr.match(/(\d+\/\d+)SM$/);
    if (!fractionMatch) {
     // console.log('No fraction match found');
      return null;
    }
    
    const cleanStr = fractionMatch[1];
    const [numerator, denominator] = cleanStr.split('/').map(Number);
    const result = numerator / denominator;
   // console.log('Fraction result:', { numerator, denominator, result });
    return result;
  }

  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    const nextComponent = components[i + 1];
    //console.log('Processing component:', component, 'Next:', nextComponent);

    if (component.includes('SM')) {
      const parts = component.split(' ');
      if (parts.length > 1 && parts[0].match(/^\d+$/) && parts[1].match(/^\d+\/\d+SM$/)) {
        //console.log('Found mixed number in single component');
        const wholeNumber = parseInt(parts[0]);
        const fraction = parseFraction(parts[1]);
        if (fraction !== null) {
          visibilityValue = wholeNumber + fraction;
          break;
        }
      }
      else if (parts[parts.length - 1].includes('/')) {
        //console.log('Found pure fraction');
        const fraction = parseFraction(parts[parts.length - 1]);
        if (fraction !== null) {
          visibilityValue = fraction;
          break;
        }
      }
      else {
        const wholeMatch = parts[parts.length - 1].match(/^(\d+)SM$/);
        if (wholeMatch) {
          //console.log('Found whole number');
          visibilityValue = parseInt(wholeMatch[1]);
          break;
        }
      }
    }
    else if (component.match(/^\d+$/) && nextComponent?.match(/^\d+\/\d+SM$/)) {
      //console.log('Found split mixed number');
      const wholeNumber = parseInt(component);
      const fraction = parseFraction(nextComponent);
      if (fraction !== null) {
        visibilityValue = wholeNumber + fraction;
        i++;
        break;
      }
    }
  }

 // console.log('Final visibility value:', visibilityValue);
  return visibilityValue;
}


export function parseMETAR(metarString) {
  // Replace all occurrences of "−" with "-"
  metarString = metarString.replace(/−/g, '-');

  const components = metarString.split(' ');
  let wind = '';
  let visibility = '';
  let ceiling = Infinity;
  
  // Use new visibility parser
  const visibilityValue = parseVisibility(metarString);
 

  // Handle ceiling
  for (const component of components) {
    if (component.match(/^\d{3}\d{2}KT$/) || component.match(/^\d{3}V\d{3}$/)) {
      wind = component;
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

  // Return an array of categorized NOTAMs
  return [
    futureNotams,    // Index 0: Future NOTAMs
    todayNotams,     // Index 1: Today's NOTAMs
    last7DaysNotams, // Index 2: NOTAMs from the last 7 days
    last30DaysNotams,// Index 3: NOTAMs from the last 30 days
    olderNotams      // Index 4: Older NOTAMs
  ];
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
    if (isCraneFilterActive && (notamText.includes('CRANE') || notamText.includes('TOWER'))) {
      return false; // Exclude NOTAMs that mention "CRANE" or "TOWER"
    }
    return notamText.toLowerCase().includes(normalizedSearchTerm);
  })
    .map((notam) => {
      const notamText = JSON.parse(notam.text).raw;
      let highlightedText = notamText
        .replace(ifrTerms, '$&')
        .replace(lifrTerms, '$&')
        .replace(mvfrTerms, '$&');

      if (normalizedSearchTerm) {
        const searchTermRegex = new RegExp(`(${normalizedSearchTerm})`, 'gi');
        highlightedText = highlightedText.replace(searchTermRegex, '$1');
      }

      return { ...notam, highlightedText };
    });
}



export function countFilteredNotams(notams, type, searchTerm, isCraneFilterActive) {
  // Filter NOTAMs based on the search term and crane filter
  const filteredNotams = filterAndHighlightNotams(notams, searchTerm, isCraneFilterActive);

  // Return the count of filtered NOTAMs that match the specified type
  return filteredNotams.filter((notam) => {
    const displayText = extractTextBeforeFR(JSON.parse(notam.text).raw);
    const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
    if (!qLineMatch) return false;
    return qLineMatch[2].startsWith(type); // Check if the NOTAM matches the type
  }).length;
}



export function parseMETARForCeilingAndVisibility(metarString) {
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


export const renderNotamsW = (notams, title, searchTerm) => {
  const notamsToRender = notams.filter((notam) => {
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
          const expirationDate = expirationMatch ? parseNotamDate(expirationMatch[1]) : null;
          const localExpirationDate = expirationDate
            ? new Date(expirationDate.getTime() - expirationDate.getTimezoneOffset() * 60000)
            : null;

          const lines = displayText.split('\n');
          let inBold = false;

          return (
            <div key={index} className="mb-4">
              {lines.map((line, lineIndex) => {
                if (line.includes('E)')) inBold = true;
                if (line.includes('F)')) inBold = false;
                return (
                  <p key={lineIndex} className="mb-1">
                    {inBold ? (
                      <strong>{highlightNotamTermsJSX(line, searchTerm)}</strong>
                    ) : (
                      highlightNotamTermsJSX(line, searchTerm)
                    )}
                  </p>
                );
              })}
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


export const renderNotamsE = (notams, title, searchTerm) => {
  const notamsToRender = notams.filter(notam => {
    const notamText = JSON.parse(notam.text);
    const displayText = extractTextBeforeFR(notamText.raw);

    const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
    return qLineMatch && qLineMatch[2].startsWith('E');
  });

  return (
    <div>
      <h2 className="font-bold bg-gray-100 p-2 rounded">{title}</h2>
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
            ? new Date(expirationDate.getTime() - expirationDate.getTimezoneOffset() * 60000)
            : null;

          const lines = displayText.split('\n');
          let inBold = false;

          return (
            <div key={index} className="mb-4">
              {lines.map((line, lineIndex) => {
                if (line.includes('E)')) inBold = true;
                if (line.includes('F)')) inBold = false;
                return (
                  <p key={lineIndex} className="mb-1">
                    {inBold ? (
                      <strong>{highlightNotamTermsJSX(line, searchTerm)}</strong>
                    ) : (
                      highlightNotamTermsJSX(line, searchTerm)
                    )}
                  </p>
                );
              })}
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


export const highlightNotamTermsJSX = (text, searchTerm) => {
  const lifrTerms = /\b(RSC|SERVICE|AUTH)\b/g;
  const ifrTerms = /\b(CLOSED|CLSD|OUT OF SERVICE|RWY|U\/S)\b/g;
  const mvfrTerms = /\b(TWY CLOSED)\b/g;

  const searchTermRegex = searchTerm ? new RegExp(`(${searchTerm})`, 'gi') : null;

  const parts = text.split(/(\s+)/);

  return parts.map((part, index) => {
    if (searchTerm && searchTermRegex && searchTermRegex.test(part)) {
      return (
        <span key={index} style={{ backgroundColor: 'yellow' }}>
          {part}
        </span>
      );
    } else if (lifrTerms.test(part)) {
      return (
        <span key={index} style={{ color: '#ff40ff' }}>
          {part}
        </span>
      );
    } else if (ifrTerms.test(part)) {
      return (
        <span key={index} style={{ color: '#ff2700' }}>
          {part}
        </span>
      );
    } else if (mvfrTerms.test(part)) {
      return (
        <span key={index} style={{ color: '#236ed8' }}>
          {part}
        </span>
      );
    } else {
      return <span key={index}>{part}</span>;
    }
  });
};
