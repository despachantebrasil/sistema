import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Configuração global do worker para o pdfjs-dist
// Isso garante que o worker seja configurado antes que qualquer componente que use pdfjsLib seja carregado.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Exporta o pdfjsLib para uso, se necessário, ou apenas garante que a configuração seja executada.
export { pdfjsLib };