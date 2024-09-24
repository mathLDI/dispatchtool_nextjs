import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, onModify }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md z-60 relative">
        <p className="mb-4">A routing with the same flight number, departure, and destination already exists. What would you like to do?</p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add New Routing
          </button>
          <button 
            onClick={onModify} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Modify Current Routing
          </button>
        </div>
      </div>
    </div>
  );
}
