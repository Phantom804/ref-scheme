"use client";

import React, { useState, useEffect } from "react";
import LineChart from "@/components/charts/LineChart";

type PriceGraphSectionProps = {
    productId: string;
    initialData?: any[];
};

export default function PriceGraphSection({ productId, initialData = [] }: PriceGraphSectionProps) {
    const [priceData, setPriceData] = useState(initialData);
    const [selectedRange, setSelectedRange] = useState<'yearly' | '6months' | 'monthly'>('monthly');

    const fetchPriceData = async (range: 'yearly' | '6months' | 'monthly') => {
        try {
            const res = await fetch(`/api/price-history?productId=${productId}&range=${range}`);
            if (!res.ok) throw new Error('Failed to fetch price data');
            const data = await res.json();
            setPriceData(data);
        } catch (error) {
            console.error('Error fetching price data:', error);
        }
    };

    useEffect(() => {
        fetchPriceData(selectedRange);
    }, [selectedRange, productId]);

    return (
        <div className="bg-[#241e34] rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <span className="text-white font-bold text-lg">Price Graph</span>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {['monthly', '6months', 'yearly'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setSelectedRange(range as any)}
                            className={`rounded-full px-2 sm:px-4 py-1 text-xs sm:text-sm ${selectedRange === range ? 'bg-blue-700/30 text-white border border-blue-600/80' : 'text-white/70'}`}
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
    );
}