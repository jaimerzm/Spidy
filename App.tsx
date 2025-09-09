
import React, { useState, useEffect, useCallback } from 'react';
import { ChatHistory } from './components/ChatHistory';
import { ChatInput } from './components/ChatInput';
import { MyImages } from './components/ChatHistorySidebar';
import { Profile } from './components/Profile';
import { editImageAPI, generateImageAPI, chatAPI } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { Message, MessagePart, ChatSession } from './types';
import { Part } from '@google/genai';
import { ImageModal } from './components/ImageModal';

const CHAT_HISTORY_STORAGE_KEY = 'chatHistoryStorage';

const initialMessage: Message = {
  id: 'init',
  role: 'model',
  parts: [{ text: "Hello! I'm here to help you edit your images. Please upload an image or describe the changes you'd like to make." }],
};

const createNewChat = (): ChatSession => ({
  id: Date.now().toString(),
  messages: [initialMessage],
});

const loadChatsFromStorage = (): ChatSession[] => {
  try {
    const storedChats = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (storedChats) {
      const parsedChats: ChatSession[] = JSON.parse(storedChats);
      if (Array.isArray(parsedChats) && parsedChats.length > 0) {
        return parsedChats;
      }
    }
  } catch (error) {
    console.error("Error loading history from localStorage:", error);
  }
  return [createNewChat()];
};

const App: React.FC = () => {
  const [allChats, setAllChats] = useState<ChatSession[]>(loadChatsFromStorage);
  const [currentChatId, setCurrentChatId] = useState<string>(allChats[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'my-images' | 'profile'>('chat');

  useEffect(() => {
    try {
      const chatsForStorage = allChats.map(chat => ({
        ...chat,
        messages: chat.messages.map(message => ({
          ...message,
          parts: message.parts
            .map(part => {
              const { imageUrl, ...partWithoutImage } = part;
              return partWithoutImage;
            })
            .filter(part => part.text && part.text.trim() !== ''),
        })),
      }));

      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatsForStorage));
    } catch (error) {
      console.error("Error saving history to localStorage:", error);
    }
  }, [allChats]);

  const handleNewChat = () => {
    const newChat = createNewChat();
    setAllChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setActiveTab('chat');
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    setActiveTab('chat');
  };

  const updateCurrentChat = (updater: (messages: Message[]) => Message[]) => {
    setAllChats(prevChats =>
      prevChats.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: updater(chat.messages) }
          : chat
      )
    );
  };

  const handleSendMessage = useCallback(async (prompt: string, imageFile?: File) => {
    if (!prompt.trim() && !imageFile) {
      setError("Please describe something or upload an image to edit.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const userParts: MessagePart[] = [];
    if (imageFile) {
      const imageUrl = URL.createObjectURL(imageFile);
      userParts.push({ imageUrl });
    }

    if (prompt) {
      userParts.push({ text: prompt });
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: userParts,
    };
    updateCurrentChat(prev => [...prev, userMessage]);

    try {
      let responseParts: Part[] = [];

      const currentChat = allChats.find(chat => chat.id === currentChatId);
      const lastModelMessage = currentChat?.messages.slice().reverse().find(m => m.role === 'model');
      const lastModelImageUrl = lastModelMessage?.parts.find(p => p.imageUrl)?.imageUrl;

      const wasConversationalEditAttempt = !imageFile && !!lastModelImageUrl && prompt.trim();

      if (imageFile) {
        const base64Image = await fileToBase64(imageFile);
        responseParts = await editImageAPI({
          prompt,
          image: base64Image,
          mimeType: imageFile.type,
        });
      } else if (wasConversationalEditAttempt) {
        const [header, base64Data] = lastModelImageUrl!.split(',');
        if (!base64Data) throw new Error("The image URL in history is invalid.");
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';

        responseParts = await editImageAPI({
          prompt,
          image: base64Data,
          mimeType: mimeType,
        });
      } else {
        if (!prompt.trim()) {
          setError("Please describe what you want to create or ask a question.");
          setIsLoading(false);
          return;
        }
        
        const imageKeywords = [
          'create', 'generate', 'draw', 'imagine', 'picture of', 'image of', 'photo of', 'visualize', 'paint', // English
          'crea', 'genera', 'dibuja', 'imagina', 'foto de', 'imagen de', 'visualiza', 'pinta' // Spanish
        ];
        
        const lowerCasePrompt = prompt.toLowerCase();
        const isImageRequest = imageKeywords.some(keyword => lowerCasePrompt.includes(keyword));

        if (isImageRequest) {
          responseParts = await generateImageAPI(prompt);
        } else {
          responseParts = await chatAPI(prompt);
        }
      }

      const modelParts: MessagePart[] = [];
      let imageReturned = false;

      if (responseParts && responseParts.length > 0) {
        for (const part of responseParts) {
          if (part.text) {
            modelParts.push({ text: part.text });
          } else if (part.inlineData) {
            const mimeType = part.inlineData.mimeType || 'image/jpeg';
            const imageUrlResult = `data:${mimeType};base64,${part.inlineData.data}`;
            modelParts.push({ imageUrl: imageUrlResult });
            imageReturned = true;
          }
        }
      }

      if (wasConversationalEditAttempt && !imageReturned) {
        const helpfulMessage = "\n\n(No new image was generated. To create an image from scratch, start a new chat to avoid using the previous image as a reference.)";
        const textPart = modelParts.find(p => p.text);
        if (textPart) {
          textPart.text += helpfulMessage;
        } else {
          modelParts.push({ text: helpfulMessage.trim() });
        }
      }

      if (modelParts.length === 0) {
        modelParts.push({ text: "I couldn't process that request. Could you try again in a different way?" });
      }

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: modelParts,
      };
      updateCurrentChat(prev => [...prev, modelMessage]);

    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message || "An error occurred. Please try again.";
      setError(errorMessage);
      updateCurrentChat(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: `Error: ${errorMessage}` }],
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [allChats, currentChatId]);

  const handleImageClick = useCallback((imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImageUrl(null);
  }, []);

  const currentMessages = allChats.find(chat => chat.id === currentChatId)?.messages || [];

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'chat':
        return (
          <>
            <header className="sticky top-0 z-10 flex items-center justify-between bg-black p-4 pb-3 border-b border-[#1C1C1E]">
              <div className="w-8"></div>
              <h1 className="text-white text-lg font-bold">AI Chat</h1>
              <div className="w-8"></div>
            </header>
            <main className="flex-1 overflow-y-auto">
              {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-center m-4 text-sm">{error}</div>}
              <ChatHistory messages={currentMessages} isLoading={isLoading} onImageClick={handleImageClick} />
            </main>
          </>
        );
      case 'my-images':
        return (
          <MyImages
            chats={allChats}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
          />
        );
      case 'profile':
        return <Profile />;
      default:
        return null;
    }
  };

  const BottomNav = () => (
    <nav className="flex justify-around border-t border-[#1C1C1E] bg-[#111111] py-2">
      <button onClick={() => setActiveTab('my-images')} className={`flex flex-col items-center gap-1 ${activeTab === 'my-images' ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>
        <span className="material-symbols-outlined text-2xl">photo_library</span>
        <p className="text-xs font-medium">My Images</p>
      </button>
      <button onClick={() => setActiveTab('chat')} className="flex flex-col items-center gap-1 text-white">
        <div className={`rounded-full p-2 -mt-6 border-4 border-black ${activeTab === 'chat' ? 'bg-[var(--primary-color)]' : 'bg-gray-600'}`}>
          <span className="material-symbols-outlined text-3xl text-black">chat</span>
        </div>
        <p className={`text-xs font-medium ${activeTab === 'chat' ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>AI Chat</p>
      </button>
      <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>
        <span className="material-symbols-outlined text-2xl">person</span>
        <p className="text-xs font-medium">Profile</p>
      </button>
    </nav>
  );

  return (
    <div className="flex flex-col h-full bg-black">
      {renderActiveTab()}

      <footer className="sticky bottom-0 bg-black">
        {activeTab === 'chat' && <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />}
        <BottomNav />
      </footer>

      {selectedImageUrl && (
        <ImageModal imageUrl={selectedImageUrl} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default App;
