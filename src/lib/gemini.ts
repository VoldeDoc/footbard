import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

interface MatchData {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  events: {
    type: string;
    minute: number;
    playerName: string;
    relatedPlayerName?: string;
  }[];
}

export async function generateMatchRecap(match: MatchData): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const eventsText = match.events
    .map((e) => {
      switch (e.type) {
        case "GOAL":
          return `${e.minute}' - GOAL by ${e.playerName}${e.relatedPlayerName ? ` (assist: ${e.relatedPlayerName})` : ""}`;
        case "SUBSTITUTION":
          return `${e.minute}' - SUB: ${e.playerName} on for ${e.relatedPlayerName}`;
        case "YELLOW_CARD":
          return `${e.minute}' - YELLOW CARD: ${e.playerName}`;
        case "RED_CARD":
          return `${e.minute}' - RED CARD: ${e.playerName}`;
        default:
          return `${e.minute}' - ${e.type}: ${e.playerName}`;
      }
    })
    .join("\n");

  const prompt = `You are a professional football match commentator. Write a concise, engaging match recap (150-200 words) for the following community league match. Use an energetic but professional tone similar to BBC Sport or Sky Sports match reports.

Match: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}

Key Events:
${eventsText || "No notable events recorded."}

Write the recap as a flowing paragraph. Focus on the narrative and key moments. Do not use bullet points or headers.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
