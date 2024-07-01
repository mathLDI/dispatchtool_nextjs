// src/app/lib/component/GlobalModalContent.tsx
import React from 'react';
import Draggable from 'react-draggable';
import SecondPageCrosswindCalculator from '../../dashboard/x-wind/page';

interface ModalContentProps {
  onClose: () => void;
}

const GlobalModalContent: React.FC<ModalContentProps> = ({ onClose }) => {
  return (
    <>
      <Draggable>
        <div className="fixed z-50 bg-white p-6 rounded shadow-lg" style={{ top: '20%', left: '50%', transform: 'translate(-50%, -20%)' }}>
          <div className="cursor-move">
            <h2 className="text-lg font-semibold">Global Modal</h2>
          </div>
          <SecondPageCrosswindCalculator />
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
        </div>
      </Draggable>
    </>
  );
};

export default GlobalModalContent;
