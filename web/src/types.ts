export interface Bot {
  id: number;
  name: string;
  emoji: string;
  tagline: string;
  gradient: string;
  logo: string;
  cta: string;
  description: string;
  flair: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  streaming?: boolean;
}

export interface StreamMeta {
  provider: string;
  model: string;
}
