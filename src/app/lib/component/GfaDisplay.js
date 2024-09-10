import React from 'react';
import Image from 'next/image';

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
      <div className="flex justify-center items-center flex-grow" style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{
          position: 'relative',
          width: '100%',          // The container takes full width of the parent
          height: '100%',         // Ensure the container takes full height of the parent as well
          maxWidth: '100vw',      // The image will take the full available width
          maxHeight: '100vh',     // The image will take the full available height
          aspectRatio: '71 / 57', // Maintain the specific aspect ratio
          margin: '0 auto',       // Center the container
        }}>
          <Image
            src={getImageUrl()}
            alt="GFA Image"
            fill
            sizes="(max-width: 768px) 100vw, (min-width: 769px) and (max-width: 1200px) 50vw, 33vw"  // Adjust sizes for different screen widths
            style={{ objectFit: 'contain' }}  // Contain ensures the image stays within the bounds without distortion
          />
        </div>




      </div>

      <div className="flex justify-center mt-2 space-x-4">
        {getLastFrames(frameLists).map((frame, index) => (
          <button
            key={index}
            onClick={() => setSelectedTimestamp(index)}
            className={`px-4 py-2 rounded ${selectedTimestamp === index
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
