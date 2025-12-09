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
  const { airportValues, confirmedAirportCodes, expandedCards, setExpandedCards, darkMode, searchAirport, setSearchAirport, cardViewMode, setCardViewMode, expandedNotams, setExpandedNotams } = useRccContext();
  const theme = getThemeColors(darkMode);
  const [isExpandMode, setIsExpandMode] = useState(false); // Track expand/close mode
  const [showInput, setShowInput] = useState(true); // Track input visibility

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
      setExpandedNotams(new Set()); // Also close all NOTAM sections
    }
  };

  return (
    <div style={{ background: theme.background, height: '100vh', width: '100%', color: theme.inputText, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'center', padding: '8px', flexDirection: 'column', gap: 8, background: theme.headerBg }}>
        {/* Time display and collapsible input wrapper */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
            {/* Collapsible header for Add Airports */}
            <div
              onClick={() => setShowInput(!showInput)}
              style={{
                paddingTop: '8px',
                paddingBottom: '8px',
                paddingLeft: '12px',
                paddingRight: '12px',
                borderRadius: 8,
                border: `1px solid ${theme.inputBorder}`,
                background: showInput ? theme.inputBg : 'transparent',
                color: theme.inputText,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                userSelect: 'none',
                minWidth: showInput ? 'auto' : 180,
              }}
              title={showInput ? 'Click to minimize' : 'Click to expand'}
              onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#1a1a1a' : '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = showInput ? theme.inputBg : 'transparent'}
            >
              <span>{showInput ? '▼' : '▶'}</span>
              <span>Add Airports</span>
            </div>

            {/* Input section - collapsible */}
            {showInput && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <AirportInputClient />
              </div>
            )}
          </div>

          {/* Time display - always on the right */}
          <div style={{ paddingTop: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <TimeDisplay />
          </div>
        </div>

        {/* Secondary search box (UI-only for now) */}
        <div style={{ width: '100%', display: 'flex' }}>
          <input
            aria-label="Search airports"
            placeholder="Search airports (one or multiple, e.g. CYUL CYYZ or CY)"
            value={searchAirport}
            onChange={(e) => setSearchAirport(e.target.value.toUpperCase())}
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

        {/* Expand/Collapse All + View Toggle */}
        {uniqueCodes.length > 0 && (
          <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'stretch', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setIsExpandMode(false);
                setExpandedCards(new Set());
                setExpandedNotams(new Set());
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 8,
                border: `1px solid ${theme.inputBorder}`,
                background: theme.inputBg,
                color: theme.inputText,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#1a1a1a' : '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = theme.inputBg}
            >
              Close All
            </button>

            <button
              onClick={() => {
                setIsExpandMode(true);
                setExpandedCards(new Set(uniqueCodes));
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 8,
                border: `1px solid ${theme.inputBorder}`,
                background: theme.inputBg,
                color: theme.inputText,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#1a1a1a' : '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = theme.inputBg}
            >
              Expand All
            </button>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setCardViewMode('flightCategory')}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: `1px solid ${theme.inputBorder}`,
                  background: cardViewMode === 'flightCategory' ? theme.inputText : theme.inputBg,
                  color: cardViewMode === 'flightCategory' ? theme.inputBg : theme.inputText,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: cardViewMode === 'flightCategory' ? 700 : 500,
                  transition: 'background 0.2s ease, color 0.2s ease',
                  minWidth: 140,
                  whiteSpace: 'nowrap'
                }}
              >
                Flight Category View
              </button>

              <button
                onClick={() => setCardViewMode('airportList')}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: `1px solid ${theme.inputBorder}`,
                  background: cardViewMode === 'airportList' ? theme.inputText : theme.inputBg,
                  color: cardViewMode === 'airportList' ? theme.inputBg : theme.inputText,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: cardViewMode === 'airportList' ? 700 : 500,
                  transition: 'background 0.2s ease, color 0.2s ease',
                  minWidth: 140,
                  whiteSpace: 'nowrap'
                }}
              >
                Airport List View
              </button>
            </div>
          </div>
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
          <WeatherCardsClient searchQuery={searchAirport} isExpandMode={isExpandMode} viewMode={cardViewMode} />
        </div>
      </div>
    </div>
  );
}
