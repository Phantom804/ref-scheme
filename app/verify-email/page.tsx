"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

function VerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setVerificationStatus('error');
                setMessage('Verification token is missing.');
                return;
            }

            try {
                const response = await fetch(`/api/auth/verify-email?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setVerificationStatus('success');
                    setMessage('Your email has been successfully verified. You can now sign in.');
                } else {
                    setVerificationStatus('error');
                    setMessage(data.error || 'Failed to verify email.');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setVerificationStatus('error');
                setMessage('An error occurred during verification.');
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-[#1c0f2e]/80 rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
                <div className="mx-auto w-16 h-16 bg-[#2c1960] flex items-center justify-center rounded-full mb-6">
                    {verificationStatus === 'loading' && (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    )}
                    {verificationStatus === 'success' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {verificationStatus === 'error' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </div>

                <h2 className="text-white text-2xl font-bold mb-4">Email Verification</h2>
                <p className="text-gray-300 mb-6">{message}</p>

                <Button
                    onClick={() => router.push('/signin')}
                    className={`w-full mt-4 bg-[#715cff] hover:bg-[#5740b2] text-white font-bold text-base rounded-lg py-2
            ${verificationStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={verificationStatus === 'loading'}
                >
                    {verificationStatus === 'success' ? 'Sign In' : 'Go to Sign In'}
                </Button>
            </div>
        </div>
    );
}


export default function VerifyEmail() {
    return (
        <Suspense fallback={<div className="py-12 text-center">Loading products...</div>}>
            <VerifyPage />
        </Suspense>
    )
}

