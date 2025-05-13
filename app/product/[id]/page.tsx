"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import ProductsSection from '@/components/ProductsSection';
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import LineChart from "@/components/charts/LineChart";
import PaymentCard from "@/components/PaymentCard";
import { useParams } from "next/navigation";
import { toast } from 'sonner'

// const priceData = [
//     { month: "Jan", price: 2400 },
//     { month: "Feb", price: 2200 },
//     { month: "Mar", price: 3200 },
//     { month: "Apr", price: 2800 },
//     { month: "May", price: 4300 },
//     { month: "Jun", price: 3900 },
//     { month: "Jul", price: 3200 },
//     { month: "Aug", price: 5100 },
//     { month: "Sep", price: 4800 },
//     { month: "Oct", price: 5300 },
//     { month: "Nov", price: 3000 },
//     { month: "Dec", price: 4200 }
// ];
// type Range = 'yearly' | '6months' | 'monthly' | 'daily';

interface PriceHistoryItem {
    price: number;
    date: string;
}
interface Product {
    id: string;
    description: string;
    name: string;
    productCode: string;
    price: number;
    imageUrl: string;
    category: string;
}

export default function ProductDetail() {



    const router = useRouter();
    const { id } = useParams();
    const PRODUCT_ID = id;


    const [priceData, setPriceData] = useState([]);
    const [product, setProduct] = useState<Product | null>(null);

    const [loading, setLoading] = useState(false);
    const [selectedRange, setSelectedRange] = useState<'yearly' | '6months' | 'monthly' | 'daily'>('yearly');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/productdetail?productId=${PRODUCT_ID}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch product');
                }
                const data = await res.json();
                setProduct(data);
            } catch (error) {
                console.error('Error fetching products:', error);
                toast.error('Failed to load products. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        if (PRODUCT_ID) fetchProduct();
    }, [PRODUCT_ID]);

    const fetchPriceData = async (range: 'yearly' | '6months' | 'monthly' | 'daily') => {
        const res = await fetch(`/api/price-history?productId=${PRODUCT_ID}&range=${range}`);
        const data = await res.json();
        console.log("prize graph data :");
        console.log(data);
        setPriceData(data); // used in <LineChart data={priceData} />
    };


    useEffect(() => {
        fetchPriceData(selectedRange);
    }, [selectedRange]);


    return (
        <>

            <Navbar />
            {loading ? (
                <div className="flex justify-center items-center py-8 sm:py-10 px-4">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-purple-500" />
                    <span className="ml-2 text-sm sm:text-base text-gray-400">Loading orders...</span>
                </div>
            ) : (

                <div>
                    <div className="flex flex-col md:flex-row items-start gap-8 mt-6 pb-10 md:pb-20 px-4 sm:px-6">
                        <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                                <img
                                    src={product?.imageUrl}
                                    alt={product?.name || "Product"}
                                    className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl border border-purple-600 bg-gray-950 object-cover"
                                />
                                <div className="mt-3 sm:mt-0">
                                    <div className="text-xl sm:text-2xl font-semibold text-white flex gap-2 items-center">
                                        {product?.name}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-400 mt-1">Listed on 20 Aug, 2025</div>
                                    <div className="mt-2 sm:mt-3 text-white text-2xl sm:text-3xl font-bold">${product?.price} <span className="text-sm sm:text-base font-medium bg-gray-700/40 rounded px-2 py-1 ml-2 text-blue-200">Current Price</span></div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="my-6 sm:my-8">
                                <h3 className="text-lg sm:text-xl text-white font-bold mb-2">Description</h3>
                                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                                    {product?.description}
                                </p>
                            </div>

                            {/* Price Graph */}
                            <div className="bg-[#241e34] rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                                    <span className="text-white font-bold text-lg">Price Graph</span>
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        {['yearly', '6months', 'monthly', 'daily'].map((range) => (
                                            <button
                                                key={range}
                                                onClick={() => setSelectedRange(range as any)}
                                                className={`rounded-full px-2 sm:px-4 py-1 text-xs sm:text-sm ${selectedRange === range ? 'bg-blue-700/30 text-white border border-blue-600/80' : 'text-white/70'
                                                    }`}
                                            >
                                                {range === '6months' ? '6 Months' : range.charAt(0).toUpperCase() + range.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-[250px] sm:h-[300px] w-full">
                                    <LineChart
                                        data={priceData}
                                        datasets={[
                                            {
                                                key: "price",
                                                color: "#a58ae7",
                                                label: "Price"
                                            }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Buy Now */}
                        <PaymentCard id={product?.id} productName={product?.name} price={product?.price} productCode={product?.productCode} />


                    </div>
                    <div className="px-4 sm:px-6">
                        <ProductsSection TopHeading="Our Products" viewAll={false} />
                    </div>
                </div>

            )}


        </>

    );
}