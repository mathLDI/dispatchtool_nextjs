import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import RCAMv3pdf from '../assets/RCAMv3.3.pdf';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/outline';


export const PdfViewer = () => {
    const [pageNumber, setPageNumber] = useState(1);
    const [numPages, setNumPages] = useState(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    }

    const nextPage = () => {
        setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));
    };

    const prevPage = () => {
        setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
    };

    return (
        <div className="mt-4">
            <Document file={RCAMv3pdf} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} renderTextLayer={false} />
            </Document>
            <div className='flex justify-center'>
                <button onClick={prevPage}>
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <span className="mx-2">Page {pageNumber} of {numPages}</span>
                <button onClick={nextPage}>
                    <ArrowRightIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};