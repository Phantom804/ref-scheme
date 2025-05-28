"use client";

import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";



export default function AdminLayout({ children }: { children: ReactNode }) {

    return (

        <div className="min-h-screen w-full bg-[#0A0A0F] text-gray-100">
            <AdminSidebar />
            <div
                className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out`}
            >
                <AdminHeader />
                <main className="flex-1 overflow-y-auto mt-7 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>

    );
}

