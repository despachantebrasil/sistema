import type { ExtractedVehicleData } from '../types';

/**
 * Simula uma chamada à API Gemini para extrair dados estruturados de um documento de veículo.
 * @returns Uma promessa que resolve com os dados do veículo extraídos.
 */
export const extractVehicleDataFromDocument = async (): Promise<ExtractedVehicleData> => {
    console.log("Enviando conteúdo do documento para análise da IA...");
    
    // Simula um atraso de rede para a chamada da API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // --- Resposta Simulada do Gemini ---
    const mockExtractedData: ExtractedVehicleData = {
        plate: 'ABC1D23',
        chassis: '9BWZZZ3F8YT123456',
        renavam: '12345678901',
        brand: 'VOLKSWAGEN',
        model: 'GOL 1.0',
        year_manufacture: 2022,
        year_model: 2023,
        color: 'Branco',
        fuel_type: 'Flex (Álcool/Gasolina)',
        licensing_expiration_date: '2024-10-31',
    };

    console.log("Dados extraídos pela IA:", mockExtractedData);
    
    return mockExtractedData;
};