"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Truck } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import DeliveryRequestDialog from './DeliveryRequestDialog';



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
    deliveryRequested: boolean;
    deliveryStatus: 'Pending' | 'In Transit' | 'Delivered';
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
    const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Product | null>(null);


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
            console.error('Error fetching orders:');
        } finally {
            setLoading(false);
        }
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchOrders(page);
    };

    // Handle delivery request
    const handleDeliveryRequest = (order: Product) => {
        setSelectedOrder(order);
        setIsDeliveryDialogOpen(true);
    };

    // Submit delivery request
    const handleDeliverySubmit = async (deliveryDetails: any) => {
        try {
            setLoading(true);
            const response = await fetch('/api/orders/delivery', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: selectedOrder?.id,
                    deliveryDetails
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Delivery request submitted successfully');
                setIsDeliveryDialogOpen(false);
                // Update the product in the list
                setProducts(products.map(product =>
                    product.id === selectedOrder?.id
                        ? { ...product, deliveryRequested: true, deliveryStatus: 'Pending' }
                        : product
                ));
            } else {
                toast.error(data.message || 'Failed to submit delivery request');
            }
        } catch (error) {
            toast.error('An error occurred while submitting your delivery request');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchOrders();
    }, []);
    return (
        <div className="bg-[#1A1F2C] rounded-lg overflow-hidden">

            {selectedOrder && (
                <DeliveryRequestDialog
                    open={isDeliveryDialogOpen}
                    onOpenChange={setIsDeliveryDialogOpen}
                    onSubmit={handleDeliverySubmit}
                    loading={loading}
                    order={selectedOrder}
                />
            )}
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
                                <TableHead className="text-gray-400">Delivery</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id} className="hover:bg-[#1F2937]/5 border-b border-[#2A2F3E]">
                                    <TableCell>
                                        {product.productName}
                                    </TableCell>

                                    <TableCell>{product.transactionId}</TableCell>
                                    <TableCell>{product.referralUsageCount}/{product.productReferralLimit} <span> {product.referralUsageCount == product.productReferralLimit && (
                                        <TableCell className="text-red-500 text-xs">Referral Limit Reached</TableCell>
                                    )}</span></TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell>{product.referralCode || '-'}</TableCell>
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
                                    <TableCell>
                                        {product.status === "Completed" ? (
                                            product.deliveryRequested ? (
                                                <Badge variant={
                                                    product.deliveryStatus === "Delivered"
                                                        ? "secondary"
                                                        : product.deliveryStatus === "In Transit"
                                                            ? "default"
                                                            : "default"
                                                } className="flex items-center gap-1">
                                                    <Truck className="h-3 w-3" />
                                                    {product.deliveryStatus}
                                                </Badge>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-1 text-xs"
                                                    onClick={() => handleDeliveryRequest(product)}
                                                >
                                                    <Truck className="h-3 w-3" />
                                                    Request Delivery
                                                </Button>
                                            )
                                        ) : (
                                            <span className="text-gray-500 text-xs">Not available until order is completed</span>
                                        )}
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