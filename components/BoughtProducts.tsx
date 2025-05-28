"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';



interface Product {
    id: string;
    productName: string;
    transactionId: string;
    quantity: number;
    productReferralLimit: number,
    referralUsageCount: number;
    referralCode: string;
    price: string;
    boughtOn: string;
    status: "Pending" | "Completed" | "Cancelled";
}

interface OrdersResponse {
    orders: Product[];
    totalPages: number;
    currentPage: number;
    totalOrders: number;
}

function BoughtProducts() {
    const { user } = useAuth();
    const [userData, setuserData] = useState(user);
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (user) {
            setuserData(user);
        }
    }, [user]);


    // Fetch user's orders
    const fetchOrders = async (page = currentPage) => {
        if (!userData) {
            return
        }
        try {
            setLoading(true);

            const response = await fetch(`/api/orders?page=${page}&limit=10&userId=${user?.id}&referralCode=${user?.referralCode}`);

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data: OrdersResponse = await response.json();
            setProducts(data.orders);
            setTotalPages(data.totalPages);
            setTotalOrders(data.totalOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchOrders(page);
    };

    // Initial data fetch
    useEffect(() => {
        fetchOrders();
    }, []);
    return (
        <div className="bg-[#1A1F2C] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">

                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        <span className="ml-2 text-gray-400">Loading orders...</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400">No orders found</p>
                    </div>
                ) : (
                    <Table className="min-w-[800px] sm:min-w-full">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-[#2A2F3E]">
                                <TableHead className="text-gray-400">Product</TableHead>
                                <TableHead className="text-gray-400">Transaction ID</TableHead>
                                <TableHead className="text-gray-400">Referral Limit</TableHead>
                                <TableHead className="text-gray-400">Quantity</TableHead>
                                <TableHead className="text-gray-400">Referral Code</TableHead>
                                <TableHead className="text-gray-400">Price</TableHead>
                                <TableHead className="text-gray-400">Bought On</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id} className="hover:bg-[#1F2937]/5 border-b border-[#2A2F3E]">
                                    <TableCell>

                                        {product.productName}
                                    </TableCell>
                                    <TableCell>{product.transactionId}</TableCell>
                                    <TableCell>{product.referralUsageCount}/{product.productReferralLimit}</TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell>{product.referralCode}</TableCell>
                                    <TableCell className="text-[#3B82F6]">{product.price}</TableCell>
                                    <TableCell>{product.boughtOn}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            product.status.toLowerCase() === "cancelled"
                                                ? "destructive"
                                                : product.status.toLowerCase() === "pending"
                                                    ? "default"
                                                    : "secondary"
                                        } className=''>{product.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalOrders}
                    onPageChange={handlePageChange}
                    loading={loading}
                />
            </div>
        </div>
    )
}

export default BoughtProducts;