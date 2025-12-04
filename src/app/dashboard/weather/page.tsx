'use client';
import { useState } from 'react';
import AirportInputClient from './AirportInputClient';
import WeatherCardsClient from './WeatherCardsClient';
import TimeDisplay from './TimeDisplay';
import { useRccContext } from '../RccCalculatorContext';

export default function Page() {
  const { airportValues, confirmedAirportCodes, expandedCards, setExpandedCards } = useRccContext();
  const [searchQuery, setSearchQuery] = useState('');

  const allCodes = [
    ...(airportValues || []).map(a => a.code),
    ...(confirmedAirportCodes || [])
  ];
  const uniqueCodes = Array.from(new Set(allCodes));
  const allExpanded = uniqueCodes.length > 0 && uniqueCodes.every(code => expandedCards.has(code));

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedCards(new Set());
    } else {
      setExpandedCards(new Set(uniqueCodes));
    }
  };

  return (
    <div style={{ background: 'black', height: '100vh', width: '100%', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'center', padding: '8px', flexDirection: 'column', gap: 8 }}>
        {/* Time display in top right */}
        <div style={{ position: 'absolute', top: 8, right: 12 }}>
          <TimeDisplay />
        </div>
        
        <AirportInputClient />

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
              border: '1px solid #333',
              background: '#0b0b0b',
              color: '#fff',
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
              border: '1px solid #333',
              background: '#0b0b0b',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#0b0b0b'}
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
          border: '1px solid #ccc',
          borderRadius: 8,
          background: '#ffffff',
          overflowY: 'auto'
        }}>
          <WeatherCardsClient searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
}
