"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Mail, MessageCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'

const ChatButton = () => {
    const { appSettings, isLoading: settingsLoading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [messanger, setMessanger] = useState('');
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) {
        return null;
    }



    useEffect(() => {
        if (!settingsLoading && appSettings) {
            setEmail((appSettings as any)?.email || '');
            setWhatsappNumber((appSettings as any)?.whatsappNumber || '');
            setMessanger((appSettings as any)?.messanger || '');
        }
    }, [appSettings, settingsLoading]);

    return (
        <div className="fixed bottom-17 right-6 z-50">

            {isOpen && (
                <div className="flex flex-col gap-3 mb-4 animate-in fade-in slide-in-from-bottom duration-300">
                    {/* WhatsApp option */}
                    <a
                        href={"https://wa.me/" + whatsappNumber}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors"
                    >
                        <MessageCircle size={20} />
                        <span className="text-sm font-medium">WhatsApp</span>
                    </a>

                    {/* Email option */}
                    <a
                        href={`mailto:${email}`}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full transition-colors"
                    >
                        <Mail size={20} />
                        <span className="text-sm font-medium">Email</span>
                    </a>
                    {/* adding facebook messanger option */}
                    <a
                        href={`https://m.me/${messanger}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#0084FF] text-white p-3 rounded-full hover:bg-[#006fe0] transition-colors"
                    >
                        <MessageCircle size={20} />
                        <span className="text-sm font-medium">Messenger</span>
                    </a>
                </div>
            )}

            {/* Main chat button */}
            <button
                id="toggleChatButton"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center w-12 h-12 transform transition-transform duration-200 ease-in-out"
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <MessageCircle size={24} />
                )}
            </button>
        </div>
    );
};

export default ChatButton;