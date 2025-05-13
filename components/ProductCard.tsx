"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProductCardProps {
    id?: string | number;
    name: string;
    price: number;
    image: string; // This can be either imageUrl from API or image from static data
}

const ProductCard: React.FC<ProductCardProps> = ({ id = "1", name, price, image }) => {
    const router = useRouter();
    return (
        <div className="rounded-xl overflow-hidden border border-purple/10 bg-gray-900/30 flex flex-col h-full transition-transform hover:scale-[1.02]">
            <div className="h-36 sm:h-40 md:h-48 overflow-hidden relative">
                <img 
                    src={image} 
                    alt={name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105" 
                    onError={(e) => {
                        // Fallback image if the provided image fails to load
                        (e.target as HTMLImageElement).src = "/image (1).png";
                    }}
                />
            </div>
            <div className="p-3 sm:p-4 flex justify-between items-center">
                <div>
                    <h3 className="text-base sm:text-lg font-medium text-white truncate max-w-[120px] sm:max-w-[150px]">{name}</h3>
                    <p className="text-xs sm:text-sm text-gray-400">Coins</p>
                </div>
                <div className="text-right">
                    <p className="text-base sm:text-lg font-bold text-white">${price.toFixed(2)}</p>
                    <p className="text-xs sm:text-sm text-gray-400">USD</p>
                </div>
            </div>
            <div className="p-3 sm:p-4 mt-auto">
                <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-1 sm:py-2"
                    onClick={() => router.push(`/product/${id}`)}
                >
                    View Details
                </Button>
            </div>
        </div>
    );
};

export default ProductCard;