"use client"
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Footer = () => {
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) {
        return null;
    }
    return (
        <footer className="bg-transparent text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:items-center md:justify-center text-center space-y-3">
                    <div>
                        <p className="text-xs">&copy; {new Date().getFullYear()} Cash Vibe. All rights reserved.</p>
                        <p className="text-xs text-gray-400">A next-generation digital marketplace.</p>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                        <p className="text-xs">Developed by imCodeZero</p>
                        <a href="https://imcodezero.com" target="_blank" rel="noopener noreferrer">
                            <Image src="/main-logo.png" alt="IamCodeZero Logo" width={19} height={19} className="rounded-full" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>

    );
};

export default Footer;