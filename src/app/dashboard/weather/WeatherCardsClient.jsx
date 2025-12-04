'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRccContext } from '@/app/dashboard/RccCalculatorContext';
import { parseMETAR, parseVisibility } from '@/app/lib/component/functions/weatherAndNotam';

const CATEGORY_COLORS = {
  VFR: '#07c502',
  MVFR: '#236ed8',
  IFR: '#ff2700',
  LIFR: '#ff40ff',
  Unknown: '#6B7280',
};

// Get flight category for TAF line
function getFlightCategory(ceiling, visibility) {
  if (ceiling < 500 || visibility < 1) {
    return { category: 'LIFR', color: CATEGORY_COLORS.LIFR };
  } else if (ceiling < 1000 || visibility < 3) {
    return { category: 'IFR', color: CATEGORY_COLORS.IFR };
  } else if (ceiling <= 3000 || visibility <= 5) {
    return { category: 'MVFR', color: CATEGORY_COLORS.MVFR };
  } else if (ceiling > 3000 && visibility > 5) {
    return { category: 'VFR', color: CATEGORY_COLORS.VFR };
  } else {
    return { category: 'Unknown', color: CATEGORY_COLORS.Unknown };
  }
}

// Format TAF text with line breaks and colors for FM, BECMG, TEMPO, PROB30, PROB40
function formatTAF(tafText) {
  if (!tafText) return '';
  
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
  let currentColor = CATEGORY_COLORS.Unknown;
  let firstLineCategory = 'Unknown';
  let firstLineColor = CATEGORY_COLORS.Unknown;
  
  return processedLines.map((line, index) => {
    let ceiling = Infinity;
    const ceilingMatch = line.match(/\b(OVC|BKN|VV)\d{3}\b/);
    if (ceilingMatch) {
      ceiling = parseInt(ceilingMatch[0].slice(-3)) * 100;
    }

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
        : currentColor !== CATEGORY_COLORS.Unknown
        ? currentColor
        : firstLineColor;

    if (line.includes('NSW') && ceiling === Infinity && visibility === Infinity) {
      lineColor = CATEGORY_COLORS.VFR;
    }

    return (
      <div key={index} style={{ marginBottom: 4, color: lineColor }}>
        {line}
      </div>
    );
  });
}

// Simple, reliable cards component — one card per airport in `airportValues`.
export default function WeatherCardsClient({ searchQuery = '' }) {
  const { airportValues, confirmedAirportCodes, allWeatherData, setAllWeatherData, setLastUpdated, expandedCards, setExpandedCards } = useRccContext();
  const [categories, setCategories] = useState(() => {
    // Initialize categories from existing weather data
    const initialCategories = {};
    if (allWeatherData) {
      Object.keys(allWeatherData).forEach(code => {
        const data = allWeatherData[code];
        let metarText = null;
        if (data?.data && Array.isArray(data.data)) {
          const latest = data.data.find(item => item.type === 'metar' || item.type === 'speci');
          if (latest?.text) metarText = latest.text;
        }
        
        if (metarText) {
          try {
            const parsed = parseMETAR(metarText);
            initialCategories[code] = {
              category: parsed.category || 'Unknown',
              color: CATEGORY_COLORS[parsed.category] || CATEGORY_COLORS.Unknown
            };
          } catch (err) {
            initialCategories[code] = { category: 'Unknown', color: CATEGORY_COLORS.Unknown };
          }
        }
      });
    }
    return initialCategories;
  });
  const inFlightRef = useRef(new Set());

  // Combine persisted airportValues with temporary confirmed codes from the input
  const allCodes = React.useMemo(() => {
    const persistedCodes = (airportValues || []).map(a => a.code);
    const tempCodes = confirmedAirportCodes || [];
    // Merge and deduplicate
    const uniqueCodes = Array.from(new Set([...persistedCodes, ...tempCodes]));
    return uniqueCodes;
  }, [airportValues, confirmedAirportCodes]);

  // Filter codes based on search query
  const filteredCodes = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return allCodes;
    }

    // Split search query by spaces and filter out empty strings
    const searchTerms = searchQuery.toUpperCase().split(/\s+/).filter(term => term.length > 0);
    
    if (searchTerms.length === 0) {
      return allCodes;
    }

    // If any search term is a complete airport code (4 chars), show exact matches
    // Otherwise, show airports that contain any of the search terms
    return allCodes.filter(code => {
      const upperCode = code.toUpperCase();
      return searchTerms.some(term => {
        // If the term is 4 characters (complete code), require exact match
        if (term.length === 4) {
          return upperCode === term;
        }
        // Otherwise, check if code contains the partial term
        return upperCode.includes(term);
      });
    });
  }, [allCodes, searchQuery]);

  // Sort codes by flight category priority (LIFR > IFR > MVFR > VFR > Unknown)
  const sortedCodes = React.useMemo(() => {
    const categoryPriority = {
      'LIFR': 1,
      'IFR': 2,
      'MVFR': 3,
      'VFR': 4,
      'Unknown': 5
    };

    return [...filteredCodes].sort((a, b) => {
      const catA = categories[a]?.category || 'Unknown';
      const catB = categories[b]?.category || 'Unknown';
      return categoryPriority[catA] - categoryPriority[catB];
    });
  }, [filteredCodes, categories]);

  // Group codes by flight category
  const groupedByCategory = React.useMemo(() => {
    const groups = {
      'LIFR': [],
      'IFR': [],
      'MVFR': [],
      'VFR': [],
      'Unknown': []
    };

    sortedCodes.forEach(code => {
      const category = categories[code]?.category || 'Unknown';
      // Ensure the category exists in groups (fallback to Unknown if category is invalid)
      if (groups[category]) {
        groups[category].push(code);
      } else {
        groups['Unknown'].push(code);
      }
    });

    // Return only categories that have airports
    return Object.entries(groups).filter(([_, codes]) => codes.length > 0);
  }, [sortedCodes, categories]);

  // Toggle card expansion
  const toggleCard = (code) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(code)) {
        newSet.delete(code);
      } else {
        newSet.add(code);
      }
      return newSet;
    });
  };

  // Fetch weather data for codes that don't have it yet
  useEffect(() => {
    allCodes.forEach(code => {
      if (allWeatherData?.[code] || inFlightRef.current.has(code)) return;

      inFlightRef.current.add(code);
      fetch(`/api/weather?code=${encodeURIComponent(code)}`)
        .then(r => r.json())
        .then((data) => {
          setAllWeatherData(prev => ({ ...(prev || {}), [code]: data }));
          setLastUpdated(Date.now());
          
          // Parse METAR and store category
          let metarText = null;
          if (data?.data && Array.isArray(data.data)) {
            const latest = data.data.find(item => item.type === 'metar' || item.type === 'speci');
            if (latest?.text) metarText = latest.text;
          }

          if (metarText) {
            try {
              const parsed = parseMETAR(metarText);
              setCategories(prev => ({
                ...prev,
                [code]: {
                  category: parsed.category || 'Unknown',
                  color: CATEGORY_COLORS[parsed.category] || CATEGORY_COLORS.Unknown
                }
              }));
            } catch (err) {
              setCategories(prev => ({
                ...prev,
                [code]: { category: 'Unknown', color: CATEGORY_COLORS.Unknown }
              }));
            }
          }
        })
        .catch(err => {
          console.error('Failed to fetch weather for', code, err);
          setCategories(prev => ({
            ...prev,
            [code]: { category: 'Unknown', color: CATEGORY_COLORS.Unknown }
          }));
        })
        .finally(() => {
          inFlightRef.current.delete(code);
        });
    });
  }, [allCodes, allWeatherData, setAllWeatherData, setLastUpdated]);

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {allCodes.length === 0 ? (
        <div style={{
          padding: 12,
          borderRadius: 6,
          border: '1px dashed #bbb',
          background: '#fafafaff',
          color: '#222',
          width: '100%'
        }}>
          No airports added — cards will appear here.
        </div>
      ) : filteredCodes.length === 0 ? (
        <div style={{
          padding: 12,
          borderRadius: 6,
          border: '1px dashed #bbb',
          background: '#fafafaff',
          color: '#222',
          width: '100%'
        }}>
          No airports match your search criteria.
        </div>
      ) : (
        groupedByCategory.map(([category, codes]) => (
          <div key={category}>
            {/* Category row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
              {codes.map((code) => {
                const info = categories[code] || { category: 'Unknown', color: CATEGORY_COLORS.Unknown };
                const isExpanded = expandedCards.has(code);
                
                // Get last 4 METARs for this airport
                const weatherData = allWeatherData?.[code];
                const metars = weatherData?.data
                  ? weatherData.data.filter(item => item.type === 'metar' || item.type === 'speci').slice(0, 4)
                  : [];
                
                // Get latest TAF for this airport
                const taf = weatherData?.data
                  ? weatherData.data.find(item => item.type === 'taf')
                  : null;
                
                return (
                  <div 
                    key={code} 
                    style={{
                      minWidth: 200,
                      maxWidth: isExpanded ? 500 : 200,
                      flex: isExpanded ? '1 1 400px' : '0 0 auto',
                      padding: 10,
                      borderRadius: 6,
                      border: '1px solid #ddd',
                      background: '#fff',
                      color: '#111',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => toggleCard(code)}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: 8
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{code}</span>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 44,
                          height: 18,
                          borderRadius: 9,
                          backgroundColor: info.color,
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '0 6px'
                        }}>
                          {info.category}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: 16, 
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}>
                        ▼
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <>
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #eee' }}>
                          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>METAR</div>
                          {metars.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {metars.map((metar, idx) => {
                                const parsed = parseMETAR(metar.text);
                                const metarColor = CATEGORY_COLORS[parsed.category] || CATEGORY_COLORS.Unknown;
                                return (
                                  <div key={idx} style={{ fontSize: 11, color: metarColor, fontFamily: 'monospace', lineHeight: 1.3 }}>
                                    {metar.text}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{ fontSize: 11, color: '#999' }}>No METAR data available</div>
                          )}
                        </div>

                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #eee' }}>
                          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>TAF</div>
                          {taf?.text ? (
                            <div style={{ fontSize: 11, fontFamily: 'monospace', lineHeight: 1.3 }}>
                              {formatTAF(taf.text)}
                            </div>
                          ) : (
                            <div style={{ fontSize: 11, color: '#999' }}>No TAF data available</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
