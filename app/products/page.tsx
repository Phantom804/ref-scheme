"use client";

import React, { useState, useEffect, Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Filter, Loader2 } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
}

interface ProductsResponse {
    products: Product[];
    totalPages: number;
    currentPage: number;
    totalProducts: number;
}

interface categoryType {
    _id: string;
    name: string;

}

// Create a client component that uses useSearchParams
function ProductsContent() {
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<categoryType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        productName: '',
        minPrice: 0,
        maxPrice: 1000,
        category: ''
    });


    useEffect(() => {
        // Get search term from URL query parameter
        const searchFromUrl = searchParams.get('search');
        if (searchFromUrl) {
            setSearchTerm(searchFromUrl);
        }
    }, [searchParams]);

    const fetchProducts = async (page = currentPage, search = searchTerm, currentFilters = filters) => {
        try {
            setLoading(true);

            let queryString = `/api/products?page=${page}&limit=10`;

            if (search) {
                queryString += `&search=${search}`;
            }

            if (currentFilters.productName) {
                queryString += `&productName=${encodeURIComponent(currentFilters.productName)}`;
            }

            if (currentFilters.minPrice > 0) {
                queryString += `&minPrice=${currentFilters.minPrice}`;
            }

            if (currentFilters.maxPrice < 1000) {
                queryString += `&maxPrice=${currentFilters.maxPrice}`;
            }

            const response = await fetch(queryString);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data: ProductsResponse = await response.json();
            setProducts(data.products);
            setTotalPages(data.totalPages);
            setTotalProducts(data.totalProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Error fetching categories:', err));
    }, [searchTerm]); // Add searchTerm as dependency


    const handleFilterChange = (name: string, value: string | number | number[]) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        fetchProducts(1, searchTerm, filters);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        const defaultFilters = {
            productName: '',
            category: '',
            minPrice: 0,
            maxPrice: 1000
        };
        setFilters(defaultFilters);
        fetchProducts(1, searchTerm, defaultFilters);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchProducts(page, searchTerm, filters);
    };


    return (
        <>
            <Navbar />
            <main className='px-4 sm:px-6'>
                <div className="py-12">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">Our Products</h2>
                            {/* Remove the search input box */}
                        </div>
                        <div className="flex gap-2 items-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button className='bg-gray-800'
                                        size="sm">
                                        <Filter size={16} className="mr-2" />
                                        Filters
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select
                                                value={filters.category}
                                                onValueChange={(value) => handleFilterChange('category', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category._id} value={category.name}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Product Name</Label>
                                            <Input
                                                placeholder="Filter by product name"
                                                value={filters.productName}
                                                onChange={(e) => handleFilterChange('productName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Price Range</Label>
                                            <div className="pt-2">
                                                <Slider
                                                    defaultValue={[filters.minPrice, filters.maxPrice]}
                                                    max={1000}
                                                    step={1}
                                                    onValueChange={(value) => {
                                                        handleFilterChange('minPrice', value[0]);
                                                        handleFilterChange('maxPrice', value[1]);
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>${filters.minPrice}</span>
                                                <span>${filters.maxPrice}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <Button variant="outline" onClick={resetFilters}>Reset</Button>
                                            <Button onClick={applyFilters}>Apply</Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <span className="ml-2 text-gray-400">Loading Products...</span>
                        </div>
                    ) : (

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    image={product.imageUrl || '/placeholder.png'}
                                />
                            ))}
                        </div>
                    )}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalProducts}
                        onPageChange={handlePageChange}
                        loading={loading}
                    />
                </div>
            </main>
        </>
    );
}

// Export the main component with Suspense boundary
export default function Products() {
    return (
        <Suspense fallback={<div className="py-12 text-center">Loading products...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
