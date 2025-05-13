"use client";

import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import AdminProtected from "@/components/admin/AdminProtected";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        // <AdminProtected>
        <div className="h-[vh] w-full bg-[#0A0A0F] text-gray-100">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
        // </AdminProtected>
    );
} 