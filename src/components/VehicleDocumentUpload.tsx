import React, { useState, useRef } from 'react';
import { SparklesIcon, LoaderIcon } from './Icons';
import { extractVehicleDataFromDocument } from '../services/geminiService';
import type { ExtractedVehicleData } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
// Importa o caminho do worker diretamente do pacote instalado
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Configuração do worker para o pdfjs-dist
// Usando o caminho importado para garantir que o Vite resolva corretamente
// Esta linha deve ser executada antes de qualquer chamada a getDocument
if (!(pdfjsLib as any).GlobalWorkerOptions.workerSrc) {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

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
                if (!e.target?.result) {
                    onError('Não foi possível ler o arquivo.');
                    setIsLoading(false);
                    return;
                }

                try {
                    const typedarray = new Uint8Array(e.target.result as ArrayBuffer);
                    // Usando (pdfjsLib as any) para evitar problemas de tipagem com getDocument
                    const pdf = await (pdfjsLib as any).getDocument(typedarray).promise;
                    let textContent = '';

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const text = await page.getTextContent();
                        // Mapeia os itens de texto para strings e junta-os
                        textContent += text.items.map((item: { str: string }) => ('str' in item ? item.str : '')).join(' ');
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
                    onError('Ocorreu um erro ao processar o arquivo PDF.');
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