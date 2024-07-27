import React, { useState } from 'react';
import Draggable from 'react-draggable';
import SecondPageCrosswindCalculator from '../../dashboard/x-wind/page';

interface ModalContentProps {
  onClose: () => void;
}

const GlobalModalContent: React.FC<ModalContentProps> = ({ onClose }) => {
  const [disabled, setDisabled] = useState(false);

  const handleFocus = () => {
    setDisabled(true);
  };

  const handleBlur = () => {
    setDisabled(false);
  };

  return (
    <>
      <Draggable disabled={disabled}>
      <div className="flex flex-col fixed z-50 p-6 rounded-lg shadow-lg bg-white bg-opacity-90" style={{ top: '20%', left: '50%', transform: 'translate(-50%, -20%)' }}>
      <div className="cursor-move">
          </div>
          <div>
            <SecondPageCrosswindCalculator onFocus={handleFocus} onBlur={handleBlur} />
          </div>
          <div className="flex justify-center mt-4">
            <button onClick={onClose} className="px-4 py-2   text-black rounded">Close</button>
          </div>        
          </div>
      </Draggable>
    </>
  );
};

export default GlobalModalContent;
