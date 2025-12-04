"use client";
import React, { useEffect, useRef, useState } from 'react';
import { parseMETAR } from '@/app/lib/component/functions/weatherAndNotam';
import { useRccContext } from '@/app/dashboard/RccCalculatorContext';

const CATEGORY_COLORS = {
  VFR: '#07c502', // matches text-custom-vfr
  MVFR: '#236ed8', // matches text-custom-mvfr
  IFR: '#ff2700', // matches text-custom-ifr
  LIFR: '#ff40ff', // matches text-custom-lifr
  Unknown: '#6B7280', // gray (text-gray-500 equivalent)
};

function getThemeColors(darkMode) {
  return {
    inputBg: darkMode ? '#0b0b0b' : '#ffffff',
    inputText: darkMode ? '#fff' : '#111',
    inputBorder: darkMode ? '#333' : '#ddd',
    chipBg: darkMode ? '#1a1a1a' : '#f0f0f0',
    chipText: darkMode ? '#fff' : '#111',
    warningBorder: '#ff4d4f'
  };
}

export default function AirportInputClient() {
  const { addAirportValue, removeAirportValue, airportValues, allWeatherData, setAllWeatherData, setConfirmedAirportCodes, setLastUpdated, confirmedAirportCodes, darkMode } = useRccContext();
  const theme = getThemeColors(darkMode);
  
  // `value` is now the current typing token (partial). Confirmed completed 4-char tokens
  const [value, setValue] = useState('');
  const [confirmed, setConfirmed] = useState(() => confirmedAirportCodes || []); // Initialize from context
  const [showWarning, setShowWarning] = useState(false);
  const [categories, setCategories] = useState({}); // { CODE: { category, color } }
  const inFlightRef = useRef(new Set());
  const debounceRef = useRef(null);

  // Sync confirmed codes to context whenever they change
  useEffect(() => {
    if (setConfirmedAirportCodes) {
      setConfirmedAirportCodes(confirmed);
    }
  }, [confirmed, setConfirmedAirportCodes]);

  // When typing, enforce uppercase, allowed chars, and max 4 chars per token
  const handleChange = (e) => {
    const raw = e.target.value.toUpperCase();
    // Keep spaces so we can detect intentional separators, but remove other invalid chars
    const cleaned = raw.replace(/[^A-Z0-9\s]/g, '');

    // Split on existing whitespace, then chunk any long parts into 1-4 char tokens
    const parts = cleaned.split(/\s+/).filter(Boolean);
    const tokens = [];

    parts.forEach(part => {
      if (part.length <= 4) {
        tokens.push(part.slice(0, 4));
      } else {
        const chunks = part.match(/.{1,4}/g) || [];
        chunks.forEach(chunk => tokens.push(chunk.slice(0, 4)));
      }
    });

    if (tokens.length === 0) {
      // Only clear the input value, NOT confirmed airports
      setValue('');
      if (showWarning) setShowWarning(false);
      return;
    }

    // If last token is complete (length 4) then move it to confirmed and clear input
    const last = tokens[tokens.length - 1];
    if (last.length === 4) {
      // all tokens are complete; append to confirmed
      const newConfirmed = Array.from(new Set([...(confirmed || []), ...tokens]));
      setConfirmed(newConfirmed);
      setValue('');
    } else {
      // last is partial; confirmed are tokens except last
      const newConfirmed = Array.from(new Set([...(confirmed || []), ...tokens.slice(0, -1)]));
      setConfirmed(newConfirmed);
      setValue(last);
    }
    // Reset warning while editing
    if (showWarning) setShowWarning(false);
  };

  const handleKeyDown = (e) => {
    // Prevent Tab from interfering with the input
    if (e.key === 'Tab') {
      // Let Tab work normally for navigation, but don't trigger any deletion
      return;
    }
    
    // Support backspace to delete last chip when input is empty
    if (e.key === 'Backspace') {
      if (value.trim() === '') {
        e.preventDefault();
        // Prefer removing last confirmed token, otherwise remove last saved airport
        const lastConfirmed = (confirmed && confirmed.length) ? confirmed[confirmed.length - 1] : null;
        const lastSaved = (airportValues && airportValues.length) ? airportValues[airportValues.length - 1].code : null;
        const toRemove = lastConfirmed || lastSaved;
        if (!toRemove) return;

        // Remove from confirmed if present
        setConfirmed(prev => {
          if (!prev || prev.length === 0) return [];
          return prev.slice(0, -1);
        });

        // If airport is persisted in airportValues, remove it
        if (airportValues.some(a => a.code === toRemove) && typeof removeAirportValue === 'function') {
          try {
            removeAirportValue(toRemove);
          } catch (err) {
            console.error('removeAirportValue failed', err);
          }
        }

        // Remove category and weather data for this code
        setCategories(prev => {
          const copy = { ...(prev || {}) };
          delete copy[toRemove];
          return copy;
        });

        setAllWeatherData(prev => {
          if (!prev) return prev;
          const copy = { ...prev };
          delete copy[toRemove];
          return copy;
        });

        return;
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      // Enter key is disabled since airports are automatically added when complete
      return;
    }
  };

  const handleBlur = () => {
    setValue(prev => prev.trim().replace(/\s+/g, ' '));
  };

  // Debounced effect: when tokens change, for any 4-char token, fetch weather and compute category
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // tokens to query are confirmed plus the current value if it's a complete 4-char token
      const current = value.trim();
      const toks = [...confirmed];
      if (current.length === 4 && !toks.includes(current)) toks.push(current);

      toks.forEach(code => {
        if (code.length !== 4) return;
        if (categories[code]) return; // already have category
        if (inFlightRef.current.has(code)) return; // already fetching

        inFlightRef.current.add(code);
        fetch(`/api/weather?code=${encodeURIComponent(code)}`)
          .then(r => r.json())
          .then((data) => {
            // Try to locate METAR/speci text
            let metarText = null;
            if (data && data.data && Array.isArray(data.data)) {
              const latest = data.data.find(item => item.type === 'metar' || item.type === 'speci');
              if (latest && latest.text) metarText = latest.text;
            }
            // Fallback: some responses may include raw string
            if (!metarText && data?.metar) metarText = data.metar;

            let cat = 'Unknown';
            if (metarText) {
              try {
                const parsed = parseMETAR(metarText);
                cat = parsed.category || 'Unknown';
              } catch (err) {
                cat = 'Unknown';
              }
            }

            setCategories(prev => ({ ...prev, [code]: { category: cat, color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Unknown } }));
            setLastUpdated(Date.now());
          })
          .catch(err => {
            console.error('Failed to fetch weather for', code, err);
            setCategories(prev => ({ ...prev, [code]: { category: 'Unknown', color: CATEGORY_COLORS.Unknown } }));
          })
          .finally(() => {
            inFlightRef.current.delete(code);
          });
      });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, confirmed]);

  // Build displayed tokens: confirmed + saved `airportValues` codes + current complete token (if 4 chars)
  const savedCodes = Array.isArray(airportValues) ? airportValues.map(a => a.code) : [];
  const currentPartial = value.trim();
  const currentComplete = currentPartial.length === 4 ? [currentPartial] : [];
  const displayedSet = new Set([...(confirmed || []), ...savedCodes, ...currentComplete]);
  const displayedTokens = Array.from(displayedSet);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          maxWidth: '100%',
          padding: '8px',
          borderRadius: 8,
          border: showWarning ? `1px solid ${theme.warningBorder}` : `1px solid ${theme.inputBorder}`,
          background: theme.inputBg,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center'
        }}>

          {/* Render chips and input inline so each airport shows with its bubble on same row */}
          {displayedTokens.map((t, idx) => {
            const info = categories[t] || { category: 'Unknown', color: CATEGORY_COLORS.Unknown };

            const handleRemove = (e) => {
              e.stopPropagation();
              // Remove from confirmed if present
              setConfirmed(prev => (prev || []).filter(code => code !== t));

              // If airport is persisted in airportValues, remove it
              if (airportValues.some(a => a.code === t) && typeof removeAirportValue === 'function') {
                try {
                  removeAirportValue(t);
                } catch (err) {
                  console.error('removeAirportValue failed', err);
                }
              }

              // Remove category and weather data for this code
              setCategories(prev => {
                const copy = { ...(prev || {}) };
                delete copy[t];
                return copy;
              });

              setAllWeatherData(prev => {
                if (!prev) return prev;
                const copy = { ...prev };
                delete copy[t];
                return copy;
              });
            };

            return (
              <div
                key={`${t}-${idx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: 'transparent',
                  whiteSpace: 'nowrap'
                }}
              >
                <div style={{ color: theme.chipText, fontWeight: 600, fontSize: 14 }}>{t}</div>
                <button onClick={handleRemove} aria-label={`Remove ${t}`} title={`Remove ${t}`} style={{
                  marginLeft: 6,
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: '2px 6px'
                }}>×</button>
              </div>
            );
          })}

          <input
            aria-label="Add airports"
            placeholder="Add airports (e.g. CYUL CYYZ)"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            style={{
              minWidth: 120,
              flex: 1,
              padding: '8px 10px',
              background: 'transparent',
              color: theme.inputText,
              border: 'none',
              outline: 'none',
              fontSize: 14,
            }}
          />

        </div>
      </div>

      {showWarning && (
        <div style={{ color: '#ff4d4f', marginTop: 8, fontSize: 12 }}>
          One or more codes have fewer than 4 characters — please enter 4
        </div>
      )}
    </div>
  );
}
