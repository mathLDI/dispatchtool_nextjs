import React, { useState, useRef } from 'react';
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
  const nodeRef = useRef(null);

  // Disable drag only for 'Quick Search' in the middle, but enable for the extremity (like the header)
  const isDraggable = contentType !== 'Quick Search';

  return (
    <>
      <Draggable 
        handle=".drag-handle" 
        cancel=".non-draggable"
        nodeRef={nodeRef}
      >
        <div
          ref={nodeRef}
          className="flex flex-col fixed z-50 rounded-lg shadow-lg bg-white dark:bg-gray-800 dark:text-white p-4"
          style={{ top: '20%', left: '30%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="drag-handle cursor-move mb-2 bg-gray-200 dark:bg-gray-700 p-2 rounded-t-lg">
            <span>Drag Area</span>
          </div>

          <div className="non-draggable">
            {contentType === 'x-wind' && <SecondPageCrosswindCalculator />}
            {contentType === 'rcc-not-provided' && <FirstPageRccNotProvided />}
            {contentType === 'rcc-provided' && <FirstPageRccProvided />}
            {contentType === 'Quick Search' && <QuickSearch />}
          </div>

          <div className="flex justify-center mt-4 non-draggable">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-black dark:text-white rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </Draggable>
    </>
  );
};

export default GlobalModalContent;