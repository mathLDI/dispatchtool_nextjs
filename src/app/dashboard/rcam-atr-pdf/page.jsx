'use client';

import { useEffect, useRef } from 'react';
import useAuth from '../../../hooks/useAuth'; // Adjusted path for useAuth

const RcamAtrPage = () => {
  useAuth(); // Ensures only authenticated users can access

  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = '/rcam-atr-pdf.pdf'; // Ensure this points to the correct relative path of your PDF
    }
  }, [iframeRef]);

  return (
    <div className="flex flex-col h-full">
      <iframe
        ref={iframeRef}
        className="flex-grow w-full"
        style={{ height: 'calc(100vh - 4rem)' }}
        title="RCAM ATR PDF"
      />
    </div>
  );
};

export default RcamAtrPage;