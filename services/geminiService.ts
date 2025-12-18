
import { GoogleGenAI } from "@google/genai";

// Standardizing initialization to use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMedicalAdvice = async (prompt: string): Promise<string> => {
  try {
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
        - Utilize negrito para destacar termos importantes, mas garanta que a renderização seja limpa (sem asteriscos duplos expostos, se possível, embora em Markdown eles sejam padrão).
        - Use listas (bullets) com bom espaçamento.
        - Sempre inclua uma nota de que a decisão final cabe ao médico assistente.`,
        temperature: 0.7,
      }
    });
    // Property access .text used correctly for GenerateContentResponse
    return response.text || "Desculpe, não consegui processar sua solicitação no momento.";
  } catch (error) {
    console.error("Sear AI Error:", error);
    return "Erro ao conectar com a inteligência artificial. Verifique sua conexão ou tente novamente mais tarde.";
  }
};
