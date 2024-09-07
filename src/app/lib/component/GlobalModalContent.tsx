import React, { useState } from 'react';
import Draggable from 'react-draggable';
import SecondPageCrosswindCalculator from '../../dashboard/x-wind/page';
import FirstPageRccNotProvided from '../../dashboard/firstPageRccNotProvided/page';
import FirstPageRccProvided from '../../dashboard/firstPageRccProvided/page';

interface ModalContentProps {
  onClose: () => void;
  contentType: 'x-wind' | 'rcc-not-provided' | 'rcc-provided';
}

const GlobalModalContent: React.FC<ModalContentProps> = ({ onClose, contentType }) => {
  const [disabled, setDisabled] = useState(false);

  const handleFocus = () => setDisabled(true);
  const handleBlur = () => setDisabled(false);

  return (
    <>
      <Draggable disabled={disabled}>
        <div
          className="flex flex-col fixed z-50 rounded-lg shadow-lg bg-white p-4"
          style={{ top: '20%', left: '50%', transform: 'translate(-50%, -20%)' }}
        >
          {/* Header area, can be used for dragging */}
          <div className="cursor-move mb-2">
          </div>

          {/* Content section */}
          <div onFocus={handleFocus} onBlur={handleBlur}>
            {contentType === 'x-wind' && <SecondPageCrosswindCalculator />}
            {contentType === 'rcc-not-provided' && <FirstPageRccNotProvided />}
            {contentType === 'rcc-provided' && <FirstPageRccProvided />}
          </div>

          {/* Footer with the close button */}
          <div className="flex justify-center mt-4">
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
