
import { GoogleGenAI, Type } from "@google/genai";
import { MonthInsight } from "./types";

export const getMonthInsight = async (monthName: string): Promise<MonthInsight> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Hãy gợi ý một thông điệp truyền cảm hứng cho ${monthName} năm 2026 tại Việt Nam. 
      Trả về kết quả dưới định dạng JSON với các trường: 
      - vibe: Một từ hoặc cụm từ ngắn gọn về "khí chất" của tháng này.
      - suggestion: Một hoạt động nên làm trong tháng này.
      - quote: Một câu trích dẫn ý nghĩa.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vibe: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            quote: { type: Type.STRING },
          },
          required: ["vibe", "suggestion", "quote"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as MonthInsight;
  } catch (error) {
    console.error("Gemini insight error:", error);
    return {
      vibe: "Tích cực & Năng lượng",
      suggestion: "Lên kế hoạch cho những mục tiêu mới.",
      quote: "Hành trình vạn dặm bắt đầu từ một bước chân nhỏ bé."
    };
  }
};
