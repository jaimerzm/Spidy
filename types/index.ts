export interface MessagePart {
  text?: string;
  imageUrl?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: MessagePart[];
}

export interface ChatSession {
  id: string;
  messages: Message[];
}
