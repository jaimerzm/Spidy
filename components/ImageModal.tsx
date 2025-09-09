import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `imagen-generada-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div 
        className="relative bg-gray-900/50 p-4 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] flex flex-col gap-4"
        onClick={stopPropagation}
      >
        <h2 id="image-modal-title" className="sr-only">Imagen Ampliada</h2>
        <div className="flex-grow flex items-center justify-center overflow-hidden">
          <img src={imageUrl} alt="Imagen ampliada" className="object-contain w-auto h-auto max-w-full max-h-[calc(90vh-120px)]" />
        </div>
        <div className="flex justify-center items-center gap-4 pt-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <DownloadIcon />
            <span>Descargar</span>
          </button>
        </div>
         <button
            onClick={onClose}
            className="absolute -top-3 -right-3 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Cerrar modal"
          >
            <CloseIcon />
          </button>
      </div>
       <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
        `}</style>
    </div>
  );
};
