
import { GoogleGenAI } from "@google/genai";

/**
 * Generates medical advice using the Sear AI assistant.
 * Follows the @google/genai coding guidelines.
 */
export const getMedicalAdvice = async (prompt: string): Promise<string> => {
  // Use process.env.API_KEY directly as per requirements
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("MedSearat Error: API_KEY não configurada no ambiente.");
    return "O Sear AI está temporariamente desativado (Chave de API ausente). Por favor, contate o suporte.";
  }

  try {
    // Initializing Gemini API with the required parameter format
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-pro-preview for complex medical reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `Você é o Sear AI, o assistente médico virtual exclusivo do sistema MedSearat.
        Seu objetivo é fornecer suporte à decisão médica, pesquisas clínicas rápidas e orientações profissionais.
        Regras de resposta:
        - Use linguagem médica técnica e profissional.
        - Formate a resposta como um artigo médico curto.
        - Use títulos claros, parágrafos bem definidos.
        - Utilize negrito para destacar termos importantes.
        - Use listas (bullets) com bom espaçamento.
        - Sempre inclua uma nota de que a decisão final cabe ao médico assistente.`,
        temperature: 0.7,
      }
    });
    
    // Extracting text output directly from the .text property of GenerateContentResponse
    return response.text || "Desculpe, não consegui processar sua solicitação no momento.";
  } catch (error) {
    console.error("Sear AI Error:", error);
    return "Erro ao conectar com a inteligência artificial. Verifique sua conexão ou tente novamente mais tarde.";
  }
};
