"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Settings, Package, ChevronRight, CreditCard, ShoppingBag, Group, Menu, Wallet } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";


const AdminSidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [hasPendingOrders, setHasPendingOrders] = useState(false);
    const [hasPendingWithdrawals, setHasPendingWithdrawals] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Check for pending orders
        const checkPendingOrders = async () => {
            try {
                const response = await fetch('/api/admin/orders?page=1&limit=1');
                const data = await response.json();
                setHasPendingOrders(data.totalOrders > 0);
            } catch (error) {
                console.error('Error checking pending orders:', error);
            }
        };

        // Check for pending withdrawals
        const checkPendingWithdrawals = async () => {
            try {
                const response = await fetch('/api/admin/withdraw?page=1&limit=1');
                const data = await response.json();
                setHasPendingWithdrawals(data.totalWithdrawals > 0);
            } catch (error) {
                console.error('Error checking pending withdrawals:', error);
            }
        };
        setTimeout(() => {
            checkPendingOrders();
            checkPendingWithdrawals();

        }, 2000);
        // Set up interval to check periodically (every 5 minutes)
        const intervalId = setInterval(() => {
            checkPendingOrders();
            checkPendingWithdrawals();
        }, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    const navItems = [
        { name: "Dashboard", icon: <Home size={20} />, path: "/admin" },
        {
            name: "Orders",
            icon: <ShoppingBag size={20} color={hasPendingOrders ? "#10b981" : "currentColor"} />,
            path: "/admin/Orders"
        },
        {
            name: "Withdraw",
            icon: <Wallet size={20} color={hasPendingWithdrawals ? "#10b981" : "currentColor"} />,
            path: "/admin/withdraw"
        },
        { name: "Users", icon: <Users size={20} />, path: "/admin/users" },
        { name: "All Products", icon: <Package size={20} />, path: "/admin/products" },
        { name: "Payment Details", icon: <CreditCard size={20} />, path: "/admin/payment-methods" },
        { name: "Category", icon: <Group size={20} />, path: "/admin/category" },
        { name: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
    ];

    const toggleSidebar = () => {
        const newCollapsedState = !collapsed;
        setCollapsed(newCollapsedState);
    };

    return (
        <>
            {/* Mobile Hamburger Menu */}
            <div className="md:hidden fixed top-4 left-4 z-20">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full p-2 bg-gray-800 text-white hover:bg-gray-700">
                            <Menu size={24} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-gray-900 border-r border-gray-800 p-0 w-64 text-white">
                        <SheetHeader className="h-16 flex items-center justify-between border-b border-gray-800 px-4">
                            <SheetTitle className="text-lg font-semibold text-white mt-1.5">AdminX</SheetTitle>
                        </SheetHeader>
                        <nav className="mt-6">
                            <ul>
                                {navItems.map((item) => {
                                    const isActive = pathname === item.path;

                                    return (
                                        <li key={item.name} className="px-2 py-1">
                                            <SheetClose asChild>
                                                <Link
                                                    href={item.path}
                                                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                                                        ? 'bg-purple-800/50 text-white'
                                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                        }`}
                                                >
                                                    <span className="flex-shrink-0">{item.icon}</span>
                                                    <span className="ml-3">{item.name}</span>
                                                </Link>
                                            </SheetClose>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside
                className={`bg-gray-900 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'
                    } h-screen fixed left-0 top-0 z-10 hidden md:block`}
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
        </>
    );
};

export default AdminSidebar;