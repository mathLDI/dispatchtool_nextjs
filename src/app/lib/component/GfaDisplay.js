// src/app/lib/component/GfaDisplay.js

import React from 'react';

const GfaDisplay = ({ gfaData, selectedTimestamp, setSelectedTimestamp }) => {
  if (!gfaData || gfaData.data.length === 0) {
    return <p>No GFA data available</p>;
  }

  const frameLists = JSON.parse(gfaData.data[0].text).frame_lists;

  const getLastFrames = (frameLists) => {
    const lastFrameList = frameLists[frameLists.length - 1];
    return lastFrameList.frames;
  };

  const getImageUrl = () => {
    if (!gfaData || !gfaData.data || gfaData.data.length === 0) return '';

    const lastFrames = getLastFrames(frameLists);
    const selectedFrame = lastFrames[selectedTimestamp];
    const imageId = selectedFrame?.images[0]?.id;

    return imageId ? `https://plan.navcanada.ca/weather/images/${imageId}.image` : '';
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-center items-center flex-grow">
        <img
          src={getImageUrl()}
          alt="GFA Image"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex justify-center mt-2 space-x-4">
        {getLastFrames(frameLists).map((frame, index) => (
          <button
            key={index}
            onClick={() => setSelectedTimestamp(index)}
            className={`px-4 py-2 rounded ${
              selectedTimestamp === index
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            {formatValidityTime(frame)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GfaDisplay;
