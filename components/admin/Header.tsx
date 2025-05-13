"use client";

import { Bell, Search, User } from 'lucide-react';
import Link from 'next/link';

const AdminHeader = () => {
    return (
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-end px-4 md:px-6">


            <Link href="/admin/profile" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <User size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-white hidden md:inline-block">Admin User</span>
            </Link>

        </header>
    );
};

export default AdminHeader; 