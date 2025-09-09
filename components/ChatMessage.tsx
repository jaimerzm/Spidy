import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onImageClick: (imageUrl: string) => void;
}

const AIAvatar = () => (
  <img alt="AI Assistant Avatar" className="size-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU0nqs9c_mPbyHNvyaRr3OMDPTFIlZzTUUj4U99U8NC08rYB5KSSCINJV92EKG1CrwG0EEN-5ce-L8hSPe1WjyCDcFI-ZPC5UY9krV-lagqjv7u_JAYCDDTzOBJ6RWBVqv4IUjaFLpNm3oOCGjT-_-pRdyQ_rs6S5Cs0fYcZeQDloc2uzP2WJAX6nTeST-3T3JjOEOIkRXUKl6GLF3MwiNSlUqmdocQHIYuhuXOBvOfCGUQ0Krc8x6_mR2OqGX2JSh7kgMol_m0By1"/>
);

const UserAvatar = () => (
    <img alt="User Avatar" className="size-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuICRp4w32J7Vwelo_d3fF6n4IJjblgTmkH7oF2xAfFY_kENv-IJS5GyUg9b5EpMos1vDbxKziI33GTYwpl-LY3p8_FyiQeARRusORh58rvAVzZUtcNgbVESL7DW2FbjkKCscj4ldLaj6ysZOBi_MififN8pOkqI2PUUhXVTZuErGpK51o0H4JbSauiKsVNVW1VK7296hbxRSV42tr8iw8sMOW480D4DuBYWphbZtoL8Vl5RKaEnYxEMbyzSIQsc1SA49IqyfFFUSC"/>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onImageClick }) => {
  const isUser = message.role === 'user';

  return (
    <div className="flex items-end gap-3">
        {!isUser && <AIAvatar />}
        <div className="flex-1">
            <p className={`text-xs text-gray-400 mb-1 ${isUser ? 'text-right' : ''}`}>
                {isUser ? 'You' : 'AI Assistant'}
            </p>
            {message.parts.map((part, index) => (
                <div key={index} className={`rounded-xl px-4 py-3 text-base font-normal ${isUser ? 'rounded-br-none bg-[var(--primary-color)] text-black' : 'rounded-bl-none bg-[#1C1C1E] text-white'}`}>
                    {part.text && <p className="break-words">{part.text}</p>}
                    {part.imageUrl && (
                        <button 
                            onClick={() => onImageClick(part.imageUrl!)} 
                            className="focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 focus:ring-offset-black rounded-lg w-full"
                            aria-label="Enlarge image"
                        >
                            <div 
                                className="w-full aspect-[4/3] rounded-lg bg-cover bg-center transition-opacity duration-500 opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
                                style={{
                                    backgroundImage: `url(${part.imageUrl})`,
                                    animationName: 'fadeIn'
                                }}
                            ></div>
                        </button>
                    )}
                </div>
            ))}
        </div>
        {isUser && <UserAvatar />}
        <style>{`
            @keyframes fadeIn {
              to { opacity: 1; }
            }
        `}</style>
    </div>
  );
};
