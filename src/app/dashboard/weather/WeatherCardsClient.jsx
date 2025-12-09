'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRccContext } from '@/app/dashboard/RccCalculatorContext';
import { parseMETAR, parseVisibility, categorizeNotams, extractTextBeforeFR, filterAndHighlightNotams, parseNotamDate, formatLocalDate } from '@/app/lib/component/functions/weatherAndNotam';
import GfaCardDisplay from './GfaCardDisplay';

// Get dark mode colors
function getThemeColors(darkMode) {
  return {
    containerBg: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#1a1a1a' : '#ffffff',
    border: darkMode ? '#333' : '#ddd',
    text: darkMode ? '#fff' : '#111',
    mutedText: darkMode ? '#aaa' : '#666',
    emptyStateBg: darkMode ? '#1a1a1a' : '#f5f5f5',
    emptyStateBorder: darkMode ? '#444' : '#bbb'
  };
}

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

// Format METAR text with intelligent bolding of determining elements
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
    // Apply bold tags for determining ceiling/visibility elements
    if (boldCeiling && ceilingMatch && part.includes(ceilingMatch[0])) {
      return <strong key={index}>{part}</strong>;
    } else if (boldVisibility && visibilityMatch && part.includes(visibilityMatch[0])) {
      return <strong key={index}>{part}</strong>;
    }

    // Apply strong tags for any other weather terms we want to highlight
    if (termsRegex.test(part)) {
      return <strong key={index}>{part}</strong>;
    }

    // Otherwise, return the normal part
    return <span key={index}>{part}</span>;
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

// Helper function to filter NOTAMs by type (AERODROME, ENROUTE, WARNING)
function filterNotamsByType(notams, type) {
  if (!type || type === 'ALL') return notams;
  
  return notams.filter(notam => {
    try {
      const notamText = typeof notam.text === 'string' ? JSON.parse(notam.text) : notam.text;
      const displayText = extractTextBeforeFR(notamText.raw || notamText);
      const qLineMatch = displayText.match(/Q\)([^\/]*\/){4}([^\/]*)\//);
      
      if (!qLineMatch) return false;
      
      const notamTypeCode = qLineMatch[2];
      const typeMap = {
        'AERODROME': (code) => code.startsWith('A'),
        'ENROUTE': (code) => code.startsWith('E'),
        'WARNING': (code) => code.startsWith('W')
      };
      
      const typeChecker = typeMap[type];
      return typeChecker ? typeChecker(notamTypeCode) : false;
    } catch (err) {
      return false;
    }
  });
}

// Helper function to get NOTAM type counts
function getNotamTypeCounts(notams, isCraneActive = false) {
  // Apply crane filter first if active
  const filteredNotams = isCraneActive 
    ? notams.filter(notam => {
        const notamText = typeof notam.text === 'string' ? JSON.parse(notam.text) : notam.text;
        const displayText = extractTextBeforeFR(notamText.raw || notam.text);
        const upperText = displayText.toUpperCase();
        return !upperText.includes('CRANE') && !upperText.includes('TOWER');
      })
    : notams;
  
  const aerodrome = filterNotamsByType(filteredNotams, 'AERODROME').length;
  const enroute = filterNotamsByType(filteredNotams, 'ENROUTE').length;
  const warning = filterNotamsByType(filteredNotams, 'WARNING').length;
  return { aerodrome, enroute, warning, all: filteredNotams.length };
}

const CATEGORY_RANK = {
  LIFR: 0,
  IFR: 1,
  MVFR: 2,
  VFR: 3,
};

function isDowngrade(prevCat, nextCat) {
  if (!prevCat || !nextCat) return false;
  const prevRank = CATEGORY_RANK[prevCat];
  const nextRank = CATEGORY_RANK[nextCat];
  if (prevRank === undefined || nextRank === undefined) return false;
  return nextRank < prevRank; // lower rank = worse category
}

// Detect presence of SNOWTAM-like info (RSC/RWYCC) and return first matching text
function getSnowtamInfo(notams) {
  if (!notams || notams.length === 0) return { hasSnowtam: false, text: '' };
  // Broad match for any RSC or RWYCC mention to catch varied runway formats
  const snowRegex = /\b(RSC|RWYCC)\b/i;

  for (const notam of notams) {
    try {
      const notamText = typeof notam.text === 'string' ? JSON.parse(notam.text) : notam.text;
      const rawText = notamText?.raw || notam.text;
      if (!rawText) continue;
      const displayText = extractTextBeforeFR(rawText);
      if (snowRegex.test(displayText)) {
        return { hasSnowtam: true, text: displayText };
      }
    } catch (err) {
      continue;
    }
  }

  return { hasSnowtam: false, text: '' };
}

// Helper function to highlight RSC patterns and search terms in text
function highlightRSCAndSearchPattern(text, searchTerm = '') {
  // Match pattern: RSC + 2 digits + space + digit/digit/digit
  const rscPattern = /(RSC\s+\d{2}\s+\d\/\d\/\d)/gi;
  
  const parts = [];
  let lastIndex = 0;
  
  // First, split by RSC pattern
  const rscRegex = new RegExp(rscPattern.source, 'gi');
  let match;
  
  while ((match = rscRegex.exec(text)) !== null) {
    // Process text before RSC match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      parts.push(...highlightSearchInText(beforeText, searchTerm));
    }
    // Add RSC match - check if it also matches search term
    if (searchTerm && match[0].toUpperCase().includes(searchTerm.toUpperCase())) {
      parts.push({ text: match[0], highlightType: 'rsc-search' });
    } else {
      parts.push({ text: match[0], highlightType: 'rsc' });
    }
    lastIndex = rscRegex.lastIndex;
  }
  
  // Process remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    parts.push(...highlightSearchInText(remainingText, searchTerm));
  }
  
  return parts.length > 0 ? parts : [{ text, highlightType: null }];
}

// Helper function to highlight search terms in text
function highlightSearchInText(text, searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return [{ text, highlightType: null }];
  }
  
  const parts = [];
  const searchRegex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  let lastIndex = 0;
  let match;
  
  while ((match = searchRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({ text: text.substring(lastIndex, match.index), highlightType: null });
    }
    // Add search match
    parts.push({ text: match[0], highlightType: 'search' });
    lastIndex = searchRegex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ text: text.substring(lastIndex), highlightType: null });
  }
  
  return parts.length > 0 ? parts : [{ text, highlightType: null }];
}

// Helper function to render individual NOTAM with dates
function renderNotamItem(notam, searchTerm, theme) {
  try {
    const notamText = typeof notam.text === 'string' ? JSON.parse(notam.text) : notam.text;
    const displayText = extractTextBeforeFR(notam.highlightedText || notamText.raw || notam.text);
    
    // Parse dates
    const startMatch = (notamText.raw || notam.text).match(/B\)\s*(\d{10})/);
    const expirationMatch = (notamText.raw || notam.text).match(/C\)\s*(\d{10})/);
    
    const startDate = startMatch ? parseNotamDate(startMatch[1]) : null;
    const expirationDate = expirationMatch ? parseNotamDate(expirationMatch[1]) : null;
    
    const localStartDate = startDate ? formatLocalDate(startDate) : null;
    const localExpirationDate = expirationDate ? formatLocalDate(new Date(expirationDate.getTime() - expirationDate.getTimezoneOffset() * 60000)) : null;
    
    const lines = displayText.split('\n');
    let inBold = false;

    return (
      <div key={notam.ident} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ fontSize: 9, color: theme.mutedText, marginBottom: 4, fontWeight: 600 }}>
          {notam.ident || 'NOTAM'}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 10, lineHeight: 1.4, color: theme.text }}>
          {lines.map((line, lineIndex) => {
            if (line.includes('E)')) inBold = true;
            if (line.includes('F)')) inBold = false;
            
            // Apply RSC and search term highlighting
            const highlightedParts = highlightRSCAndSearchPattern(line, searchTerm);
            
            return (
              <div key={lineIndex} style={{ marginBottom: 2 }}>
                {inBold ? (
                  <strong>
                    {highlightedParts.map((part, partIndex) => {
                      if (part.highlightType === 'rsc-search') {
                        return (
                          <span key={partIndex} style={{ backgroundColor: 'yellow', color: 'black', padding: '0 2px', fontWeight: 'bold' }}>
                            {part.text}
                          </span>
                        );
                      } else if (part.highlightType === 'rsc') {
                        return (
                          <span key={partIndex} style={{ fontWeight: 'bold' }}>
                            {part.text}
                          </span>
                        );
                      } else if (part.highlightType === 'search') {
                        return (
                          <span key={partIndex} style={{ backgroundColor: 'yellow', color: 'black', padding: '0 2px' }}>
                            {part.text}
                          </span>
                        );
                      } else {
                        return <span key={partIndex}>{part.text}</span>;
                      }
                    })}
                  </strong>
                ) : (
                  highlightedParts.map((part, partIndex) => {
                    if (part.highlightType === 'rsc-search') {
                      return (
                        <span key={partIndex} style={{ backgroundColor: 'yellow', color: 'black', padding: '0 2px', fontWeight: 'bold' }}>
                          {part.text}
                        </span>
                      );
                    } else if (part.highlightType === 'rsc') {
                      return (
                        <span key={partIndex} style={{ fontWeight: 'bold' }}>
                          {part.text}
                        </span>
                      );
                    } else if (part.highlightType === 'search') {
                      return (
                        <span key={partIndex} style={{ backgroundColor: 'yellow', color: 'black', padding: '0 2px' }}>
                          {part.text}
                        </span>
                      );
                    } else {
                      return <span key={partIndex}>{part.text}</span>;
                    }
                  })
                )}
              </div>
            );
          })}
        </div>
        {startDate && (
          <div style={{ marginTop: 6, fontSize: 9, color: '#2563eb' }}>
            <div>Effective (UTC): {startDate.toUTCString()}</div>
            <div>Effective (Local): {localStartDate}</div>
          </div>
        )}
        {expirationDate && (
          <div style={{ marginTop: 4, fontSize: 9, color: '#2563eb' }}>
            <div>Expires (UTC): {expirationDate.toUTCString()}</div>
            <div>Expires (Local): {localExpirationDate}</div>
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error('Error rendering NOTAM:', err);
    return (
      <div key={notam.ident} style={{ fontSize: 10, color: theme.mutedText }}>
        {notam.text || 'Unable to display NOTAM'}
      </div>
    );
  }
}

// Auto-polling configuration
const AUTO_REFRESH_INTERVAL = 60 * 1000; // 1 minute for background updates (catch SPECI METARs faster)
const GFA_NORMAL_INTERVAL = 30 * 60 * 1000; // 30 minutes for normal GFA checks
const GFA_PEAK_INTERVAL = 5 * 60 * 1000; // 5 minutes during release windows (0000-0030, 0600-0630, 1200-1230, 1800-1830 UTC)
const GFA_PEAK_WINDOWS = [
  { start: 0, end: 30 },     // 0000-0030 UTC
  { start: 360, end: 390 },  // 0600-0630 UTC
  { start: 720, end: 750 },  // 1200-1230 UTC
  { start: 1080, end: 1110 } // 1800-1830 UTC
];
const GFA_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for GFA cache

// Helper to check if current UTC time is within a GFA release window
const isInGfaReleaseWindow = () => {
  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return GFA_PEAK_WINDOWS.some(window => utcMinutes >= window.start && utcMinutes < window.end);
};

// Helper to get appropriate GFA refresh interval
const getGfaRefreshInterval = () => {
  return isInGfaReleaseWindow() ? GFA_PEAK_INTERVAL : GFA_NORMAL_INTERVAL;
};

// Simple, reliable cards component — one card per airport in `airportValues`.
export default function WeatherCardsClient({ searchQuery = '', isExpandMode = false, viewMode = 'flightCategory' }) {
  const { 
    airportValues, 
    confirmedAirportCodes, 
    allWeatherData, 
    setAllWeatherData, 
    setLastUpdated, 
    expandedCards, 
    setExpandedCards,
    expandedNotams,
    setExpandedNotams,
    selectedNotamTypePerAirport,
    setSelectedNotamTypePerAirport,
    notamSearchTerms,
    setNotamSearchTerms,
    craneFilterActive,
    setCraneFilterActive,
    darkMode 
  } = useRccContext();
  const theme = getThemeColors(darkMode);
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
  const [selectedNotamType, setSelectedNotamType] = useState({}); // Track selected NOTAM type per airport (e.g., { CYUL: 'AERODROME', ... }) - legacy, use context selectedNotamTypePerAirport
  const [hoveredCard, setHoveredCard] = useState(null); // Track which card is being hovered
  const [snowPopup, setSnowPopup] = useState(null); // Track snowtam tooltip
  const snowHideTimeout = useRef(null); // timeout for hiding snow popup
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 }); // Track popup position
  const downgradeAlertsRef = useRef({}); // Track downgrade alerts per code (arrays)
  const prevCategoryRef = useRef({}); // Track previous category per code
  const [downgradeAlerts, setDowngradeAlerts] = useState({}); // Visible downgrade messages per code (arrays)
  const undoTimersRef = useRef({}); // Track undo timers per code
  const pendingUndoRef = useRef({}); // Track last dismissed alerts per code for undo
  const cardRefs = useRef({}); // Store refs to cards for position calculation
  const inFlightRef = useRef(new Set());
  const autoRefreshIntervalsRef = useRef(new Map()); // Track auto-refresh intervals per airport
  const gfaAutoRefreshIntervalsRef = useRef(new Map()); // Track GFA auto-refresh intervals per airport
  const primedRef = useRef(false); // skip warnings until after initial categories are captured
  const [activeNotamGfaView, setActiveNotamGfaView] = useState(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('activeNotamGfaView');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  }); // Track NOTAM vs GFA view per code: { CYUL: 'NOTAM' | 'GFA' }
  const [gfaTypePerAirport, setGfaTypePerAirport] = useState(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gfaTypePerAirport');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  }); // Track GFA type (CLDWX or TURBC) per code
  const [selectedTimestampPerAirport, setSelectedTimestampPerAirport] = useState(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedTimestampPerAirport');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  }); // Track selected timestamp per code for GFA

  // Save GFA state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeNotamGfaView', JSON.stringify(activeNotamGfaView));
    }
  }, [activeNotamGfaView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gfaTypePerAirport', JSON.stringify(gfaTypePerAirport));
    }
  }, [gfaTypePerAirport]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTimestampPerAirport', JSON.stringify(selectedTimestampPerAirport));
    }
  }, [selectedTimestampPerAirport]);

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

  const viewGroups = React.useMemo(() => {
    return viewMode === 'flightCategory'
      ? groupedByCategory
      : [['AIRPORT LIST', filteredCodes]];
  }, [viewMode, groupedByCategory, filteredCodes]);

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

  // Toggle NOTAM section expansion
  const toggleNotam = (code) => {
    const notamKey = `${code}:0`;
    setExpandedNotams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notamKey)) {
        newSet.delete(notamKey);
      } else {
        newSet.add(notamKey);
      }
      return newSet;
    });
  };

  // Auto-expand new cards when added while in expand mode
  useEffect(() => {
    if (isExpandMode) {
      // Add any new codes that aren't already in expandedCards
      const newCodesToExpand = allCodes.filter(code => !expandedCards.has(code));
      if (newCodesToExpand.length > 0) {
        setExpandedCards(prev => {
          const newSet = new Set(prev);
          newCodesToExpand.forEach(code => newSet.add(code));
          return newSet;
        });
      }
    }
  }, [allCodes, isExpandMode, expandedCards, setExpandedCards]);

  // Fetch weather data for codes that don't have it yet
  useEffect(() => {
    allCodes.forEach(code => {
      if (allWeatherData?.[code] || inFlightRef.current.has(code)) return;

      inFlightRef.current.add(code);
      // Add timestamp to prevent browser caching, and force=true to bypass server cache
      fetch(`/api/weather?code=${encodeURIComponent(code)}&t=${Date.now()}&force=true`)
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

          // Set up auto-refresh polling for this code if not already set up
          if (!autoRefreshIntervalsRef.current.has(code)) {
            console.log(`[Auto-Refresh] Starting for ${code} every ${AUTO_REFRESH_INTERVAL}ms`);
            const intervalId = setInterval(async () => {
              try {
                // Silently fetch fresh data in background (with timestamp to prevent browser caching)
                const response = await fetch(`/api/weather?code=${encodeURIComponent(code)}&t=${Date.now()}`);
                const freshData = await response.json();
                setAllWeatherData(prev => ({ ...(prev || {}), [code]: freshData }));
                setLastUpdated(Date.now());
                
                // Parse fresh METAR and update category
                let freshMetarText = null;
                if (freshData?.data && Array.isArray(freshData.data)) {
                  const latest = freshData.data.find(item => item.type === 'metar' || item.type === 'speci');
                  if (latest?.text) freshMetarText = latest.text;
                }

                if (freshMetarText) {
                  try {
                    const parsed = parseMETAR(freshMetarText);
                    setCategories(prev => ({
                      ...prev,
                      [code]: {
                        category: parsed.category || 'Unknown',
                        color: CATEGORY_COLORS[parsed.category] || CATEGORY_COLORS.Unknown
                      }
                    }));
                  } catch (err) {
                    console.error(`[Auto-Refresh] Failed to parse METAR for ${code}:`, err);
                  }
                }
                
                console.log(`[Auto-Refresh] Updated weather for ${code}`);
              } catch (error) {
                console.error(`[Auto-Refresh] Failed for ${code}:`, error);
                // Continue polling even on error
              }
            }, AUTO_REFRESH_INTERVAL);
            autoRefreshIntervalsRef.current.set(code, intervalId);
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

    // Cleanup: Clear intervals for codes that are no longer in allCodes
    return () => {
      autoRefreshIntervalsRef.current.forEach((intervalId, code) => {
        if (!allCodes.includes(code)) {
          clearInterval(intervalId);
          autoRefreshIntervalsRef.current.delete(code);
          console.log(`[Auto-Refresh] Cleared for ${code}`);
        }
      });
    };
  }, [allCodes, allWeatherData, setAllWeatherData, setLastUpdated]);

  // Track downgrades after initial load
  useEffect(() => {
    if (!categories) return;

    Object.entries(categories).forEach(([code, value]) => {
      const nextCat = value?.category;
      if (!nextCat) return;

      const prevCat = prevCategoryRef.current[code];

      // Always record the current category
      prevCategoryRef.current[code] = nextCat;

      // Skip warnings until we've seen at least one full pass
      if (!primedRef.current) return;

      if (prevCat && isDowngrade(prevCat, nextCat)) {
        const alert = { id: Date.now(), from: prevCat, to: nextCat, ts: Date.now() };
        const existing = downgradeAlertsRef.current[code] || [];
        const nextAlerts = [...existing, alert];
        downgradeAlertsRef.current[code] = nextAlerts;
        setDowngradeAlerts(prev => ({ ...prev, [code]: nextAlerts }));
      }
    });

    // After the first categories set, prime future warnings
    if (!primedRef.current) {
      primedRef.current = true;
    }
  }, [categories]);

  // Get GFA data - stored per airport to prevent cross-airport data mixing
  const [gfaDataPerAirport, setGfaDataPerAirport] = useState(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gfaDataPerAirport');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  const [gfaDataLoading, setGfaDataLoading] = useState(false);
  const gfaFetchCache = useRef({}); // Cache GFA fetches per airport+type to avoid duplicate requests
  const gfaLastUpdateRef = useRef({}); // Track last update timestamps to detect new releases

  // Save GFA data per airport to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gfaDataPerAirport', JSON.stringify(gfaDataPerAirport));
    }
  }, [gfaDataPerAirport]);

  // Helper function to fetch GFA data - wrapped in useCallback to stabilize reference
  const fetchGfaData = useCallback((code, gfaType) => {
    setGfaDataLoading(true);
    console.log(`[GFA] Fetching GFA data for type: ${gfaType} at airport: ${code}`);
    fetch(`/api/gfa?type=${encodeURIComponent(gfaType)}&airport=${encodeURIComponent(code)}&t=${Date.now()}`)
      .then(res => {
        console.log(`[GFA] API response status: ${res.status}`);
        if (!res.ok) throw new Error(`GFA API returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log(`[GFA] Received fresh GFA data for ${gfaType} at ${code}`);
        const cacheKey = `${code}:${gfaType}`;
        const newTimestamp = Date.now();
        const lastUpdate = gfaLastUpdateRef.current[cacheKey];

        // Check if this is a new update (different from last fetch)
        if (lastUpdate && newTimestamp - lastUpdate > 5000) { // At least 5 seconds different
          console.log(`[GFA] New GFA data detected for ${gfaType} at ${code}`);
        }

        gfaLastUpdateRef.current[cacheKey] = newTimestamp;
        gfaFetchCache.current[cacheKey] = { data, timestamp: newTimestamp };
        // Store data per airport, not globally
        setGfaDataPerAirport(prev => ({ ...prev, [code]: data }));
        setGfaDataLoading(false);
      })
      .catch(err => {
        console.error(`[GFA] Failed to fetch ${gfaType}:`, err);
        setGfaDataLoading(false);
      });
  }, []);

  // Load GFA when needed and set up smart auto-refresh (per active airport)
  useEffect(() => {
    const activeGfaCodes = Object.keys(activeNotamGfaView).filter(k => activeNotamGfaView[k] === 'GFA');

    activeGfaCodes.forEach((code) => {
      const gfaType = gfaTypePerAirport[code] || 'CLDWX';
      const cacheKey = `${code}:${gfaType}`;

      // Always invalidate cache and fetch fresh on view activation or type change
      delete gfaFetchCache.current[cacheKey];
      fetchGfaData(code, gfaType);

      // Set up smart auto-refresh with dynamic intervals per airport
      if (!gfaAutoRefreshIntervalsRef.current.has(code)) {
        console.log(`[GFA Auto-Refresh] Starting smart refresh for ${code}`);

        const setupRefreshInterval = () => {
          const currentInterval = getGfaRefreshInterval();
          const isInPeak = isInGfaReleaseWindow();
          console.log(`[GFA Auto-Refresh] Using ${isInPeak ? 'PEAK' : 'NORMAL'} interval (${currentInterval}ms) for ${code}`);

          const intervalId = setInterval(() => {
            // Always invalidate cache during peak windows to catch updates
            const cacheKey = `${code}:${gfaTypePerAirport[code] || 'CLDWX'}`;
            const isNowInPeak = isInGfaReleaseWindow();

            if (isNowInPeak) {
              delete gfaFetchCache.current[cacheKey];
            }

            const currentGfaType = gfaTypePerAirport[code] || 'CLDWX';
            fetchGfaData(code, currentGfaType);
            console.log(`[GFA Auto-Refresh] Updated GFA for ${code}`);

            // Re-schedule with potentially new interval if we're crossing window boundary
            const nextInterval = getGfaRefreshInterval();
            if (nextInterval !== currentInterval) {
              console.log(`[GFA Auto-Refresh] Interval changed from ${currentInterval}ms to ${nextInterval}ms`);
              clearInterval(intervalId);
              gfaAutoRefreshIntervalsRef.current.delete(code);
              setupRefreshInterval();
            }
          }, currentInterval);

          gfaAutoRefreshIntervalsRef.current.set(code, intervalId);
        };

        setupRefreshInterval();
      }
    });

    // Cleanup: Clear intervals for codes that are no longer active
    return () => {
      gfaAutoRefreshIntervalsRef.current.forEach((intervalId, code) => {
        if (!activeGfaCodes.includes(code)) {
          clearInterval(intervalId);
          gfaAutoRefreshIntervalsRef.current.delete(code);
          console.log(`[GFA Auto-Refresh] Cleared for ${code}`);
        }
      });
    };
  }, [fetchGfaData, gfaTypePerAirport, activeNotamGfaView]);

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {allCodes.length === 0 ? (
        <div style={{
          padding: 12,
          borderRadius: 6,
          border: `1px dashed ${theme.emptyStateBorder}`,
          background: theme.emptyStateBg,
          color: theme.mutedText,
          width: '100%'
        }}>
          No airports added — cards will appear here.
        </div>
      ) : filteredCodes.length === 0 ? (
        <div style={{
          padding: 12,
          borderRadius: 6,
          border: `1px dashed ${theme.emptyStateBorder}`,
          background: theme.emptyStateBg,
          color: theme.mutedText,
          width: '100%'
        }}>
          No airports match your search criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {viewGroups.map(([category, codes]) => {
            const visibleCodes = viewMode === 'flightCategory' ? codes.filter(code => filteredCodes.includes(code)) : codes;
            if (visibleCodes.length === 0) return null;

            return (
              <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Category label */}
                {viewMode === 'flightCategory' && (
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: theme.mutedText,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    {category}
                  </div>
                )}
                
                {/* Cards in row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
          {/* Compact view: show all cards in a grid, with ability to expand */}
          {visibleCodes.map((code) => {
            const info = categories[code] || { category: 'Unknown', color: CATEGORY_COLORS.Unknown };
            const isExpanded = expandedCards.has(code);
            
            // Get weather data for this airport
            const weatherData = allWeatherData?.[code];
            const metars = weatherData?.data
              ? weatherData.data.filter(item => item.type === 'metar' || item.type === 'speci').slice(0, 4)
              : [];
            const taf = weatherData?.data
              ? weatherData.data.find(item => item.type === 'taf')
              : null;
            const notams = weatherData?.data
              ? weatherData.data.filter(item => item.type === 'notam')
              : [];
            const snowInfo = getSnowtamInfo(notams);
            
            return (
              <div
                key={code}
                ref={(el) => cardRefs.current[code] = el}
                onClick={() => {
                  if (!isExpanded) {
                    toggleCard(code);
                  }
                  setHoveredCard(null); // Hide popup on click
                }}
                style={{
                  flex: isExpanded ? '0 1 calc(50% - 6px)' : '0 1 calc(20% - 10px)',
                  minWidth: 120,
                  maxWidth: isExpanded ? 'calc(50% - 6px)' : 'none',
                  padding: 10,
                  borderRadius: 6,
                  border: `1px solid ${theme.border}`,
                  background: theme.cardBg,
                  cursor: !isExpanded ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* METAR Hover Popup */}
                {hoveredCard === code && !isExpanded && metars.length > 0 && (
                  <div
                    style={{
                      position: 'fixed',
                      top: `${popupPosition.top}px`,
                      left: `${popupPosition.left}px`,
                      padding: 12,
                      backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
                      border: `1px solid ${theme.border}`,
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      zIndex: 1000,
                      minWidth: 300,
                      maxWidth: 500,
                      maxHeight: '80vh',
                      overflow: 'auto',
                      pointerEvents: 'none',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 11, marginBottom: 6, color: theme.text }}>
                      Latest METAR - {code}
                    </div>
                    {(() => {
                      const latestMetar = metars[0];
                      const parsed = parseMETAR(latestMetar.text);
                      const metarColor = CATEGORY_COLORS[parsed.category] || CATEGORY_COLORS.Unknown;
                      return (
                        <div style={{ 
                          fontSize: 11, 
                          color: metarColor, 
                          fontFamily: 'monospace', 
                          lineHeight: 1.4,
                          wordBreak: 'break-word'
                        }}>
                          {formatMetarTextJSX(latestMetar.text, parsed.ceiling, parsed.visibilityValue, parsed.category)}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {snowPopup && snowPopup.text && (
                  <div
                    onMouseEnter={() => {
                      if (snowHideTimeout.current) {
                        clearTimeout(snowHideTimeout.current);
                        snowHideTimeout.current = null;
                      }
                    }}
                    onMouseLeave={() => {
                      snowHideTimeout.current = setTimeout(() => setSnowPopup(null), 200);
                    }}
                    style={{
                      position: 'fixed',
                      top: `${snowPopup.top}px`,
                      left: `${snowPopup.left}px`,
                      padding: 12,
                      backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
                      border: `1px solid ${theme.border}`,
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      zIndex: 1000,
                      minWidth: 320,
                      maxWidth: 420,
                      maxHeight: '60vh',
                      overflow: 'auto',
                      pointerEvents: 'auto',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: theme.text,
                      lineHeight: 1.4,
                      scrollbarWidth: 'thin'
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>RSC / SNOWTAM</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{snowPopup.text}</div>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                  cursor: isExpanded ? 'pointer' : 'default',
                  padding: '4px -4px',
                  marginLeft: '-4px',
                  marginRight: '-4px',
                  marginTop: '-4px',
                  marginBottom: isExpanded ? '10px' : '0',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease',
                }}
                onClick={() => isExpanded && toggleCard(code)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: isExpanded ? 'row' : 'column',
                    gap: 6,
                    flex: 1,
                    textAlign: isExpanded ? 'left' : 'center'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: isExpanded ? 15 : 14 }}>{code}</span>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div
                        onMouseEnter={(e) => {
                        if (!isExpanded) {
                          setHoveredCard(code);
                          // Calculate popup position based on badge position
                          const rect = e.currentTarget.getBoundingClientRect();
                          const popupWidth = 300;
                          const popupHeight = 100; // Approximate height
                          const viewportWidth = window.innerWidth;
                          
                          let top = rect.top - popupHeight - 8;
                          let left = rect.left + (rect.width / 2) - (popupWidth / 2);
                          
                          // Adjust if popup goes above viewport
                          if (top < 10) {
                            top = rect.bottom + 8;
                          }
                          
                          // Adjust if popup goes beyond right edge
                          if (left + popupWidth > viewportWidth - 10) {
                            left = viewportWidth - popupWidth - 10;
                          }
                          
                          // Adjust if popup goes beyond left edge
                          if (left < 10) {
                            left = 10;
                          }
                          
                          setPopupPosition({ top, left });
                        }
                      }}
                        onMouseLeave={() => setHoveredCard(null)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 40,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: info.color,
                          color: '#fff',
                          fontSize: 9,
                          fontWeight: 600,
                          padding: '0 4px',
                          cursor: !isExpanded ? 'pointer' : 'default',
                          transition: 'opacity 0.2s ease',
                          opacity: hoveredCard === code ? 0.8 : 1,
                        }}
                      >
                        {info.category}
                      </div>
                      {snowInfo.hasSnowtam && (
                        <div
                          onMouseEnter={(e) => {
                            if (snowHideTimeout.current) {
                              clearTimeout(snowHideTimeout.current);
                              snowHideTimeout.current = null;
                            }

                            const rect = e.currentTarget.getBoundingClientRect();
                            const popupWidth = 360;
                            const popupHeight = 180; // allow room for long RSC text
                            const viewportWidth = window.innerWidth;
                            const viewportHeight = window.innerHeight;

                            let top = rect.bottom + 8;
                            let left = rect.left + rect.width / 2 - popupWidth / 2;

                            // Clamp horizontally
                            if (left + popupWidth > viewportWidth - 10) {
                              left = viewportWidth - popupWidth - 10;
                            }
                            if (left < 10) {
                              left = 10;
                            }

                            // If popup would overflow bottom, place it above
                            if (top + popupHeight > viewportHeight - 10) {
                              top = rect.top - popupHeight - 8;
                            }
                            // Final clamp top
                            if (top < 10) {
                              top = 10;
                            }

                            setSnowPopup({ top, left, text: snowInfo.text });
                          }}
                          onMouseLeave={() => {
                            snowHideTimeout.current = setTimeout(() => setSnowPopup(null), 200);
                          }}
                          style={{
                            position: 'absolute',
                            right: -22,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            backgroundColor: '#e0f2ff',
                            color: '#0d6efd',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: `1px solid ${theme.border}`,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                          }}
                          title="SNOWTAM / RSC present"
                        >
                          ❄
                        </div>
                      )}
                    </div>
                    {downgradeAlerts[code] && downgradeAlerts[code].length > 0 && (
                      <div style={{
                        marginTop: isExpanded ? 6 : 4,
                        padding: '8px 10px',
                        borderRadius: 6,
                        backgroundColor: '#fbbf24',
                        color: '#78350f',
                        border: '1px solid #f59e0b',
                        fontSize: 11,
                        fontWeight: 600,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}>
                        {downgradeAlerts[code].map((alert) => (
                          <div key={alert.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <span>Flight Category changed from {alert.from} to {alert.to}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              {pendingUndoRef.current[code] && alert.id === downgradeAlerts[code][downgradeAlerts[code].length - 1]?.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const restore = pendingUndoRef.current[code];
                                    if (!restore) return;
                                    if (undoTimersRef.current[code]) {
                                      clearTimeout(undoTimersRef.current[code]);
                                      undoTimersRef.current[code] = null;
                                    }
                                    pendingUndoRef.current[code] = null;
                                    setDowngradeAlerts(prev => ({ ...prev, [code]: restore }));
                                    downgradeAlertsRef.current[code] = restore;
                                  }}
                                  style={{
                                    border: 'none',
                                    background: '#0d6efd',
                                    color: '#fff',
                                    borderRadius: 4,
                                    padding: '2px 6px',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                  title="Undo close"
                                >
                                  Undo
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDowngradeAlerts(prev => {
                                    const list = prev[code] || [];
                                    const filtered = list.filter(a => a.id !== alert.id);
                                    const next = { ...prev, [code]: filtered };
                                    downgradeAlertsRef.current[code] = filtered;
                                    return next;
                                  });
                                }}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#78350f',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  padding: '2px 4px'
                                }}
                                title="Dismiss warning"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                    {isExpanded && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCard(code);
                        }}
                        style={{ 
                          fontSize: 16, 
                          transform: 'rotate(180deg)',
                          transition: 'transform 0.2s ease',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Close card"
                      >
                        ▼
                      </button>
                    )}
                  </div>
                  
                  {isExpanded && (
                    <>
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${theme.border}` }}>
                        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>METAR</div>
                        {metars.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {metars.map((metar, idx) => {
                              const parsed = parseMETAR(metar.text);
                              const metarColor = CATEGORY_COLORS[parsed.category] || CATEGORY_COLORS.Unknown;
                              return (
                                <div key={idx} style={{ fontSize: 11, color: metarColor, fontFamily: 'monospace', lineHeight: 1.3 }}>
                                  {formatMetarTextJSX(metar.text, parsed.ceiling, parsed.visibilityValue, parsed.category)}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: theme.mutedText }}>No METAR data available</div>
                        )}
                      </div>

                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${theme.border}` }}>
                        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>TAF</div>
                        {taf?.text ? (
                          <div style={{ fontSize: 11, fontFamily: 'monospace', lineHeight: 1.3 }}>
                            {formatTAF(taf.text)}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: theme.mutedText }}>No TAF data available</div>
                        )}
                      </div>

                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${theme.border}` }}>
                        {/* NOTAM / GFA Toggle Buttons */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveNotamGfaView(prev => ({ ...prev, [code]: 'NOTAM' }));
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              fontSize: 12,
                              fontWeight: 600,
                              border: `2px solid ${theme.border}`,
                              borderRadius: 4,
                              cursor: 'pointer',
                              backgroundColor: activeNotamGfaView[code] === 'GFA' ? theme.cardBg : theme.text,
                              color: activeNotamGfaView[code] === 'GFA' ? theme.text : theme.cardBg,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            NOTAM {notams.length > 0 ? `(${notams.length})` : '(0)'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveNotamGfaView(prev => ({ ...prev, [code]: 'GFA' }));
                              // Fetch GFA data for this airport if not already loaded
                              if (!gfaTypePerAirport[code]) {
                                setGfaTypePerAirport(prev => ({ ...prev, [code]: 'CLDWX' }));
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              fontSize: 12,
                              fontWeight: 600,
                              border: `2px solid ${theme.border}`,
                              borderRadius: 4,
                              cursor: 'pointer',
                              backgroundColor: activeNotamGfaView[code] === 'GFA' ? theme.text : theme.cardBg,
                              color: activeNotamGfaView[code] === 'GFA' ? theme.cardBg : theme.text,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            GFA
                          </button>
                        </div>

                        {/* NOTAM Section */}
                        {activeNotamGfaView[code] === 'NOTAM' && (
                          <div>
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNotam(code);
                          }}
                          style={{ 
                            fontWeight: 600, 
                            fontSize: 12, 
                            marginBottom: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            userSelect: 'none'
                          }}
                        >
                          <span style={{ fontSize: 14 }}>
                            {expandedNotams.has(`${code}:0`) ? '▼' : '▶'}
                          </span>
                          View NOTAMs
                        </div>
                        
                        {expandedNotams.has(`${code}:0`) && notams.length > 0 ? (
                          <>
                            {/* NOTAM Controls Row */}
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                              {/* Type Tabs */}
                              {(() => {
                                const isCraneActive = craneFilterActive[code] !== undefined ? craneFilterActive[code] : true;
                                const counts = getNotamTypeCounts(notams, isCraneActive);
                                const currentType = selectedNotamTypePerAirport[code] || 'ALL';
                                
                                return (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNotamTypePerAirport(prev => ({ ...prev, [code]: 'ALL' }));
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: 10,
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        backgroundColor: currentType === 'ALL' ? theme.text : theme.cardBg,
                                        color: currentType === 'ALL' ? theme.cardBg : theme.text,
                                        fontWeight: currentType === 'ALL' ? 600 : 400,
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      ALL ({counts.all})
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNotamTypePerAirport(prev => ({ ...prev, [code]: 'AERODROME' }));
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: 10,
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        backgroundColor: currentType === 'AERODROME' ? theme.text : theme.cardBg,
                                        color: currentType === 'AERODROME' ? theme.cardBg : theme.text,
                                        fontWeight: currentType === 'AERODROME' ? 600 : 400,
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      AERODROME ({counts.aerodrome})
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNotamTypePerAirport(prev => ({ ...prev, [code]: 'ENROUTE' }));
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: 10,
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        backgroundColor: currentType === 'ENROUTE' ? theme.text : theme.cardBg,
                                        color: currentType === 'ENROUTE' ? theme.cardBg : theme.text,
                                        fontWeight: currentType === 'ENROUTE' ? 600 : 400,
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      ENROUTE ({counts.enroute})
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNotamTypePerAirport(prev => ({ ...prev, [code]: 'WARNING' }));
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: 10,
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        backgroundColor: currentType === 'WARNING' ? theme.text : theme.cardBg,
                                        color: currentType === 'WARNING' ? theme.cardBg : theme.text,
                                        fontWeight: currentType === 'WARNING' ? 600 : 400,
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      WARNING ({counts.warning})
                                    </button>
                                    
                                    {/* Crane/Tower Filter */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCraneFilterActive(prev => ({ ...prev, [code]: !prev[code] }));
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: 10,
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        backgroundColor: (craneFilterActive[code] !== undefined ? craneFilterActive[code] : true) ? theme.text : theme.cardBg,
                                        color: (craneFilterActive[code] !== undefined ? craneFilterActive[code] : true) ? theme.cardBg : theme.text,
                                        textDecoration: (craneFilterActive[code] !== undefined ? craneFilterActive[code] : true) ? 'line-through' : 'none',
                                        fontWeight: 400,
                                        transition: 'all 0.2s ease'
                                      }}
                                      title={(craneFilterActive[code] !== undefined ? craneFilterActive[code] : true) ? 'Show Crane/Tower NOTAMs' : 'Hide Crane/Tower NOTAMs'}
                                    >
                                      CRANE/TOWER
                                    </button>
                                  </>
                                );
                              })()}
                            </div>
                            
                            {/* Search Input */}
                            <input
                              type="text"
                              placeholder="Search NOTAMs..."
                              value={notamSearchTerms[code] || ''}
                              onChange={(e) => {
                                e.stopPropagation();
                                const value = e.target.value.toUpperCase();
                                setNotamSearchTerms(prev => ({ ...prev, [code]: value }));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                fontSize: 10,
                                border: `1px solid ${theme.border}`,
                                borderRadius: 4,
                                background: theme.inputBg || theme.cardBg,
                                color: theme.text,
                                marginBottom: 8
                              }}
                            />
                            
                            {/* NOTAMs filtered by type, search, and crane filter, categorized by time */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {(() => {
                                const currentType = selectedNotamTypePerAirport[code] || 'ALL';
                                const searchTerm = notamSearchTerms[code] || '';
                                const isCraneActive = craneFilterActive[code] !== undefined ? craneFilterActive[code] : true;
                                
                                // First filter by type
                                let filteredByType = currentType === 'ALL' ? notams : filterNotamsByType(notams, currentType);
                                
                                // Then apply search and crane filter
                                const filteredNotams = filterAndHighlightNotams(filteredByType, searchTerm, isCraneActive);
                                
                                // Categorize by time
                                const categorized = categorizeNotams(filteredNotams);
                                
                                // Get current date info for labels
                                const now = new Date();
                                const todayStart = new Date(now);
                                todayStart.setHours(0, 0, 0, 0);
                                const todayEnd = new Date(now);
                                todayEnd.setHours(23, 59, 59, 999);
                                
                                const formatDateLabel = (date) => {
                                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                };
                                
                                const formatTimeLabel = (date) => {
                                  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                                };
                                
                                const timeCategories = [
                                  { 
                                    title: 'FUTURE', 
                                    subtitle: `Starts after now (${formatTimeLabel(now)} local, ${formatDateLabel(now)})`, 
                                    notams: categorized[0] || [], 
                                    color: '#059669' 
                                  },
                                  { 
                                    title: 'TODAY', 
                                    subtitle: `${formatDateLabel(todayStart)} 00:00–${formatTimeLabel(now)} local (already started today)`, 
                                    notams: categorized[1] || [], 
                                    color: '#2563eb' 
                                  },
                                  { 
                                    title: 'LAST 7 DAYS', 
                                    subtitle: 'Started within the previous 7 days (excluding today)', 
                                    notams: categorized[2] || [], 
                                    color: '#7c3aed' 
                                  },
                                  { 
                                    title: 'LAST 30 DAYS', 
                                    subtitle: 'Started 8–30 days ago (not in last 7 days or today)', 
                                    notams: categorized[3] || [], 
                                    color: '#d97706' 
                                  },
                                  { 
                                    title: 'OLDER', 
                                    subtitle: 'Started more than 30 days ago', 
                                    notams: categorized[4] || [], 
                                    color: '#6b7280' 
                                  }
                                ];
                                
                                const hasAnyNotams = timeCategories.some(cat => cat.notams.length > 0);
                                
                                if (!hasAnyNotams) {
                                  return (
                                    <div style={{ fontSize: 11, color: theme.mutedText, textAlign: 'center', padding: '12px 0' }}>
                                      {searchTerm ? 'No NOTAMs match your search' : 'No NOTAMs of this type'}
                                    </div>
                                  );
                                }
                                
                                return timeCategories.map(({ title, subtitle, notams, color }) => {
                                  if (notams.length === 0) return null;
                                  
                                  return (
                                    <div key={title} style={{ marginBottom: 8 }}>
                                      <div style={{ 
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: 6,
                                        marginBottom: 6,
                                        paddingBottom: 4,
                                        borderBottom: `2px solid ${color}`
                                      }}>
                                        <div style={{ 
                                          fontSize: 10, 
                                          fontWeight: 700, 
                                          color: color
                                        }}>
                                          {title} ({notams.length})
                                        </div>
                                        <div style={{
                                          fontSize: 9,
                                          color: theme.mutedText,
                                          fontWeight: 400
                                        }}>
                                          {subtitle}
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {notams.map((notam) => renderNotamItem(notam, searchTerm, theme))}
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </>
                        ) : !expandedNotams.has(`${code}:0`) && notams.length === 0 ? (
                          <div style={{ fontSize: 11, color: theme.mutedText }}>No NOTAM data available</div>
                        ) : null}
                          </div>
                        )}

                        {/* GFA Section */}
                        {activeNotamGfaView[code] === 'GFA' && (
                          <div style={{ marginTop: 12 }}>
                            {/* GFA Type Buttons */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGfaTypePerAirport(prev => ({ ...prev, [code]: 'CLDWX' }));
                                  setSelectedTimestampPerAirport(prev => ({ ...prev, [code]: 0 }));
                                }}
                                style={{
                                  flex: 1,
                                  padding: '6px 10px',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  border: `1px solid ${theme.border}`,
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  backgroundColor: gfaTypePerAirport[code] === 'CLDWX' ? theme.text : theme.cardBg,
                                  color: gfaTypePerAirport[code] === 'CLDWX' ? theme.cardBg : theme.text,
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                Clouds & Weather
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGfaTypePerAirport(prev => ({ ...prev, [code]: 'TURBC' }));
                                  setSelectedTimestampPerAirport(prev => ({ ...prev, [code]: 0 }));
                                }}
                                style={{
                                  flex: 1,
                                  padding: '6px 10px',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  border: `1px solid ${theme.border}`,
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  backgroundColor: gfaTypePerAirport[code] === 'TURBC' ? theme.text : theme.cardBg,
                                  color: gfaTypePerAirport[code] === 'TURBC' ? theme.cardBg : theme.text,
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                Icing, Turbulence & Freezing Level
                              </button>
                            </div>
                            {gfaDataPerAirport[code] ? (
                              <GfaCardDisplay
                                gfaData={gfaDataPerAirport[code]}
                                gfaType={gfaTypePerAirport[code] || 'CLDWX'}
                                selectedTimestamp={selectedTimestampPerAirport[code] || 0}
                                setSelectedTimestamp={(idx) => setSelectedTimestampPerAirport(prev => ({ ...prev, [code]: idx }))}
                                theme={theme}
                                darkMode={darkMode}
                              />
                            ) : (
                              <div style={{
                                fontSize: 11,
                                color: theme.mutedText,
                                padding: '12px',
                                borderRadius: 4,
                                backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
                                textAlign: 'center'
                              }}>
                                {gfaDataLoading ? 'Loading GFA map...' : 'No GFA data available'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
