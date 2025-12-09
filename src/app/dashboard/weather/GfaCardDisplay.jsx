'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/legacy/image";

const GfaCardDisplay = ({ gfaData, gfaType, selectedTimestamp, setSelectedTimestamp, theme, darkMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [frameLists, setFrameLists] = useState(null);
  const [lastFrames, setLastFrames] = useState(null);

  // Parse frameLists when gfaData changes
  useEffect(() => {
    try {
      console.log('[GfaCardDisplay] gfaData received:', gfaData);
      if (gfaData?.data?.[0]?.text) {
        console.log('[GfaCardDisplay] Parsing GFA text data');
        const parsed = JSON.parse(gfaData.data[0].text);
        console.log('[GfaCardDisplay] Parsed data:', parsed);
        const frameLists = parsed.frame_lists;
        console.log('[GfaCardDisplay] Frame lists:', frameLists);
        setFrameLists(frameLists);
        const lastFrameList = frameLists[frameLists.length - 1];
        console.log('[GfaCardDisplay] Using last frame list:', lastFrameList);
        setLastFrames(lastFrameList.frames);
        setError(null);
      } else {
        console.warn('[GfaCardDisplay] Invalid gfaData structure:', gfaData);
      }
    } catch (err) {
      setError('Failed to parse GFA data');
      console.error('GFA parse error:', err);
    }
  }, [gfaData]);

  // Reset states when image URL changes or gfaData changes
  useEffect(() => {
    if (!lastFrames) return;
    
    const selectedFrame = lastFrames[selectedTimestamp];
    const imageId = selectedFrame?.images[0]?.id;
    const newUrl = imageId ? `https://plan.navcanada.ca/weather/images/${imageId}.image` : '';

    if (newUrl !== currentImageUrl) {
      setIsLoading(true);
      setError(null);
      setCurrentImageUrl(newUrl);
    }
  }, [selectedTimestamp, lastFrames, currentImageUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load GFA image');
  };

  const formatValidityTime = (frame) => {
    const [datePart, timePart] = frame.sv.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.replace('Z', '').split(':').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    const utcHours = utcDate.getUTCHours().toString().padStart(2, '0');
    const dayStr = utcDate.getUTCDate().toString().padStart(2, '0');
    const monthStr = utcDate.toLocaleString('en-US', { month: 'short' });

    return `${dayStr} ${monthStr} @ ${utcHours}00Z`;
  };

  if (!lastFrames) {
    return (
      <div style={{
        fontSize: 11,
        color: theme.mutedText,
        textAlign: 'center',
        padding: '12px',
        borderRadius: 4,
        backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5'
      }}>
        Loading GFA data ({gfaType})...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Timestamp buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 4,
        marginBottom: 8
      }}>
        {lastFrames.map((frame, index) => (
          <button
            key={index}
            onClick={() => setSelectedTimestamp(index)}
            style={{
              padding: '4px 8px',
              fontSize: 9,
              fontWeight: 600,
              border: `1px solid ${theme.border}`,
              borderRadius: 4,
              backgroundColor: selectedTimestamp === index ? theme.text : theme.cardBg,
              color: selectedTimestamp === index ? theme.cardBg : theme.text,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {formatValidityTime(frame)}
          </button>
        ))}
      </div>

      {/* GFA Image Display */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '379 / 304',
        backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        {currentImageUrl && (
          <Image
            src={currentImageUrl}
            alt={`GFA ${gfaType}`}
            layout="fill"
            objectFit="contain"
            priority
            onLoadingComplete={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {isLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: 24,
              height: 24,
              border: '3px solid rgba(0, 0, 0, 0.2)',
              borderTopColor: theme.text,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {error && !isLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            color: '#ff2700'
          }}>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GfaCardDisplay;
