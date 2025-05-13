"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Settings, Plus, Package, ChevronRight, CreditCard, ShoppingBag, Group } from 'lucide-react';


const AdminSidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", icon: <Home size={20} />, path: "/admin" },
        { name: "Orders", icon: <ShoppingBag size={20} />, path: "/admin/Orders" },
        { name: "Users", icon: <Users size={20} />, path: "/admin/users" },
        { name: "All Products", icon: <Package size={20} />, path: "/admin/products" },
        // { name: "Add Product", icon: <Plus size={20} />, path: "/admin/add-product" },
        { name: "Payment Details", icon: <CreditCard size={20} />, path: "/admin/payment-methods" },
        { name: "Category", icon: <Group size={20} />, path: "/admin/category" },
        { name: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
    ];

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <aside
            className={`bg-gray-900 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'
                } h-screen fixed left-0 top-0 z-10`}
        >
            <div className="h-16 flex items-center justify-center border-b border-gray-800">
                <div
                    className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start px-4'}`}
                    onClick={toggleSidebar}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="h-8 w-8 bg-purple-600 rounded-md flex items-center justify-center">
                        <ChevronRight className="text-white" size={18} />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-semibold ml-2 text-white">AdminX</span>
                    )}
                </div>
            </div>
            <nav className="mt-6">
                <ul>
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;

                        return (
                            <li key={item.name} className="px-2 py-1">
                                <Link
                                    href={item.path}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                                        ? 'bg-purple-800/50 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        } ${collapsed ? 'justify-center' : 'justify-start'}`}
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    {!collapsed && <span className="ml-3">{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default AdminSidebar; 