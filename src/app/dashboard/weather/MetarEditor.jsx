'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRccContext } from '../RccCalculatorContext';

const MetarEditor = ({ onClose, onSave, prefillAirport }) => {
  const { airportValues, darkMode } = useRccContext();
  
  // Get current UTC date/time
  const now = new Date();
  const currentDay = String(now.getUTCDate()).padStart(2, '0');
  const currentHour = String(now.getUTCHours()).padStart(2, '0');
  const currentMinute = String(now.getUTCMinutes()).padStart(2, '0');
  
  // METAR components state
  const [selectedAirport, setSelectedAirport] = useState(prefillAirport || '');
  const [day, setDay] = useState(currentDay);
  const [time, setTime] = useState(`${currentHour}:${currentMinute}`);
  const [windDirection, setWindDirection] = useState('000');
  const [windSpeed, setWindSpeed] = useState('00');
  const [windGust, setWindGust] = useState('');
  const [visibility, setVisibility] = useState('6');
  const [weather, setWeather] = useState('');
  const [skyCondition, setSkyCondition] = useState('SKC');
  const [skyHeight, setSkyHeight] = useState('');
  const [skyHeightDigit1, setSkyHeightDigit1] = useState('0'); // 10000s
  const [skyHeightDigit2, setSkyHeightDigit2] = useState('0'); // 1000s
  const [skyHeightDigit3, setSkyHeightDigit3] = useState('0'); // 100s
  const [useManualHeight, setUseManualHeight] = useState(false);
  const [temperature, setTemperature] = useState('15');
  const [dewpoint, setDewpoint] = useState('0');
  const [altimeter, setAltimeter] = useState('29.92');

  const theme = {
    bg: darkMode ? '#1a1a1a' : '#ffffff',
    text: darkMode ? '#fff' : '#000',
    border: darkMode ? '#444' : '#ccc',
    input: darkMode ? '#2d2d2d' : '#f5f5f5'
  };

  // Generate options for dropdowns
  const dayOptions = Array.from({ length: 31 }, (_, i) => 
    String(i + 1).padStart(2, '0')
  );
  
  const windDirectionOptions = Array.from({ length: 36 }, (_, i) => 
    String(i * 10).padStart(3, '0')
  );
  
  const windSpeedOptions = Array.from({ length: 101 }, (_, i) => 
    i < 10 ? String(i) : String(i).padStart(2, '0')
  );
  
  const visibilityOptions = ['1/8', '1/4', '3/8', '1/2', '3/4', '1', '1 1/4', '1 1/2', '1 3/4', '2', '2 1/2', '3', '4', '5', '6', 'P6'];
  
  const weatherOptions = [
    '',
    '+FC',
    'FC',
    'SQ',
    'PO',
    'DS',
    '+DS',
    'SS',
    '+SS',
    'MI',
    'BC',
    'PR',
    'DR',
    'BL',
    'SH',
    'TS',
    'FZ',
    'DZ',
    'RA',
    'SN',
    'SG',
    'IC',
    'PL',
    'GR',
    'GS',
    'UP',
    'BR',
    'FG',
    'FU',
    'DU',
    'SA',
    'HZ',
    'VA',
    '-DZ',
    '+DZ',
    '-RA',
    '+RA',
    '-SN',
    '+SN',
    '-SG',
    '+SG',
    '-IC',
    '+IC',
    '-PL',
    '+PL',
    '-GR',
    '+GR',
    '-GS',
    '+GS',
    '-FZDZ',
    '+FZDZ',
    '-FZRA',
    '+FZRA',
    '-SHRA',
    '+SHRA',
    '-SHSN',
    '+SHSN',
    '-SHPL',
    '+SHPL',
    '-SHGR',
    '+SHGR',
    '-TSRA',
    '+TSRA',
    '-TSGR',
    '+TSGR',
    '-BLSN',
    '+SN BLSN',
    'DRSN',
    'DRSA',
    'DRDU',
    'BLSA',
    'BLDU',
    'VCFG',
    'VCPO',
    'VCDS',
    'VCSS',
    'VCTS',
    'VCSH'
  ];
  
  const skyConditionOptions = [
    'SKC',
    'CLR',
    'FEW',
    'SCT',
    'BKN',
    'OVC',
    'VV',
    'NSC',
    'NCD'
  ];
  
  const skyHeightOptions = Array.from({ length: 50 }, (_, i) => 
    String((i + 1) * 100).padStart(3, '0')
  );
  
  const digitOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  const temperatureOptions = Array.from({ length: 121 }, (_, i) => 
    String(i - 60)
  );

  const altimeterOptions = Array.from({ length: 251 }, (_, i) => 
    ((2900 + i) / 100).toFixed(2)
  );

  // Hours 00-24 and minutes 00-60 as requested
  const hourOptions = Array.from({ length: 25 }, (_, i) => String(i).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 61 }, (_, i) => String(i).padStart(2, '0'));

  // Build METAR string
  const buildMetarString = useCallback(() => {
    const [hour, minute] = time.split(':');
    let metar = selectedAirport;
    metar += ` ${day}${hour}${minute}Z`;
    metar += ` ${windDirection}${windSpeed}${windGust ? 'G' + windGust : ''}KT`;
    metar += ` ${visibility}SM`;
    if (weather) metar += ` ${weather}`;
    
    if (skyCondition === 'SKC' || skyCondition === 'CLR' || skyCondition === 'NSC' || skyCondition === 'NCD') {
      metar += ` ${skyCondition}`;
    } else if (skyCondition === 'VV') {
      metar += ` ${skyCondition}${skyHeight}`;
    } else {
      // For FEW, SCT, BKN, OVC - use digit selectors or manual input
      const height = useManualHeight ? skyHeight : `${skyHeightDigit1}${skyHeightDigit2}${skyHeightDigit3}`;
      metar += ` ${skyCondition}${height}`;
    }
    
    // Format temperature and dewpoint with M prefix for negative values
    const tempFormatted = temperature < 0 ? `M${Math.abs(temperature)}` : String(temperature).padStart(2, '0');
    const dewFormatted = dewpoint < 0 ? `M${Math.abs(dewpoint)}` : String(dewpoint).padStart(2, '0');
    metar += ` ${tempFormatted}/${dewFormatted}`;
    // Altimeter: remove decimal point and prefix with A
    const altimeterFormatted = altimeter.replace('.', '');
    metar += ` A${altimeterFormatted}`;
    
    return metar;
  }, [selectedAirport, day, time, windDirection, windSpeed, windGust, visibility, weather, skyCondition, skyHeight, skyHeightDigit1, skyHeightDigit2, skyHeightDigit3, useManualHeight, temperature, dewpoint, altimeter]);

  const handleSave = () => {
    const metarString = buildMetarString();
    if (onSave) {
      onSave(metarString);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Ensure the editor's timestamp matches current UTC when opened or when prefill changes
  useEffect(() => {
    const nowUtc = new Date();
    const utcDay = String(nowUtc.getUTCDate()).padStart(2, '0');
    const utcHour = String(nowUtc.getUTCHours()).padStart(2, '0');
    const utcMinute = String(nowUtc.getUTCMinutes()).padStart(2, '0');
    setDay(utcDay);
    setTime(`${utcHour}:${utcMinute}`);
    if (prefillAirport) setSelectedAirport(prefillAirport);
  }, [prefillAirport]);

  return (
    <div style={{
      backgroundColor: theme.bg,
      color: theme.text,
      padding: '20px',
      borderRadius: '8px',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>METAR Manual Editor</h2>

      {/* Grid of dropdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Airport */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Airport Code</label>
          <input
            type="text"
            value={selectedAirport}
            onChange={(e) => setSelectedAirport(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="Enter ICAO code"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.input,
              color: theme.text,
              fontSize: '12px',
              boxSizing: 'border-box'
            }}
            maxLength={4}
          />
        </div>

        {/* Day */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Day (01-31)</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.input,
              color: theme.text,
              fontSize: '12px'
            }}
          >
            {dayOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Time (UTC) - separate hour/minute selects, 24h format */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Time (HH:MM UTC)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              aria-label="Hour (UTC)"
              value={time.split(':')[0]}
              onChange={(e) => {
                const newHour = e.target.value.padStart(2, '0');
                const minute = (time.split(':')[1] || '00').padStart(2, '0');
                setTime(`${newHour}:${minute}`);
              }}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.input,
                color: theme.text,
                fontSize: '12px',
                boxSizing: 'border-box',
                width: 100
              }}
            >
              {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
            </select>

            <select
              aria-label="Minute (UTC)"
              value={time.split(':')[1]}
              onChange={(e) => {
                const hour = (time.split(':')[0] || '00').padStart(2, '0');
                const newMin = e.target.value.padStart(2, '0');
                setTime(`${hour}:${newMin}`);
              }}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.input,
                color: theme.text,
                fontSize: '12px',
                boxSizing: 'border-box',
                width: 100
              }}
            >
              {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Wind Direction */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Wind Direction (degrees)</label>
          <select
            value={windDirection}
            onChange={(e) => setWindDirection(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.input,
              color: theme.text,
              fontSize: '12px'
            }}
          >
            {windDirectionOptions.map(wd => (
              <option key={wd} value={wd}>{wd}°</option>
            ))}
          </select>
        </div>

        {/* Wind Speed */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Wind Speed (knots)</label>
          <select
            value={windSpeed}
            onChange={(e) => setWindSpeed(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.input,
              color: theme.text,
              fontSize: '12px'
            }}
          >
            {windSpeedOptions.map(ws => (
              <option key={ws} value={ws}>{ws} kt</option>
            ))}
          </select>
        </div>

        {/* Wind Gust */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Wind Gust (optional, knots)</label>
          <input
            type="number"
            value={windGust}
            onChange={(e) => setWindGust(e.target.value)}
            placeholder="Leave empty for no gust"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.input,
              color: theme.text,
              fontSize: '12px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Visibility */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.input,
              color: theme.text,
              fontSize: '12px'
            }}
          >
            {visibilityOptions.map(v => (
              <option key={v} value={v}>{v}SM</option>
            ))}
          </select>
        </div>

        {/* Present Weather */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Present Weather (optional)</label>
          <select
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.input,
              color: theme.text,
              fontSize: '12px'
            }}
          >
            {weatherOptions.map(w => (
              <option key={w} value={w}>{w || 'No Weather'}</option>
            ))}
          </select>
        </div>

        {/* Sky Condition */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Sky Condition</label>
          <select
            value={skyCondition}
            onChange={(e) => setSkyCondition(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.input,
              color: theme.text,
              fontSize: '12px'
            }}
          >
            {skyConditionOptions.map(sc => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>
        </div>

        {/* Sky Height */}
        {skyCondition !== 'SKC' && skyCondition !== 'CLR' && skyCondition !== 'NSC' && skyCondition !== 'NCD' && (
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>
              Cloud Height (in hundreds of feet)
            </label>
            
            {skyCondition === 'VV' ? (
              // VV uses the original dropdown
              <select
                value={skyHeight}
                onChange={(e) => setSkyHeight(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.input,
                  color: theme.text,
                  fontSize: '12px'
                }}
              >
                <option value="">Select Height</option>
                {skyHeightOptions.map(sh => (
                  <option key={sh} value={sh}>{sh}</option>
                ))}
              </select>
            ) : (
              // FEW, SCT, BKN, OVC use digit selectors or manual input
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={useManualHeight}
                      onChange={(e) => setUseManualHeight(e.target.checked)}
                      style={{ marginRight: '6px' }}
                    />
                    Enter height manually
                  </label>
                </div>
                
                {useManualHeight ? (
                  <input
                    type="text"
                    value={skyHeight}
                    onChange={(e) => setSkyHeight(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="e.g., 120 for 12,000 ft"
                    maxLength={3}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.input,
                      color: theme.text,
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '10px', marginBottom: '2px', textAlign: 'center' }}>10,000s</label>
                      <select
                        value={skyHeightDigit1}
                        onChange={(e) => setSkyHeightDigit1(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.input,
                          color: theme.text,
                          fontSize: '12px'
                        }}
                      >
                        {digitOptions.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '10px', marginBottom: '2px', textAlign: 'center' }}>1,000s</label>
                      <select
                        value={skyHeightDigit2}
                        onChange={(e) => setSkyHeightDigit2(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.input,
                          color: theme.text,
                          fontSize: '12px'
                        }}
                      >
                        {digitOptions.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '10px', marginBottom: '2px', textAlign: 'center' }}>100s</label>
                      <select
                        value={skyHeightDigit3}
                        onChange={(e) => setSkyHeightDigit3(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.input,
                          color: theme.text,
                          fontSize: '12px'
                        }}
                      >
                        {digitOptions.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '4px', fontSize: '10px', color: theme.text, opacity: 0.7 }}>
                  {useManualHeight 
                    ? `Height: ${skyHeight ? parseInt(skyHeight) * 100 : 0} ft`
                    : `Height: ${parseInt(skyHeightDigit1) * 10000 + parseInt(skyHeightDigit2) * 1000 + parseInt(skyHeightDigit3) * 100} ft`
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {/* Temperature */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Temperature (°C)</label>
          <select
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.input,
              color: theme.text,
              fontSize: '12px'
            }}
          >
            {temperatureOptions.map(t => (
              <option key={t} value={t}>{t}°</option>
            ))}
          </select>
        </div>

        {/* Dewpoint */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Dewpoint (°C)</label>
          <select
            value={dewpoint}
            onChange={(e) => setDewpoint(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.input,
              color: theme.text,
              fontSize: '12px'
            }}
          >
            {temperatureOptions.map(t => (
              <option key={t} value={t}>{t}°</option>
            ))}
          </select>
        </div>

        {/* Altimeter */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>Altimeter (inHg)</label>
          <select
            value={altimeter}
            onChange={(e) => setAltimeter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.input,
              color: theme.text,
              fontSize: '12px'
            }}
          >
            {altimeterOptions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview METAR */}
      <div style={{
        backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '20px',
        fontFamily: 'monospace',
        fontSize: '12px',
        wordBreak: 'break-all'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>METAR Preview:</div>
        <div>{buildMetarString()}</div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleClose}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.input,
            color: theme.text,
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#0066cc',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          Create METAR
        </button>
      </div>
    </div>
  );
};

export default MetarEditor;
