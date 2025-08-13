import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmButtonText?: string;
    cancelButtonText?: string;
    isConfirming?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmButtonText = 'Hapus',
    cancelButtonText = 'Batal',
    isConfirming = false,
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/20 ring-1 ring-white/10 w-full max-w-md m-4 p-6 text-center animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                    {title}
                </h3>
                <div className="text-gray-300 my-4">
                    {message}
                </div>
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-semibold transition-all"
                    >
                        {cancelButtonText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isConfirming}
                        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-red-600/30 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {isConfirming ? 'Menghapus...' : confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
