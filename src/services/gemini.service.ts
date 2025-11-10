import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, Chat } from '@google/genai';

export interface DebateTurn {
  speaker: string; // e.g., 'Proponent' or 'Opponent'
  argument: string;
}

export interface DebateAnalysis {
  topicAnalysis: string;
  engagementScore: number;
  arguments: {
    for: string[];
    against: string[];
  };
  personas: {
    for: Persona[];
    against: Persona[];
  };
  simulatedDebate: DebateTurn[];
}

export interface Persona {
  name: string;
  description: string;
  imageUrl: string;
}

export interface DebateScore {
  userScore: number;
  aiScore: number;
  justification: string;
  winner: 'user' | 'ai' | 'draw';
}

export interface TrendingTopicsResult {
  topics: string[];
  sources: { uri: string; title: string; }[];
}


@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // It's critical that process.env.API_KEY is available in the execution environment.
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getTrendingDebateTopics(): Promise<TrendingTopicsResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Using Google Search, identify 3-5 current and controversial debate topics that are trending. Format the response as a numbered list. Each item should be a single, debatable statement. Do not add any other text before or after the list.`,
        config: {
          tools: [{googleSearch: {}}],
        },
      });

      const text = response.text;
      const topics = text.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources = groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter((c: any) => c?.uri) || [];

      return { topics, sources };

    } catch (error) {
      console.error('Error fetching trending topics:', error);
      throw new Error('Failed to get trending topics from AI. Please try again.');
    }
  }

  async analyzeDebateTopic(topic: string): Promise<DebateAnalysis> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following debate topic: "${topic}". Provide a comprehensive analysis including:
        1. A brief analysis of the topic's context and public relevance.
        2. An estimated engagement score from 1 to 100 based on its potential to spark discussion.
        3. At least 3 balanced arguments for the topic.
        4. At least 3 balanced arguments against the topic.
        5. Three recommended guest personas or archetypes for each side (for and against) to ensure a balanced discussion. For each persona, provide a name/title, a brief description, and a representative image URL using 'https://picsum.photos/seed/KEYWORD/400' where KEYWORD is a relevant, single-word, lowercase descriptor (e.g., 'scientist', 'activist').
        6. A short, 4-turn simulated verbal debate on the topic between a "Proponent" and an "Opponent". Each turn should be a single, concise paragraph. The Proponent should speak first.
        `,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topicAnalysis: { type: Type.STRING, description: 'Context and public relevance of the topic.' },
              engagementScore: { type: Type.NUMBER, description: 'A score from 1-100 for engagement potential.' },
              arguments: {
                type: Type.OBJECT,
                properties: {
                  for: { type: Type.ARRAY, items: { type: Type.STRING } },
                  against: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
              personas: {
                type: Type.OBJECT,
                properties: {
                  for: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        imageUrl: { type: Type.STRING }
                      }
                    }
                  },
                  against: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        imageUrl: { type: Type.STRING }
                      }
                    }
                  },
                },
              },
              simulatedDebate: {
                type: Type.ARRAY,
                description: 'A 4-turn verbal debate between a Proponent and an Opponent.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    speaker: { type: Type.STRING, description: 'Either "Proponent" or "Opponent".' },
                    argument: { type: Type.STRING, description: 'The spoken argument for this turn.' },
                  }
                }
              },
            },
          },
        },
      });

      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as DebateAnalysis;

    } catch (error) {
      console.error('Error analyzing debate topic:', error);
      throw new Error('Failed to get analysis from AI. Please check the topic or your API key.');
    }
  }

  startChat(persona: Persona, topic: string): Chat {
    return this.ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are an AI debater impersonating a ${persona.name}. 
            Your personality is: "${persona.description}".
            You are debating the topic: "${topic}".
            Your stance is AGAINST what the user is arguing for.
            Your responses must be concise, intelligent, and stay in character. 
            Directly challenge the user's points. Do not agree with the user.
            Keep responses to a maximum of 3 sentences.`,
        },
    });
  }

  async scoreDebate(chatHistory: { sender: string, text: string }[], topic: string, persona: Persona): Promise<DebateScore> {
    try {
      const historyString = chatHistory.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an impartial debate judge. Analyze the following debate transcript on the topic "${topic}".
        The user is arguing FOR the topic.
        The AI is arguing AGAINST the topic, roleplaying as "${persona.name}: ${persona.description}".

        Transcript:
        ${historyString}

        Based on the transcript, please provide a score for the user and the AI (from 0 to 100), a brief justification for the scores (assessing argument quality, consistency, and persuasiveness), and declare a winner. The user wins if their score is higher, the AI wins if its score is higher. If scores are equal, it's a draw.
        `,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              userScore: { type: Type.NUMBER, description: "User's score from 0 to 100." },
              aiScore: { type: Type.NUMBER, description: "AI's score from 0 to 100." },
              justification: { type: Type.STRING, description: "Brief justification for the scores." },
              winner: { type: Type.STRING, description: "Declare 'user', 'ai', or 'draw' as the winner." },
            }
          }
        }
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as DebateScore;
    } catch (error) {
      console.error('Error scoring debate:', error);
      throw new Error('Failed to get score from AI judge.');
    }
  }
}