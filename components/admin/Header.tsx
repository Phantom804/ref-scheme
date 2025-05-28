"use client";

import { User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const AdminHeader = () => {
    const { user } = useAuth();
    return (
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-end fixed top-0 right-0 left-0 pr-2 ">

            <Link href="/admin/profile" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <User size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-white mr-0.7 hidden md:inline-block">{user?.name || "Admin User"}</span>
            </Link>
        </header >
    );
};

export default AdminHeader;