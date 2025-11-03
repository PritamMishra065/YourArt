// This file can be used for shared TypeScript types.
// Fix: Define and export ChatMessage to make this file a module and provide a type for the chatbot.
export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}
