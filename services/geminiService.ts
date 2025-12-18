
import { GoogleGenAI } from "@google/genai";

/**
 * Generates medical advice using the Sear AI assistant.
 * Follows the @google/genai coding guidelines.
 */
export const getMedicalAdvice = async (prompt: string): Promise<string> => {
  // Always create a new GoogleGenAI instance right before making an API call 
  // to ensure it uses the most up-to-date API key from the execution context.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `Você é a Sear AI, a assistente médica virtual exclusiva do sistema MedSearat.
        Seu objetivo é fornecer suporte à decisão médica, pesquisas clínicas rápidas e orientações profissionais.
        Regras de resposta:
        - Apresente-se no feminino: "Olá, eu sou a Sear AI".
        - Use linguagem médica técnica e profissional.
        - Formate a resposta como um artigo médico curto ou ficha de conduta.
        - Use títulos claros, parágrafos bem definidos.
        - Utilize negrito para destacar termos importantes.
        - Use listas (bullets) com bom espaçamento.
        - Sempre inclua uma nota de que a decisão final cabe ao médico assistente.`,
        temperature: 0.7,
      }
    });
    
    // The GenerateContentResponse object features a text property (not a method) 
    // that directly returns the extracted string output.
    return response.text || "Desculpe, não consegui processar sua solicitação no momento.";
  } catch (error) {
    console.error("Sear AI Error:", error);
    return "Erro ao conectar com a inteligência artificial. Verifique sua conexão ou tente novamente mais tarde.";
  }
};
