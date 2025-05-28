'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Term {
    _id: string;
    title: string;
    content: string;
    order: number;
    isActive: boolean;
}

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
    const [animateIn, setAnimateIn] = useState(false);
    const [terms, setTerms] = useState<Term[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch terms when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchTerms();
            // Trigger animation after component is mounted
            setTimeout(() => setAnimateIn(true), 10);
        } else {
            setAnimateIn(false);
        }
    }, [isOpen]);

    const fetchTerms = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/terms');
            if (!response.ok) {
                throw new Error('Failed to fetch terms');
            }
            const data = await response.json();
            // Get terms from the response and sort by order field
            const termsData = data.terms || [];
            const sortedTerms = termsData.sort((a: Term, b: Term) => a.order - b.order);
            setTerms(sortedTerms);
            setError('');
        } catch (err) {
            console.error('Error fetching terms:', err);
            setError('Failed to load terms and conditions');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${animateIn ? 'opacity-50' : 'opacity-0'}`}
                onClick={onClose}
            />

            <div
                className={`relative bg-[#1c0f2e] text-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl transition-all duration-300 ${animateIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4 text-center">Terms & Conditions</h2>

                <div className="space-y-4 text-gray-300 text-sm max-h-[60vh] overflow-y-auto pr-2">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="animate-spin text-[#9b87f5]" size={24} />
                        </div>
                    ) : error ? (
                        <div className="p-3 border border-red-500 rounded-lg bg-red-500/10 text-red-200">
                            {error}
                        </div>
                    ) : terms.length === 0 ? (
                        <div className="p-3 border border-[#372759] rounded-lg">
                            <p className="text-center">No terms and conditions found.</p>
                        </div>
                    ) : (
                        terms.map((term, index) => (
                            <div key={term._id} className="p-3 border border-[#372759] rounded-lg">
                                <p className="font-semibold mb-1 text-white">{index + 1}. {term.title}</p>
                                <p>{term.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}