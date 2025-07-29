import { pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
