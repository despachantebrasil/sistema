import type { ExtractedVehicleData } from '../types';

/**
 * Simula uma chamada à API Gemini para extrair dados estruturados de um documento de veículo.
 * @param documentContent O conteúdo de texto do documento (por exemplo, um PDF lido).
 * @returns Uma promessa que resolve com os dados do veículo extraídos.
 */
export const extractVehicleDataFromDocument = async (_documentContent: string): Promise<ExtractedVehicleData> => {
    console.log("Enviando conteúdo do documento para análise da IA...");
    
    // Simula um atraso de rede para a chamada da API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // --- Simulação do Prompt para o Gemini ---
    // O prompt real seria algo como:
    // "Extraia as seguintes informações do documento do veículo e retorne em formato JSON:
    // plate, chassis, renavam, brand, model, year_manufacture, year_model, color, fuel_type.
    // O documento contém o seguinte texto: [_documentContent]"

    // --- Resposta Simulada do Gemini ---
    // Em um cenário real, o Gemini analisaria o `_documentContent` e retornaria um JSON.
    // Aqui, estamos retornando um objeto mockado para fins de demonstração.
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