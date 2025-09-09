import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { ChatMessage } from './ChatMessage';
import { Spinner } from './Spinner';

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
  onImageClick: (imageUrl: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading, onImageClick }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} onImageClick={onImageClick} />
      ))}
      {isLoading && (
         <div className="flex items-end gap-3">
          <img alt="AI Assistant Avatar" className="size-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU0nqs9c_mPbyHNvyaRr3OMDPTFIlZzTUUj4U99U8NC08rYB5KSSCINJV92EKG1CrwG0EEN-5ce-L8hSPe1WjyCDcFI-ZPC5UY9krV-lagqjv7u_JAYCDDTzOBJ6RWBVqv4IUjaFLpNm3oOCGjT-_-pRdyQ_rs6S5Cs0fYcZeQDloc2uzP2WJAX6nTeST-3T3JjOEOIkRXUKl6GLF3MwiNSlUqmdocQHIYuhuXOBvOfCGUQ0Krc8x6_mR2OqGX2JSh7kgMol_m0By1"/>
          <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">AI Assistant</p>
              <div className="flex items-center gap-2 rounded-xl rounded-bl-none bg-[#1C1C1E] px-4 py-3 text-white max-w-xs">
                  <Spinner />
                  <span className="text-gray-300 text-sm animate-pulse">Thinking...</span>
              </div>
          </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};
