"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { Loader2 } from "lucide-react";


interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    category?: string;
}

const ProductsSection = ({ TopHeading, viewAll }: { TopHeading?: string, viewAll?: boolean }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/products?limit=5');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data.products);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{TopHeading}</h2>

                {viewAll && <Link href="/products" className="text-sm sm:text-base text-blue-400 hover:text-blue-300">View All</Link>}
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                    <span className="ml-2 text-sm text-gray-400">Loading products...</span>
                </div>
            ) : error ? (
                <div className="text-center py-12 text-red-400">{error}</div>
            ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={product.price}
                            image={product.imageUrl}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductsSection;