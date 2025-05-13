"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    LogOut,
    Search,
    Menu,
    User
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const NAV_LINKS = [
    { label: "Explore", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Settings", href: "/user-dashboard" },
    { label: "Help", href: "/help" },
];

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, signOut } = useAuth();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <nav className="w-full flex justify-between items-center py-4 sm:py-6 px-4 sm:px-8">
            {/* Logo */}
            <div
                className="text-white text-2xl sm:text-3xl font-extrabold tracking-wide select-none cursor-pointer"
                onClick={() => router.push("/")}
            >
                LOGO
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center">
                <div className="flex space-x-2 bg-[#19112A] border border-[#2d2545] rounded-full px-3 py-1">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href ||
                            (link.href !== "/" && pathname.startsWith(link.href));

                        return (
                            <Link href={link.href} key={link.label}>
                                <Button
                                    variant="ghost"
                                    className={`
                                        text-white rounded-full text-lg font-medium px-5 py-1.5
                                        ${isActive ? "bg-[#201251] border border-blue-300 shadow-[0px_1px_7px_0px_rgba(84,55,255,0.10)] text-blue-300" : "hover:bg-[#110736] hover:text-blue-300"}
                                        transition-colors
                                    `}
                                    style={{ boxShadow: isActive ? "0px 1px 7px 0px rgba(84,55,255,0.10)" : undefined }}
                                >
                                    {link.label}
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Actions: Search + User/Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Search Button with Popover */}
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full p-2 text-[#ffffff] bg-white/10 border border-[#EEE]/[0.18] hover:bg-[#e8e9fa]/40"
                        >
                            <Search size={20} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-[200px] sm:w-[300px] p-0 bg-[#19112A] border border-[#2d2545]"
                        align="end"
                    >
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const searchInput = e.currentTarget.querySelector('input');
                            if (searchInput) {
                                const sanitizedSearch = searchInput.value.replace(/[<>"'&]/g, '');
                                router.push(`/products?search=${encodeURIComponent(sanitizedSearch)}`);
                                setIsSearchOpen(false);
                            }
                        }} className="flex items-center p-2">
                            <Search className="h-4 w-4 mr-2 text-[#D6DDFC]" />
                            <Input
                                placeholder="Search..."
                                className="border-none focus-visible:ring-0 bg-transparent text-white placeholder:text-[#D6DDFC]/70"
                                autoFocus
                                name="search"
                            />
                        </form>
                    </PopoverContent>
                </Popover>

                {/* Auth Section - Desktop */}
                <div className="hidden sm:flex items-center bg-white/10 border border-[#EEE]/[0.18] rounded-full px-3 py-1 space-x-3 shadow-sm backdrop-blur-[1.5px]">
                    {/* Auth or User */}
                    {isAuthenticated ? (
                        <>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <Link href="/user-dashboard" >
                                <span className="text-[#D6DDFC] font-medium px-2">{user?.name || "Asim"}</span>
                            </Link>
                            <Button
                                variant="ghost"
                                className="rounded-full bg-transparent text-[#ffffff] font-semibold px-6 py-2 min-w-[92px] hover:bg-[#110736] hover:text-blue-300 transition-colors"
                                onClick={signOut}
                            >
                                Logout
                                <LogOut size={18} className="ml-1" />
                            </Button>
                        </>
                    ) : (
                        <div className="flex space-x-2 px-1">
                            <Button
                                onClick={() => router.push("/signin")}
                                className="rounded-full bg-transparent text-[#ffffff] font-semibold px-6 py-2 min-w-[92px] hover:bg-[#110736] hover:text-blue-300 transition-colors"
                            >
                                Sign In
                            </Button>
                            {/* Divider, optional */}
                            <div className="w-[1px] h-8 bg-[#E8E9FA]/30 mx-2 hidden md:block"></div>
                            <Button
                                onClick={() => router.push("/signup")}
                                className="rounded-full bg-transparent text-[#ffffff] font-semibold px-6 py-2 min-w-[92px] hover:bg-[#110736] hover:text-blue-300 transition-colors"
                            >
                                Sign Up
                            </Button>
                        </div>
                    )}
                </div>

                {/* Auth Section - Mobile */}
                <div className="sm:hidden">
                    {isAuthenticated ? (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full p-2 text-[#ffffff] bg-white/10 border border-[#EEE]/[0.18] hover:bg-[#e8e9fa]/40"
                            onClick={() => router.push("/signin")}
                        >
                            <User size={20} />
                        </Button>
                    )}
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden rounded-full p-2 text-[#ffffff] bg-white/10 border border-[#EEE]/[0.18] hover:bg-[#e8e9fa]/40"
                        >
                            <Menu size={20} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        className="bg-[#19112A] border-l border-[#2d2545] text-white"
                    >
                        <SheetHeader>
                            <SheetTitle className="text-white text-xl">Menu</SheetTitle>
                        </SheetHeader>
                        <div className="mt-8 flex flex-col space-y-4">
                            {NAV_LINKS.map((link) => {
                                const isActive = pathname === link.href ||
                                    (link.href !== "/" && pathname.startsWith(link.href));

                                return (
                                    <SheetClose asChild key={link.label}>
                                        <Link
                                            href={link.href}
                                            className={`
                                                text-lg font-medium px-2 py-2 rounded-md
                                                ${isActive ? "bg-[#201251] text-blue-300" : "hover:bg-[#110736] hover:text-blue-300"}
                                                transition-colors
                                            `}
                                        >
                                            {link.label}
                                        </Link>
                                    </SheetClose>
                                );
                            })}

                            {/* Mobile Auth Options */}
                            <div className="pt-6 mt-6 border-t border-[#2d2545]">
                                {isAuthenticated ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-[#D6DDFC] font-medium">{user?.name || "Asim"}</span>
                                        </div>
                                        <SheetClose asChild>
                                            <Link
                                                href="/user-dashboard"
                                                className="block text-lg font-medium px-2 py-2 rounded-md hover:bg-[#110736] hover:text-blue-300 transition-colors"
                                            >
                                                Dashboard
                                            </Link>
                                        </SheetClose>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start rounded-md bg-transparent text-[#ffffff] font-semibold px-2 py-2 hover:bg-[#110736] hover:text-blue-300 transition-colors"
                                            onClick={signOut}
                                        >
                                            Logout
                                            <LogOut size={18} className="ml-2" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <SheetClose asChild>
                                            <Button
                                                onClick={() => router.push("/signin")}
                                                className="w-full justify-center rounded-md bg-[#201251] text-[#ffffff] font-semibold py-2 hover:bg-[#2d1a6b] transition-colors"
                                            >
                                                Sign In
                                            </Button>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Button
                                                onClick={() => router.push("/signup")}
                                                variant="outline"
                                                className="w-full justify-center rounded-md border-[#2d2545] bg-transparent text-[#ffffff] font-semibold py-2 hover:bg-[#110736] hover:text-blue-300 transition-colors"
                                            >
                                                Sign Up
                                            </Button>
                                        </SheetClose>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
};

export default Navbar;