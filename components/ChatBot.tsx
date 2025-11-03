
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Button } from './ui/Button';
import { SendIcon } from './icons/Icons';
import { Spinner } from './ui/Spinner';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await getChatResponse([...messages, userMessage], input);
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e: any) {
      setError(e.message);
      // Optional: remove the user message on error, or add an error message to the chat
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [input, messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[60vh] max-h-[700px]">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Chat Bot</h2>
      <div className="flex-1 bg-slate-900/50 rounded-lg p-4 overflow-y-auto mb-4 border border-slate-700">
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'
              }`}>
                <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg bg-slate-700 text-slate-200">
                <Spinner size="sm" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {error && <p className="text-red-400 mb-2">{error}</p>}
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything..."
          className="flex-1 p-3 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()} variant="primary" className="px-4">
          <SendIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatBot;
