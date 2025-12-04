'use client';
import { useState } from 'react';
import AirportInputClient from './AirportInputClient';
import WeatherCardsClient from './WeatherCardsClient';
import TimeDisplay from './TimeDisplay';
import { useRccContext } from '../RccCalculatorContext';

function getThemeColors(darkMode: boolean) {
  return {
    background: darkMode ? 'black' : '#f5f5f5',
    headerBg: darkMode ? 'transparent' : 'white',
    inputBg: darkMode ? '#0b0b0b' : '#ffffff',
    inputText: darkMode ? '#fff' : '#111',
    inputBorder: darkMode ? '#333' : '#ddd',
    containerBg: darkMode ? '#0b0b0b' : '#ffffff',
    containerBorder: darkMode ? '#333' : '#ddd'
  };
}

export default function Page() {
  const { airportValues, confirmedAirportCodes, expandedCards, setExpandedCards, darkMode } = useRccContext();
  const theme = getThemeColors(darkMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpandMode, setIsExpandMode] = useState(false); // Track expand/close mode

  const allCodes = [
    ...(airportValues || []).map(a => a.code),
    ...(confirmedAirportCodes || [])
  ];
  const uniqueCodes = Array.from(new Set(allCodes));
  const allExpanded = uniqueCodes.length > 0 && uniqueCodes.every(code => expandedCards.has(code));

  const toggleAll = () => {
    const newExpandMode = !allExpanded;
    setIsExpandMode(newExpandMode);
    
    if (newExpandMode) {
      setExpandedCards(new Set(uniqueCodes));
    } else {
      setExpandedCards(new Set());
    }
  };

  return (
    <div style={{ background: theme.background, height: '100vh', width: '100%', color: theme.inputText, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'center', padding: '8px', flexDirection: 'column', gap: 8, background: theme.headerBg }}>
        {/* Time display and input wrapper */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
          <div style={{ flex: 1 }}>
            <AirportInputClient />
          </div>
          <div style={{ paddingTop: '8px', whiteSpace: 'nowrap' }}>
            <TimeDisplay />
          </div>
        </div>

        {/* Secondary search box (UI-only for now) */}
        <div style={{ width: '100%', display: 'flex' }}>
          <input
            aria-label="Search airports"
            placeholder="Search airports (one or multiple, e.g. CYUL CYYZ or CY)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: `1px solid ${theme.inputBorder}`,
              background: theme.inputBg,
              color: theme.inputText,
              outline: 'none',
            }}
          />
        </div>

        {/* Expand/Collapse All Button */}
        {uniqueCodes.length > 0 && (
          <button
            onClick={toggleAll}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: `1px solid ${theme.inputBorder}`,
              background: theme.inputBg,
              color: theme.inputText,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#1a1a1a' : '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.background = theme.inputBg}
          >
            {allExpanded ? 'Close All' : 'Expand All'}
          </button>
        )}
      </div>

      {/* Cards container space — fills remaining available space */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '8px', minHeight: 0 }}>
        <div style={{
          width: '100%',
          height: '100%',
          border: `1px solid ${theme.containerBorder}`,
          borderRadius: 8,
          background: theme.containerBg,
          overflowY: 'auto'
        }}>
          <WeatherCardsClient searchQuery={searchQuery} isExpandMode={isExpandMode} />
        </div>
      </div>
    </div>
  );
}
