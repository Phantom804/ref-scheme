"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AdminProtected({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Wait for auth state to load
        if (isLoading) return;

        // If not authenticated, redirect to login
        if (!isAuthenticated) {
            toast.error('You must be logged in to access the admin panel');
            router.push('/signin');
            return;
        }

        // If authenticated but not admin, redirect to home
        if (!isAdmin) {
            toast.error('You do not have admin privileges');
            router.push('/');
        }
    }, [isAdmin, isLoading, isAuthenticated, router]);

    // Show nothing while checking authentication
    if (isLoading || !isAuthenticated || !isAdmin) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#0A0A0F]">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="mt-4 text-xl">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
} 