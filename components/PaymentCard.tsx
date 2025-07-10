"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import PurchaseConfirmationDialog from "@/components/PurchaseConfirmationDialog";
import PurchaseSuccessDialog from "@/components/PurchaseSuccessDialog";
import PaymentMethodSelectionDialog from "@/components/PaymentMethodSelectionDialog"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext"

type PaymentMethod = {
    id: number;
    accountTitle: string;
    accountNumber: string;
    bankName: string;
    logoUrl: string;
    isDefault: boolean;
}
type PaymentCardProps = {
    id: string | undefined;
    productName: string | undefined;
    price: number | undefined;

}

function PaymentCard({ id, productName, price }: PaymentCardProps) {
    const { isAuthenticated, user, refetchUser } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [TotalPrice, setTotalPrice] = useState();

    const [buyer, setBuyer] = useState("");
    const [paymentDetails, setPaymentDetails] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            try {
                const response = await fetch('/api/payment-method');
                const data = await response.json();

                if (data.success && Array.isArray(data.paymentMethods)) {
                    setPaymentDetails(data.paymentMethods);
                } else {
                    console.error('API response missing or invalid paymentMethods array:', data);
                    setPaymentDetails([]); // Set to empty array on error or invalid data
                }
            } catch (error) {
                console.error('Error fetching payment methods:', error);
            }
        };

        fetchPaymentDetails();
    }, []);


    const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
    const [selectedPaymentType, setSelectedPaymentType] = useState<'regular' | 'earnings'>('regular');

    const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            toast.warning("Please login to continue!");
            return;
        }
        if (referralCode) {
            try {
                const response = await fetch('/api/referrel-check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ referralCode, productId: id }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.message);
                    return;
                }

                if (data.success) {
                    setShowPaymentMethodDialog(true);
                }
            } catch (error) {
                toast.error('Failed to check referral code. Please try again.');
            }
        } else {
            setShowPaymentMethodDialog(true);
        }
    };

    const handleSellNow = async () => {
        setIsButtonDisabled(true);
        if (!isAuthenticated) {
            toast.warning("Please login to continue!");
            return;
        }

        if (!id) {
            toast.error("Product ID is missing.");
            return;
        }

        let toastID = toast.loading("Processing sell order...");

        try {
            const response = await fetch('/api/sell-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: id,
                    quantity: quantity,
                }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Failed to sell product.');
            } else {
                toast.success(data.message || 'Product sold successfully!');
                refetchUser();
            }
        } catch (error) {
            toast.error('Failed to sell product. Please try again.');
        } finally {
            toast.dismiss(toastID);
            setIsButtonDisabled(false);
        }
    };

    const handleSelectPaymentMethod = (method: 'regular' | 'earnings') => {
        setSelectedPaymentType(method);
        setShowPaymentMethodDialog(false);
        setShowConfirmDialog(true);
    };

    const handlePurchaseConfirm = async (receiptFile?: File, paymentType?: 'regular' | 'earnings') => {
        const isEarningsPayment = paymentType === 'earnings';

        if (!isEarningsPayment && !receiptFile) {
            toast.error("Please upload a receipt image");
            return;
        }

        let toastID = toast.loading("Placing order...");

        try {
            if (isEarningsPayment) {

                const response = await fetch('/api/orders/buy-with-earnings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId: id,
                        quantity: quantity
                    }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.message || 'Failed to create order');
                } else {
                    setTransactionId(data.order?.transactionId || '');
                    setTotalPrice(data.order?.totalPrice);
                    setBuyer(user?.name || '');
                    setShowConfirmDialog(false);
                    setShowSuccessDialog(true);
                    toast.success("Order placed successfully using your earnings!");
                    refetchUser();
                }
            } else {
                // Regular payment with receipt upload
                const formData = new FormData();
                formData.append('receipt', receiptFile!);
                formData.append('productId', id || '');
                formData.append('productName', productName || '');
                formData.append('quantity', quantity.toString());
                formData.append('price', (price || 0).toString());
                formData.append('referralCode', referralCode || '');

                const response = await fetch('/api/orders', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });

                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.message || 'Failed to create order');
                } else {
                    setTransactionId(data.transactionId);
                    setTotalPrice(data.totalPrice);
                    setBuyer(data.buyer);
                    setShowConfirmDialog(false);
                    setShowSuccessDialog(true);
                    toast.success("Order placed successfully!");
                }
            }
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Failed to create order. Please try again.');
        } finally {
            toast.dismiss(toastID);
        }
    };

    return (
        <>
            <div className="w-full md:max-w-sm">
                <Card className="rounded-xl p-4 sm:p-6 bg-[#271843] border-none text-white">
                    <h3 className="font-bold text-base sm:text-lg mb-2">Buy/Sell</h3>

                    <div className="mb-4 sm:mb-6">
                        {paymentDetails.length > 0 && (
                            <div className="text-gray-300 mb-2 font-medium text-sm sm:text-base">
                                Choose Payment Method
                            </div>
                        )}
                        <div className="flex gap-2 mb-4">

                            {Array.isArray(paymentDetails) && paymentDetails.map((detail, index) => (
                                <button
                                    key={detail.id || index}
                                    onClick={() => setPaymentMethod(detail.bankName)}
                                    className={`rounded-lg border px-3 py-2 bg-[#ffffff] ${paymentMethod === detail.bankName ? "border-blue-500" : "border-transparent opacity-60"
                                        }`}
                                >
                                    <Image src={detail.logoUrl} alt={detail.bankName} width={32} height={32} />
                                </button>
                            ))}

                        </div>
                        {/* Account details */}
                        {paymentMethod &&
                            (() => {
                                const selectedDetail = paymentDetails.find(detail => detail.bankName === paymentMethod);
                                if (!selectedDetail) return null;

                                return (
                                    <div
                                        className={`mt-4 overflow-hidden origin-top ${paymentMethod ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                                    >
                                        <div className="p-4 bg-[#2b194b] border border-[#47396d] rounded-lg text-white space-y-2">
                                            <h5 className="text-sm font-semibold text-amber-300 uppercase tracking-wide">
                                                {selectedDetail.bankName}
                                            </h5>
                                            <div className="text-sm">
                                                <span className="font-medium">Account Name:</span> {selectedDetail.accountTitle}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">Account Number:</span> {selectedDetail.accountNumber}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        }
                        <div className="mt-7">
                            <label className="block text-sm mb-1">Enter Referral Code</label>
                            <Input
                                value={referralCode}
                                onChange={e => setReferralCode(e.target.value)}
                                placeholder="Reffrel Code"
                                className="mb-2 bg-[#220f3c] border-[#47396d] text-white placeholder:text-gray-400"
                            />
                        </div>
                        <div className="mt-3">
                            <span className="block text-sm mb-1">Quantity</span>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="bg-[#15093a] border-[#47396d] text-white"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Minus />
                                </Button>
                                <span className="px-4 text-lg">{quantity}</span>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="bg-[#15093a] border-[#47396d] text-white"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus />
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap">

                            <Button
                                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg py-2"
                                onClick={handleBuyNow}
                                disabled={isButtonDisabled}
                            >
                                Buy Now
                            </Button>
                            <Button
                                className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-base rounded-lg py-2"
                                onClick={handleSellNow}
                                disabled={isButtonDisabled}
                            >
                                Sell Now
                            </Button>
                        </div>
                    </div>
                    <div className="mt-8">
                        <div className="rounded-xl bg-gradient-to-r from-[#431d9e] to-[#2e70b7] p-4 flex flex-col items-center mb-2">
                            <span className="text-white text-lg font-semibold mb-1">Share and win bonus</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="secondary" className="mt-0 bg-white text-[#5215b8] hover:text-white font-bold rounded-xl">Refer Now</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 bg-[#271843] border-[#47396d] text-white">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-lg">Share & Earn!</h4>
                                        <p className="text-sm text-gray-300">Your referral code is your registered mobile number. Share it with friends and earn commission on their purchases!</p>
                                        <div className="p-3 bg-[#2b194b] rounded-lg">
                                            <p className="text-sm text-amber-300">How it works:</p>
                                            <ul className="mt-2 space-y-2 text-sm text-gray-300">
                                                <li>• Share your mobile number as referral code</li>
                                                <li>• Friends use it during purchase</li>
                                                <li>• You earn commission on successful orders</li>
                                            </ul>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </Card>
            </div>

            <PaymentMethodSelectionDialog
                isOpen={showPaymentMethodDialog}
                onClose={() => setShowPaymentMethodDialog(false)}
                onSelectMethod={handleSelectPaymentMethod}
                totalPrice={(price ?? 0) * (quantity ?? 0)}
            />

            <PurchaseConfirmationDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handlePurchaseConfirm}
                productId={id}
                productName={productName}
                referralCode={referralCode}
                quantity={quantity}
                price={price}
                paymentType={selectedPaymentType}
            />

            <PurchaseSuccessDialog
                isOpen={showSuccessDialog}
                onClose={() => setShowSuccessDialog(false)}
                buyer={buyer}
                productId={id}
                productName={productName}
                quantity={quantity}
                referralCode={referralCode}
                TotalPrice={(price ?? 0) * (quantity ?? 0)}
                transactionId={transactionId}
                paymentType={selectedPaymentType}
            />
        </>
    )
}

export default PaymentCard