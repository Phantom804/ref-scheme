'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Trigger animation after component is mounted
            setTimeout(() => setAnimateIn(true), 10);
        } else {
            setAnimateIn(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with animation */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${animateIn ? 'opacity-50' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal with animation */}
            <div
                className={`relative bg-[#1c0f2e] text-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl transition-all duration-300 ${animateIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                    }`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4 text-center">Terms & Conditions</h2>

                <div className="space-y-4 text-gray-300 text-sm">
                    <div className="p-3 border border-[#372759] rounded-lg">
                        <p className="font-semibold mb-1 text-white">1. Accurate Information</p>
                        <p>I confirm that the information provided is accurate and truthful.</p>
                    </div>

                    <div className="p-3 border border-[#372759] rounded-lg">
                        <p className="font-semibold mb-1 text-white">2. Account Responsibility</p>
                        <p>I accept full responsibility for any actions taken through my account.</p>
                    </div>

                    <div className="p-3 border border-[#372759] rounded-lg">
                        <p className="font-semibold mb-1 text-white">3. Compliance</p>
                        <p>I understand that violations may lead to account restrictions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}