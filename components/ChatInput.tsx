import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (prompt: string, imageFile?: File) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (imageFile || prompt.trim()) {
        onSendMessage(prompt, imageFile);
        setPrompt('');
        handleRemoveImage();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const isSubmitDisabled = isLoading || (!imageFile && !prompt.trim());

  return (
    <div className="p-4">
        {previewUrl && (
          <div className="relative inline-block mb-3 ml-2">
            <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold"
              aria-label="Remove image"
            >
              &times;
            </button>
          </div>
        )}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 rounded-full bg-[#1C1C1E] px-4 py-2">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter prompt"
          className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none resize-none max-h-32"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-white"
          aria-label="Attach image"
          disabled={isLoading}
        >
          <span className="material-symbols-outlined">add_photo_alternate</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="rounded-full bg-[var(--primary-color)] p-2 text-black disabled:bg-gray-600 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </form>
    </div>
  );
};
