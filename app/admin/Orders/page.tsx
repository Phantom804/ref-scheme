"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { DeliveryDetailsSheet } from '@/components/admin/DeliveryDetailsSheet';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Pagination from '@/components/Pagination';

interface Order {
    id: string;
    productName?: string;
    productId: string;
    transactionId: string;
    quantity: number;
    productCode?: string;
    referralCode?: string;
    commission?: string;
    buyer: string,
    price: string;
    boughtOn: string;
    status: "Pending" | "Completed" | "Cancelled";
    receiptUrl: string;
    deliveryRequested: boolean;
    deliveryStatus: "Pending" | "In Transit" | "Delivered";
    deliveryDate: string;
    deliveryAddress: string;
    deliveryContactPhone: string;
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
    const [filters, setFilters] = useState({
        referralCode: '',
        minPrice: 0,
        maxPrice: 1000,
        showCancelledOrders: false,
        showCompletedOrders: false // Add new filter state
    });
    const ordersPerPage = 10;


    // Fetch orders from API
    const fetchOrders = async (page = currentPage, search = searchTerm, currentFilters = filters) => {
        try {
            setLoading(true);

            // Build query string with all filters
            let queryString = `/api/admin/orders?page=${page}&limit=${ordersPerPage}`;



            if (search) {
                queryString += `&search=${encodeURIComponent(search)}`;
            }

            if (currentFilters.referralCode) {
                queryString += `&referralCode=${encodeURIComponent(currentFilters.referralCode)}`;
            }

            if (currentFilters.minPrice > 0) {
                queryString += `&minPrice=${currentFilters.minPrice}`;
            }

            if (currentFilters.maxPrice < 1000) {
                queryString += `&maxPrice=${currentFilters.maxPrice}`;
            }

            // Add show cancelled orders filter
            queryString += `&showCancelledOrders=${currentFilters.showCancelledOrders}`;
            // Add show completed orders filter
            queryString += `&showCompletedOrders=${currentFilters.showCompletedOrders}`;

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


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            fetchOrders(1, value, filters);
            setCurrentPage(1);
        }, 500);

        setSearchTimeout(timeout);
    };

    const handleFilterChange = (name: string, value: string | number | number[] | boolean) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
    };

    const applyFilters = () => {
        fetchOrders(1, searchTerm, filters);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        const defaultFilters = {
            referralCode: '',
            minPrice: 0,
            maxPrice: 1000,
            showCancelledOrders: false,
            showCompletedOrders: false // Reset new filter state
        };
        setFilters(defaultFilters);
        fetchOrders(1, searchTerm, defaultFilters);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchOrders(page, searchTerm, filters);
    };

    const handleDownloadReceipt = async (receiptUrl: string) => {
        if (!receiptUrl) {
            toast.error('Receipt not available');
            return;
        }

        try {
            toast.loading('Preparing download...');

            // Fetch the image first to get it as a blob
            const response = await fetch(receiptUrl, {
                mode: 'cors', // Ensure CORS is enabled
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }

            // Convert the response to a blob
            const blob = await response.blob();

            // Create a local object URL from the blob
            const blobUrl = URL.createObjectURL(blob);

            // Determine file extension
            let fileExtension = '.png';
            if (receiptUrl.includes('.')) {
                const urlParts = receiptUrl.split('.');
                const extension = urlParts[urlParts.length - 1].toLowerCase();

                // Check for valid image extensions
                if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
                    fileExtension = `.${extension}`;
                }
            }

            // Create filename
            const filename = `receipt_${new Date().getTime()}${fileExtension}`;

            // Create download link
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.style.display = 'none';

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
                toast.dismiss();
                toast.success('Receipt downloaded successfully');
            }, 100);
        } catch (error) {
            toast.dismiss();
            console.error('Error downloading receipt:', error);
            toast.error('Failed to download receipt. Please try again.');
        }
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
                                {(filters.referralCode || filters.minPrice > 0 || filters.maxPrice < 1000 || filters.showCancelledOrders) && (
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
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="showCancelledOrders" className="text-sm text-gray-400">Show Cancelled Orders</Label>
                                        <Switch
                                            id="showCancelledOrders"
                                            checked={filters.showCancelledOrders}
                                            onCheckedChange={(checked) => handleFilterChange('showCancelledOrders', checked)}
                                        />
                                    </div>
                                </div>

                                {/* Add Show Completed Orders Filter */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="showCompletedOrders" className="text-sm text-gray-400">Show Completed Orders</Label>
                                        <Switch
                                            id="showCompletedOrders"
                                            checked={filters.showCompletedOrders}
                                            onCheckedChange={(checked) => handleFilterChange('showCompletedOrders', checked)}
                                        />
                                    </div>
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
                                    <TableHead className="text-gray-400">Buyer</TableHead>
                                    <TableHead className="text-gray-400">Transaction ID</TableHead>
                                    <TableHead className="text-gray-400">Product ID</TableHead>
                                    <TableHead className="text-gray-400">Quantity</TableHead>

                                    <TableHead className="text-gray-400">Commission</TableHead>
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
                                        <TableCell className="text-green-400">
                                            <div className='flex align-center gap-2'>
                                                {order.deliveryRequested && (
                                                    <DeliveryDetailsSheet
                                                        orderId={order.id}
                                                        deliveryStatus={order.deliveryStatus}
                                                        deliveryDate={order.deliveryDate}
                                                        deliveryAddress={order.deliveryAddress}
                                                        deliveryContactPhone={order.deliveryContactPhone}
                                                        onStatusUpdate={() => fetchOrders(currentPage, searchTerm, filters)}
                                                    />
                                                )}
                                                <span
                                                    className="text-white"> {order.buyer}</span>

                                            </div>
                                        </TableCell>
                                        <TableCell className="text-white">{order.transactionId}</TableCell>
                                        <TableCell className="text-white">{order.productId}</TableCell>
                                        <TableCell className="text-white">{order.quantity}</TableCell>

                                        <TableCell className="text-white">{order.commission}</TableCell>
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