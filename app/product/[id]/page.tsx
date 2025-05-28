"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ClientProductSection from '@/components/ClientProductSection';
import { Loader2 } from "lucide-react";
import LineChart from "@/components/charts/LineChart";
import ProductLockPanel from "@/components/ProductLockPanel";
import PaymentCard from "@/components/PaymentCard";
import { useParams } from "next/navigation";
import { toast } from 'sonner'
import { format } from "date-fns";



interface Product {
    id: string;
    description: string;
    name: string;
    productCode: string;
    price: number;
    isLocked?: boolean;
    imageUrl: string;
    category: string;
    createdAt: Date;

}

export default function ProductDetail() {

    const { id } = useParams();

    const PRODUCT_ID = id;


    const [priceData, setPriceData] = useState([]);
    const [product, setProduct] = useState<Product | null>(null);

    const [loading, setLoading] = useState(false);
    const [selectedRange, setSelectedRange] = useState<'yearly' | '6months' | 'monthly'>('yearly');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/products/detail?id=${PRODUCT_ID}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch product');
                }
                if (res.status === 400) {
                    toast.warning('Bad request. Use a valid product Link.');
                }
                const data = await res.json();

                setProduct(data);
            } catch (error) {
                toast.error('Failed to load product. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        if (PRODUCT_ID) fetchProduct();
    }, [PRODUCT_ID]);

    const fetchPriceData = async (range: 'yearly' | '6months' | 'monthly') => {
        const res = await fetch(`/api/price-history?productId=${PRODUCT_ID}&range=${range}`);
        const data = await res.json();

        setPriceData(data);
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
                    <span className="ml-2 text-sm sm:text-base text-gray-400">Loading...</span>
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
                                    <div className="text-xs sm:text-sm text-gray-400 mt-1">{product?.createdAt ? `Listed on ${format(new Date(product.createdAt), 'dd MMM, yyyy')}` : 'Date unavailable'} </div>
                                    <div className="mt-2 sm:mt-3 text-white text-2xl sm:text-3xl font-bold">PKR {product?.price} <span className="text-sm sm:text-base font-medium bg-gray-700/40 rounded px-2 py-1 ml-2 text-blue-200">Current Price</span></div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="my-6 sm:my-8">
                                <h3 className="text-lg sm:text-xl text-white font-bold mb-2">Description</h3>
                                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                                    {product?.description}
                                </p>
                            </div>

                            {/* Price Ggraph */}
                            <div className="bg-[#241e34] rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                                    <span className="text-white font-bold text-lg">Price Graph</span>
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        {['yearly', '6months', 'monthly'].map((range) => (
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
                        {product?.isLocked ? (
                            <ProductLockPanel />
                        ) : (

                            <PaymentCard id={product?.id} productName={product?.name} price={product?.price} productCode={product?.productCode} />
                        )
                        }



                    </div>
                    <div className="px-4 sm:px-6">
                        <ClientProductSection TopHeading="Suggested Products" viewAll={false} />
                    </div>
                </div>

            )}



        </>

    );
}