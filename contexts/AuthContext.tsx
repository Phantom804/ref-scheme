"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

type User = {
    id: string;
    name: string;
    phoneNumber: string;
    referralCode: string;
    email?: string;
    role?: string;
}

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    signIn: (phoneNumber: string, password: string) => Promise<{ success: boolean, message?: string }>;
    signUp: (name: string, referredByCode: string, phoneNumber: string, password: string) => Promise<{ success: boolean, message?: string }>;
    signOut: () => Promise<void>;
    updateUserInfo: (data: { id: string, name?: string, email?: string, phoneNumber?: string, oldpin?: string, newpin?: string }) => Promise<{ success: boolean, message?: string, user?: User }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user session on mount and after auth state changes
    const fetchUserSession = async () => {
        try {
            const response = await fetch('/api/auth/session', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch user session:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserSession();
    }, []);

    const signIn = async (phoneNumber: string, password: string) => {
        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, password }),
                credentials: 'include' // Important for cookies
            });

            const data = await response.json();

            if (!data.success) {
                return { success: false, message: data.message };
            }

            // Fetch updated user session
            await fetchUserSession();

            return { success: true, message: data.message };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, message: 'An error occurred during sign in.' };
        }
    };

    const signUp = async (name: string, referredByCode: string, phoneNumber: string, password: string) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phoneNumber, referredByCode, password }),
            });

            const data = await response.json();

            if (!data.success) {
                return { success: false, message: data.message };
            }

            return { success: true, message: data.message };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, message: 'An error occurred during sign up.' };
        }
    };

    const signOut = async () => {
        try {
            await fetch('/api/auth/signout', {
                method: 'POST',
                credentials: 'include' // Important for cookies
            });

            // Clear local state
            setUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const updateUserInfo = async (data: { id: string, name?: string, email?: string, phoneNumber?: string, oldpin?: string, newpin?: string }) => {
        try {
            const response = await fetch('/api/auth/update-info', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            const result = await response.json();
            if (result.success && result.user) {
                setUser(result.user);
            }
            return result;
        } catch (error) {
            console.error('Update user info error:', error);
            return { success: false, message: 'An error occurred while updating user info.' };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'admin' || user?.role === 'superAdmin',
            isSuperAdmin: user?.role === 'superAdmin',
            signIn,
            signUp,
            signOut,
            updateUserInfo
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};