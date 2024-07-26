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
        <div className="flex flex-col fixed z-50 bg-fuchsia-500 p-6 rounded shadow-lg" style={{ top: '20%', left: '50%', transform: 'translate(-50%, -20%)' }}>
          <div className="cursor-move">
            <h2 className="text-lg font-semibold">Global Modal</h2>
          </div>
          <div>
            <SecondPageCrosswindCalculator onFocus={handleFocus} onBlur={handleBlur} />
          </div>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
        </div>
      </Draggable>
    </>
  );
};

export default GlobalModalContent;
