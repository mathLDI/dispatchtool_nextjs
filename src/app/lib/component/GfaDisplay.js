'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/legacy/image";

const GfaDisplay = ({ gfaData, selectedTimestamp, setSelectedTimestamp }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [frameLists, setFrameLists] = useState(null);
  const [lastFrames, setLastFrames] = useState(null);

  // Parse frameLists when gfaData changes
  useEffect(() => {
    try {
      if (gfaData?.data?.[0]?.text) {
        const parsed = JSON.parse(gfaData.data[0].text).frame_lists;
        setFrameLists(parsed);
        const lastFrameList = parsed[parsed.length - 1];
        setLastFrames(lastFrameList.frames);
        setError(null);
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
    return <div className="text-center p-4">Loading GFA data...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-center mb-1 space-x-2">
        {lastFrames.map((frame, index) => (
          <button
            key={index}
            onClick={() => setSelectedTimestamp(index)}
            className={`px-4 py-2 rounded transition-colors ${
              selectedTimestamp === index
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            {formatValidityTime(frame)}
          </button>
        ))}
      </div>
      <div className="relative flex justify-center items-center flex-grow w-full h-full">
        <div className="relative w-full max-w-[1200px] h-auto aspect-[379/304] mx-auto">
          <Image
            src={currentImageUrl}
            alt="GFA Image"
            width={758}
            height={608}
            layout="responsive"
            priority
            onLoadingComplete={handleImageLoad}
            onError={handleImageError}
            style={{ objectFit: 'contain' }}
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          )}
          
          {error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-100/50">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GfaDisplay;