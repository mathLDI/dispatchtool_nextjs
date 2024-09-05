import { useEffect, useRef } from 'react';

const RcamPdfPage = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = '/RCAMv3.3.pdf';
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">RCAM PDF</h1>
      <iframe
        ref={iframeRef}
        className="flex-grow w-full"
        style={{ height: 'calc(100vh - 4rem)' }}
      />
    </div>
  );
};

export default RcamPdfPage;