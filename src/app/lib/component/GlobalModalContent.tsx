import React, { useState } from 'react';
import Draggable from 'react-draggable';
import SecondPageCrosswindCalculator from '../../dashboard/x-wind/page';
import FirstPageRccNotProvided from '../../dashboard/firstPageRccNotProvided/page';
import FirstPageRccProvided from '../../dashboard/firstPageRccProvided/page';
import QuickSearch from '../../dashboard/quickSearch/page';

// Example fetchWeather and fetchGFA functions
const fetchWeather = async (airportCode: string) => {
  // Your logic to fetch weather data for the given airport code
};

const fetchGFA = async (airportCode: string, gfaType: string) => {
  // Your logic to fetch GFA data for the given airport code and GFA type
};

interface ModalContentProps {
  onClose: () => void;
  contentType: 'x-wind' | 'rcc-not-provided' | 'rcc-provided' | 'Quick Search';
}

const GlobalModalContent: React.FC<ModalContentProps> = ({ onClose, contentType }) => {
  const [dragging, setDragging] = useState(false);

  // Disable drag only for 'Quick Search' in the middle, but enable for the extremity (like the header)
  const isDraggable = contentType !== 'Quick Search';

  return (
    <>
      <Draggable handle=".drag-handle" cancel=".non-draggable">
        <div
          className="flex flex-col fixed z-50 rounded-lg shadow-lg bg-white p-4"
          style={{ top: '20%', left: '30%', transform: 'translate(-50%, -50%)' }}
          >
          {/* Draggable area (extremity, like a header) */}
          <div className="drag-handle cursor-move mb-2 bg-gray-200 p-2 rounded-t-lg">
            {/* Optional header for dragging */}
            <span>Drag Area</span>
          </div>

          {/* Content section, make this non-draggable */}
          <div className="non-draggable">
            {contentType === 'x-wind' && <SecondPageCrosswindCalculator />}
            {contentType === 'rcc-not-provided' && <FirstPageRccNotProvided />}
            {contentType === 'rcc-provided' && <FirstPageRccProvided />}
            {contentType === 'Quick Search' && <QuickSearch />}
          </div>

          {/* Footer with the close button */}
          <div className="flex justify-center mt-4 non-draggable">
            <button onClick={onClose} className="px-4 py-2 text-black rounded bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </Draggable>
    </>
  );
};

export default GlobalModalContent;
