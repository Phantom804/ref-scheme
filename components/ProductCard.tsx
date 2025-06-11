"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react'
import Link from "next/link";

interface ProductCardProps {
    id?: string | number;
    name: string;
    price: number;
    image: string;
    category?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id = "1", name, price, image, category }) => {

    return (
        <div className="group relative overflow-hidden rounded-xl product-card-gradient shadow-[0_4px_20px_rgba(123,97,255,0.15)] transition-all duration-300 hover:translate-y-[-4px] border border-[#32293d]">

            <div className="w-full h-32 sm:h-36 md:h-40 overflow-hidden">
                    <Link href={`/product/${id}`} >
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
</Link>
            </div>

            <div className="relative z-10 p-3 sm:p-4 flex flex-col">
                <span className="inline-flex self-start text-xs font-medium px-2 py-0.5 rounded-full bg-[#302750] text-[#9b87f5] t mb-1 sm:mb-2">
                    {category}
                </span>

                <Link href={`/product/${id}`} >
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-[#9b87f5] transition-colors">
                        {name}
                    </h3>
                </Link>

                <div className="mt-auto flex justify-between gap-2 ">
                    <div className="flex items-center justify-center">
                        <div className="price-badge text-white text-center font-bold text-sm sm:text-base px-2 py-1 rounded-lg w-fit">
                            <span className="text-xs text-white">PKR</span> {price}
                        </div>
                    </div>
                    <Link href={`/product/${id}`} >
                        <Button
                            variant="ghost"
                            className="text-[#9b87f5] hover:text-[#9b87f5] hover:bg-[#2B2244] group text-xs sm:text-sm p-1 sm:p-2"
                        >
                            View
                            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1   text[#9b87f5]" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
