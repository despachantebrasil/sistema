import React, { useState } from 'react';
import type { Document } from '../types';
import { PlusIcon, LoaderIcon, TrashIcon, FileTextIcon } from './Icons';
import { uploadDocument, deleteDocument } from '../services/supabase';
import UppercaseInput from './ui/UppercaseInput';

interface DocumentManagerProps {
    documents: Document[];
    entityId: number;
    entityType: 'client' | 'vehicle';
    onUpdate: () => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ documents, entityId, entityType, onUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [documentType, setDocumentType] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !documentType.trim()) {
            alert('Por favor, selecione um arquivo e digite o tipo de documento.');
            return;
        }
        setIsUploading(true);
        try {
            await uploadDocument(file, documentType, entityId, entityType);
            setFile(null);
            setDocumentType('');
            onUpdate();
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Não foi possível enviar o documento.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (doc: Document) => {
        if (window.confirm(`Tem certeza que deseja excluir o documento "${doc.document_type}"?`)) {
            try {
                await deleteDocument(doc);
                onUpdate();
            } catch (error) {
                console.error('Erro ao excluir:', error);
                alert('Não foi possível excluir o documento.');
            }
        }
    };

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold text-primary border-b pb-2">Documentos Anexados</h2>
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                        <UppercaseInput 
                            type="text" 
                            value={documentType} 
                            onChange={(e) => setDocumentType(e.target.value)} 
                            placeholder="Ex: CNH, CRLV, RG"
                            disabled={isUploading}
                        />
                    </div>
                    <div className="md:col-span-1">
                         <label className="block text-sm font-medium text-gray-700">Arquivo</label>
                         <input 
                            type="file" 
                            onChange={handleFileChange} 
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                            disabled={isUploading}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <button onClick={handleUpload} className="w-full btn-hover flex items-center justify-center" disabled={isUploading || !file || !documentType}>
                            {isUploading ? <LoaderIcon className="w-5 h-5 mr-2" /> : <PlusIcon className="w-5 h-5 mr-2" />}
                            {isUploading ? 'Enviando...' : 'Adicionar'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {documents.length > 0 ? (
                    documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm">
                            <div className="flex items-center">
                                <FileTextIcon className="w-6 h-6 text-primary mr-4" />
                                <div>
                                    <p className="font-semibold text-dark-text">{doc.document_type}</p>
                                    <a href={doc.publicUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{doc.file_name}</a>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(doc)} className="text-red-500 p-1 hover:bg-red-100 rounded-full">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center py-4">Nenhum documento anexado.</p>
                )}
            </div>
        </div>
    );
};

export default DocumentManager;