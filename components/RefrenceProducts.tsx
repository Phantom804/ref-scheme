"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import Pagination from '@/components/Pagination';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAuth } from "@/contexts/AuthContext";



interface ReferralProduct {
    id: string;
    name: string;
    transactionId: string;
    quantity: number;
    price: string;
    commission: string;
    boughtOn: string;
    boughtBy: string;
    status: "Pending" | "Completed" | "Cancelled";
}

interface OrdersResponse {
    orders: ReferralProduct[];
    totalPages: number;
    currentPage: number;
    totalOrders: number;
}

export default function RefrenceProducts() {
    const { user } = useAuth();
    const [userID, setUserID] = useState(user?.id);
    const [products, setProducts] = useState<ReferralProduct[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (user) {
            setUserID(user.id);
        }
    }, [user]);
    const ReferralCode = user?.referralCode;
    // Fetch orders made with user's referral code
    const fetchReferralOrders = async (page = currentPage) => {
        try {
            setLoading(true);


            const response = await fetch(`/api/orders?page=${page}&limit=10&userId=${userID}&referralCode=${ReferralCode}&orderType=reference`);

            if (!response.ok) {
                throw new Error('Failed to fetch referral orders');
            }

            const data: OrdersResponse = await response.json();
            setProducts(data.orders);
            setTotalPages(data.totalPages);
            setTotalOrders(data.totalOrders);
        } catch (error) {
            console.error('Error fetching referral orders:', error);
            toast.error('Failed to load referral orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchReferralOrders(page);
    };

    // Initial data fetch
    useEffect(() => {
        fetchReferralOrders();
    }, []);

    return (
        <div className="bg-[#1A1F2C] rounded-lg overflow-hidden">
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-2 text-gray-400">Loading referral orders...</span>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-400">No referral orders found</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-[#2A2F3E]">
                            <TableHead className="text-gray-400">Name</TableHead>
                            <TableHead className="text-gray-400">Transaction ID</TableHead>
                            <TableHead className="text-gray-400">Product ID</TableHead>
                            <TableHead className="text-gray-400">Quantity</TableHead>
                            <TableHead className="text-gray-400">Price</TableHead>
                            <TableHead className="text-gray-400">Commission</TableHead>
                            <TableHead className="text-gray-400">Bought On</TableHead>
                            <TableHead className="text-gray-400">Bought By</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id} className="hover:bg-[#1F2937]/5 border-b border-[#2A2F3E]">
                                <TableCell className="font-medium flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
                                        <span className="text-white">$</span>
                                    </div>
                                    {product.name}
                                </TableCell>
                                <TableCell>{product.transactionId}</TableCell>
                                <TableCell>{product.id}</TableCell>
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell className="text-[#3B82F6]">{product.price}</TableCell>
                                <TableCell className="text-[#4ADE80]">{product.commission}</TableCell>
                                <TableCell>{product.boughtOn}</TableCell>
                                <TableCell>{product.boughtBy}</TableCell>
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
    )
}
