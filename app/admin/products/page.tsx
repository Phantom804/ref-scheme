"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Loader2, MoreVertical, History } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/Pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import AddProductDialog from '@/components/AddProductDialog';
import PriceHistoryDialog from '@/components/admin/PriceHistoryDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
    stock?: number;
    status?: string;
}

interface ProductsResponse {
    products: Product[];
    totalPages: number;
    currentPage: number;
    totalProducts: number;
}

const AllProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
    const [isPriceHistoryDialogOpen, setIsPriceHistoryDialogOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
    const [filters, setFilters] = useState({
        productName: '',
        minPrice: 0,
        maxPrice: 1000
    });
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const fetchProducts = async (page = currentPage, search = searchTerm, currentFilters = filters) => {
        try {
            setLoading(true);

            let queryString = `/api/admin/all-products?page=${page}&limit=10`;

            if (search) {
                queryString += `&search=${encodeURIComponent(search)}`;
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
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            fetchProducts(1, value, filters);
            setCurrentPage(1);
        }, 500);

        setSearchTimeout(timeout);
    };

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
        <div className="pt-8 md:ml-16 lg:ml-64 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Products</h1>
                    <p className="text-gray-400">Manage your product inventory</p>
                </div>
                <Button
                    className="mt-4 sm:mt-0"
                    onClick={() => setIsAddProductDialogOpen(true)}
                >
                    <Plus size={16} />
                    Add New Product
                </Button>
            </div>

            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 p-4">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search size={16} className="text-gray-500" />
                        </div>
                        <Input
                            type="text"
                            className="bg-gray-800 text-white pl-10"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                            >
                                <Filter size={16} className="mr-2" />
                                Filters
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-4">
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

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        <span className="ml-2 text-gray-400">Loading products...</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400">No products found</p>
                    </div>
                ) : (
                    <div className="relative overflow-x-auto rounded-lg">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Product</th>
                                    <th scope="col" className="px-6 py-3">Category</th>
                                    <th scope="col" className="px-6 py-3">Price</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4">{product.category}</td>
                                        <td className="px-6 py-4">${product.price.toFixed(2)}</td>


                                        <td className="px-6 py-4 text-right space-x-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-gray-400 hover:text-white">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedProductId(product.id);
                                                            setIsAddProductDialogOpen(true);
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Product
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedProductId(product.id);
                                                            setIsPriceHistoryDialogOpen(true);
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <History className="mr-2 h-4 w-4" />
                                                        Price History
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalProducts}
                    onPageChange={handlePageChange}
                    loading={loading}
                />
            </Card>

            <AddProductDialog
                isOpen={isAddProductDialogOpen}
                onClose={() => {
                    setIsAddProductDialogOpen(false);
                    setSelectedProductId(undefined);
                }}
                onProductAdded={() => fetchProducts(currentPage)}
                productId={selectedProductId}
            />

            {selectedProductId && (
                <PriceHistoryDialog
                    isOpen={isPriceHistoryDialogOpen}
                    onClose={() => {
                        setIsPriceHistoryDialogOpen(false);
                        setSelectedProductId(undefined);
                    }}
                    productId={selectedProductId}
                />
            )}
        </div>
    );
};

export default AllProducts;