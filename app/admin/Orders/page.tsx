"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, MoreHorizontal } from "lucide-react";
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import Pagination from '@/components/Pagination';

interface Order {
    id: string;
    name: string;
    transactionId: string;
    quantity: number;
    productCode: string;
    referralCode: string;
    price: string;
    boughtOn: string;
    status: "Pending" | "Completed" | "Cancelled";
    receiptUrl: string;
}

interface OrdersResponse {
    orders: Order[];
    totalPages: number;
    currentPage: number;
    totalOrders: number;
}

const Orders: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState<'direct' | 'reference' | ''>('direct');
    const [filters, setFilters] = useState({
        referralCode: '',
        productName: '',
        minPrice: 0,
        maxPrice: 1000
    });
    const ordersPerPage = 10;


    // Fetch orders from API
    const fetchOrders = async (page = currentPage, search = searchTerm, currentFilters = filters, orderTypeParam = activeTab) => {
        try {
            setLoading(true);

            // Build query string with all filters
            let queryString = `/api/admin/orders?page=${page}&limit=${ordersPerPage}`;

            // Add order type filter
            if (orderTypeParam) {
                queryString += `&orderType=${orderTypeParam}`;
            }

            if (search) {
                queryString += `&search=${encodeURIComponent(search)}`;
            }

            if (currentFilters.referralCode) {
                queryString += `&referralCode=${encodeURIComponent(currentFilters.referralCode)}`;
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
                throw new Error('Failed to fetch orders');
            }

            const data: OrdersResponse = await response.json();
            setOrders(data.orders);
            setTotalPages(data.totalPages);
            setTotalOrders(data.totalOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle status change
    const handleStatusChange = async (status: Order['status'], orderId: string) => {
        try {
            const response = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId, status }),
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            // Update local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status } : order
            ));

            toast.success('Order status updated successfully');
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status. Please try again.');
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Completed':
                return 'bg-[#1A392C] text-[#4ADE80]';
            case 'Cancelled':
                return 'bg-[#3A1D1D] text-[#F75555]';
            case 'Pending':
                return 'bg-[#1C2F4C] text-[#3B82F6]';
            default:
                return '';
        }
    };


    // Handle search input change with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for debounce
        const timeout = setTimeout(() => {
            fetchOrders(1, value, filters);
            setCurrentPage(1);
        }, 500);

        setSearchTimeout(timeout);
    };

    // Handle filter changes
    const handleFilterChange = (name: string, value: string | number | number[]) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
    };

    // Apply filters
    const applyFilters = () => {
        fetchOrders(1, searchTerm, filters);
        setCurrentPage(1);
    };

    // Reset filters
    const resetFilters = () => {
        const defaultFilters = {
            referralCode: '',
            productName: '',
            minPrice: 0,
            maxPrice: 1000
        };
        setFilters(defaultFilters);
        fetchOrders(1, searchTerm, defaultFilters);
        setCurrentPage(1);
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchOrders(page, searchTerm, filters);
    };

    // Download receipt
    const handleDownloadReceipt = (receiptUrl: string) => {
        if (!receiptUrl) {
            toast.error('Receipt not available');
            return;
        }

        window.open(receiptUrl, '_blank');
    };

    // Handle tab change
    const handleTabChange = (tab: 'direct' | 'reference') => {
        setActiveTab(tab);
        fetchOrders(1, searchTerm, filters, tab);
        setCurrentPage(1);
    };

    // Initial data fetch
    useEffect(() => {
        fetchOrders();

        // Cleanup timeout on component unmount
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, []);

    return (
        <div className="pt-8 md:ml-16 lg:ml-64 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Orders</h1>
                    <p className="text-gray-400">Manage orders and track transactions</p>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex gap-2 bg-[#1A1F2C] rounded-lg p-1">
                            <Button
                                variant="ghost"
                                className={`rounded-md px-6 py-2 ${activeTab === 'direct' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => handleTabChange('direct')}
                            >
                                Direct
                            </Button>
                            <Button
                                variant="ghost"
                                className={`rounded-md px-6 py-2 ${activeTab === 'reference' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => handleTabChange('reference')}
                            >
                                Reference
                            </Button>

                        </div>

                    </div>
                </div>
            </div>

            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search size={16} className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            className="bg-gray-800 text-white text-sm rounded-lg block w-full pl-10 p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Search by transaction ID or referral code..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <Popover open={showFilters} onOpenChange={setShowFilters}>
                        <PopoverTrigger asChild>
                            <Button
                                className='bg-gray-800'
                                size="sm"
                            >
                                <Filter size={16} className="mr-2" />
                                Filters
                                {(filters.referralCode || filters.productName || filters.minPrice > 0 || filters.maxPrice < 1000) && (
                                    <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full"></span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-gray-800 border-gray-700 text-white p-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium">Filters</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetFilters}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Reset
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="referralCode" className="text-sm text-gray-400">Referral Code</Label>
                                    <Input
                                        id="referralCode"
                                        value={filters.referralCode}
                                        onChange={(e) => handleFilterChange('referralCode', e.target.value)}
                                        placeholder="Filter by referral code"
                                        className="bg-gray-700 border-gray-600 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="productName" className="text-sm text-gray-400">Product Name</Label>
                                    <Input
                                        id="productName"
                                        value={filters.productName}
                                        onChange={(e) => handleFilterChange('productName', e.target.value)}
                                        placeholder="Filter by product name"
                                        className="bg-gray-700 border-gray-600 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label className="text-sm text-gray-400">Price Range</Label>
                                        <span className="text-sm text-gray-400">
                                            ${filters.minPrice} - ${filters.maxPrice}
                                        </span>
                                    </div>
                                    <div className="pt-4 pb-2">
                                        <Slider
                                            defaultValue={[filters.minPrice, filters.maxPrice]}
                                            max={1000}
                                            step={10}
                                            value={[filters.minPrice, filters.maxPrice]}
                                            onValueChange={(value) => {
                                                handleFilterChange('minPrice', value[0]);
                                                handleFilterChange('maxPrice', value[1]);
                                            }}
                                            className="text-purple-500"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={() => {
                                        applyFilters();
                                        setShowFilters(false);
                                    }}
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="relative overflow-x-auto rounded-lg">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <span className="ml-2 text-gray-400">Loading orders...</span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No orders found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-[#2A2F3E]">
                                    <TableHead className="text-gray-400">Name</TableHead>
                                    <TableHead className="text-gray-400">Transaction ID</TableHead>
                                    <TableHead className="text-gray-400">Product Code</TableHead>
                                    <TableHead className="text-gray-400">Quantity</TableHead>
                                    <TableHead className="text-gray-400">Referral Code</TableHead>
                                    <TableHead className="text-gray-400">Price</TableHead>
                                    <TableHead className="text-gray-400">Bought On</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-400">Receipt</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-[#1F2937]/5 border-b border-[#2A2F3E]">
                                        <TableCell className="font-medium flex items-center gap-2 text-white">
                                            <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
                                                <span className="text-white">$</span>
                                            </div>
                                            {order.name}
                                        </TableCell>
                                        <TableCell className="text-white">{order.transactionId}</TableCell>
                                        <TableCell className="text-white">{order.productCode}</TableCell>
                                        <TableCell className="text-white">{order.quantity}</TableCell>
                                        <TableCell className="text-white">{order.referralCode}</TableCell>
                                        <TableCell className="text-[#3B82F6]">{order.price}</TableCell>
                                        <TableCell className="text-white">{order.boughtOn}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={order.status}
                                                onValueChange={(value: Order['status']) => handleStatusChange(value, order.id)}
                                            >
                                                <SelectTrigger className={`w-[110px] border-none ${getStatusColor(order.status)}`}>
                                                    <SelectValue>{order.status}</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
                                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                className="text-[#3B82F6] hover:text-[#3B82F6]/80 p-0"
                                                onClick={() => handleDownloadReceipt(order.receiptUrl)}
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {!loading && orders.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalOrders}
                        onPageChange={handlePageChange}
                        loading={loading}
                    />
                )}

            </Card>
        </div>
    );
};

export default Orders;