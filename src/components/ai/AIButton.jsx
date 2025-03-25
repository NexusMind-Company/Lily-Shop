import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 5000);
        
        return () => clearTimeout(timer);
    }, []);

    const handleNavigate = () => {
        setIsOpen(false); 
        navigate('/lilyChat'); 
    };

    return (
        <div className="fixed bottom-5 right-5 flex flex-col items-end">
            {isOpen ? (
                <div className="flex items-center gap-2">
                    <div className="relative bg-white shadow-lg rounded-lg p-3 w-56 flex items-center gap-2 border border-gray-300 h-[70px]">
                        <span className="text-gray-800 text-md pt-3">Hello, how may I help you?</span>
                        <button 
                            className="absolute top-1 left-1 text-white" 
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={20} className='bg-black rounded-full'/>
                        </button>
                    </div>
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className="bg-white text-black p-3 rounded-full shadow-lg flex items-center gap-2 transition"
                    >
                        <img src='/lily.svg' alt='logo' />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)} 
                    className="bg-white text-black p-3 rounded-full shadow-lg flex items-center gap-2 transition"
                >
                    <img src='/lily.svg' alt='logo' />
                </button>
            )}

            {isOpen && (
                <button
                    onClick={handleNavigate} 
                    className="mt-2 bg-white text-black px-4 py-2 rounded-lg shadow-md transition flex items-center space-x-2"
                >
                    <span>Chat with Lily</span>
                    <img src="/lily.svg" alt="Lily Logo" className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

export default AIButton;
