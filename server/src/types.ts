export interface Persona {
  id: number;
  name: string;
  system_prompt: string;
  style_guidelines?: string[];
  constraints?: string[];
  few_shots?: { user: string; assistant: string }[];
  opener?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  provider: 'groq' | 'together' | 'chutes';
  model: string;
  temperature?: number;
  max_tokens?: number;
}
