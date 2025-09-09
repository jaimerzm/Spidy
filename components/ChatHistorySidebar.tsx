
import React from 'react';
import { ChatSession } from '../types';

interface MyImagesProps {
  chats: ChatSession[];
  currentChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export const MyImages: React.FC<MyImagesProps> = ({ chats, onSelectChat, onNewChat }) => {
  
  const getChatTitle = (chat: ChatSession) => {
    const userMessage = chat.messages.find(m => m.role === 'user');
    if (userMessage) {
        const textPart = userMessage.parts.find(p => p.text);
        if(textPart?.text) {
          return textPart.text.substring(0, 40) + (textPart.text.length > 40 ? '...' : '');
        }
    }
    const modelMessage = chat.messages.find(m => m.role === 'model' && m.id !== 'init');
     if (modelMessage) {
        const textPart = modelMessage.parts.find(p => p.text);
        if(textPart?.text) {
          return `AI: ${textPart.text.substring(0, 30)}...`;
        }
    }
    return 'New Chat';
  }

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-black p-4 pb-3 border-b border-[#1C1C1E]">
        <div className="w-8"></div>
        <h1 className="text-white text-lg font-bold">My Images</h1>
        <div className="w-8"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 history-scrollbar">
        <button 
          onClick={onNewChat}
          className="w-full bg-[var(--primary-color)] text-black font-bold py-3 px-4 rounded-lg mb-4 hover:opacity-90 transition-opacity"
        >
          + New Chat
        </button>
        <div className="space-y-2">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className="w-full text-left p-3 rounded-lg text-sm transition-colors bg-[#1C1C1E] hover:bg-[#2c2c2e]"
            >
              <p className="text-white truncate">{getChatTitle(chat)}</p>
               <p className="text-xs text-gray-400 mt-1">{new Date(parseInt(chat.id)).toLocaleString()}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};
