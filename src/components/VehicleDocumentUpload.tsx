import React, { useState, useRef } from 'react';
import { SparklesIcon, LoaderIcon } from './Icons';
import { extractVehicleDataFromDocument } from '../services/geminiService';
import type { ExtractedVehicleData } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Configuração do worker para o pdfjs-dist
// Usando uma URL absoluta do CDN para garantir que o worker seja carregado corretamente.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface VehicleDocumentUploadProps {
    onDataExtracted: (data: ExtractedVehicleData) => void;
    onError: (message: string) => void;
}

const VehicleDocumentUpload: React.FC<VehicleDocumentUploadProps> = ({ onDataExtracted, onError }) => {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            onError('Por favor, selecione um arquivo PDF.');
            return;
        }

        setIsLoading(true);
        try {
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                if (!arrayBuffer) {
                    onError('Não foi possível ler o arquivo.');
                    setIsLoading(false);
                    return;
                }

                try {
                    const typedarray = new Uint8Array(arrayBuffer);
                    
                    // Usando a função getDocument diretamente do pdfjsLib
                    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                    let textContent = '';

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const text = await page.getTextContent();
                        
                        // Mapear apenas itens que possuem a propriedade 'str' (TextItem)
                        textContent += text.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
                    }
                    
                    if (!textContent.trim()) {
                        onError('O PDF parece estar vazio ou contém apenas imagens. Não foi possível extrair texto.');
                        setIsLoading(false);
                        return;
                    }

                    const extractedData = await extractVehicleDataFromDocument(textContent);
                    onDataExtracted(extractedData);

                } catch (pdfError) {
                    console.error("Erro ao processar PDF:", pdfError);
                    onError('Ocorreu um erro ao processar o arquivo PDF. Verifique se o PDF é legível.');
                } finally {
                    setIsLoading(false);
                }
            };
            fileReader.readAsArrayBuffer(file);

        } catch (error) {
            console.error("Erro ao ler arquivo:", error);
            onError('Ocorreu um erro ao ler o arquivo.');
            setIsLoading(false);
        } finally {
            // Limpa o valor do input para permitir o upload do mesmo arquivo novamente
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="application/pdf"
                disabled={isLoading}
            />
            <button
                onClick={handleClick}
                disabled={isLoading}
                className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <LoaderIcon className="w-5 h-5 mr-2" />
                        Analisando...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Preencher com IA
                    </>
                )}
            </button>
        </>
    );
};

export default VehicleDocumentUpload;