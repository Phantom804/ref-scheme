"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import PurchaseConfirmationDialog from "@/components/PurchaseConfirmationDialog";
import PurchaseSuccessDialog from "@/components/PurchaseSuccessDialog";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

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
    productCode: string | undefined;

}

function PaymentCard({ id, productName, price, productCode }: PaymentCardProps) {
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [TotalPrice, setTotalPrice] = useState();

    const [buyer, setBuyer] = useState("");
    const router = useRouter();
    const [paymentDetails, setPaymentDetails] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            try {
                const response = await fetch('/api/payment-method');
                const data = await response.json();
                console.log('API Response:', data); // Keep console log for debugging
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


    const handleBuyNow = async () => {
        if (referralCode) {
            console.log('Referral Code:', referralCode);
            try {
                const response = await fetch('/api/referrel-check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ referralCode }),
                });

                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.message || 'Invalid referral code.');
                    return;
                }

                if (data.success) {
                    setShowConfirmDialog(true);
                }
            } catch (error) {
                console.error('Error checking referral code:', error);
                toast.error('Failed to check referral code. Please try again.');
            }
        } else {
            // If no referral code is entered, proceed directly
            setShowConfirmDialog(true);
        }
    };

    const handlePurchaseConfirm = async (receiptFile?: File) => {
        if (!receiptFile) {
            toast.error("Please upload a receipt image");
            return;
        }
        let toastID = toast.loading("Placeing order...");
        setIsSubmitting(true);

        try {
            // Create form data for the file upload
            const formData = new FormData();
            formData.append('receipt', receiptFile);
            formData.append('productId', id || '');
            formData.append('productName', productName || '');
            formData.append('quantity', quantity.toString());
            formData.append('price', (price || 0).toString());
            formData.append('productCode', productCode || '');
            formData.append('referralCode', referralCode || '');

            const response = await fetch('/api/orders', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create order');
            }

            setTransactionId(data.transactionId);
            setTotalPrice(data.totalPrice);
            setBuyer(data.buyer);
            setShowConfirmDialog(false);
            setShowSuccessDialog(true);
            toast.success("Order placed successfully!");
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error(typeof error === 'string' ? error : 'Failed to create order. Please try again.');
        } finally {
            setIsSubmitting(false);
            toastID = toast.dismiss(toastID);
        }
    };

    return (
        <>
            <div className="w-full md:max-w-sm">
                <Card className="rounded-xl p-4 sm:p-6 bg-[#271843] border-none text-white">
                    <h3 className="font-bold text-base sm:text-lg mb-2">Buy Now</h3>

                    <div className="mb-4 sm:mb-6">
                        <div className="text-gray-300 mb-2 font-medium text-sm sm:text-base">Choose Payment Method</div>
                        <div className="flex gap-2 mb-4">

                            {Array.isArray(paymentDetails) && paymentDetails.map((detail, index) => (
                                <button
                                    key={detail.id || index} // Prefer using a unique ID if available
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
                                        className={`mt-4 overflow-hidden transition-all duration-500 ease-in-out origin-top ${paymentMethod ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
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
                            <label className="block text-sm mb-1">Enter Reffrel Code</label>
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
                        <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg py-2" onClick={handleBuyNow}>
                            Buy Now
                        </Button>
                    </div>
                    <div className="mt-8">
                        <div className="rounded-xl bg-gradient-to-r from-[#431d9e] to-[#2e70b7] p-4 flex flex-col items-center mb-2">
                            <span className="text-white text-lg font-semibold mb-1">Share and win bonus</span>
                            <Button variant="secondary" className="mt-0 bg-white text-[#5215b8] font-bold rounded-xl">Refer Now</Button>
                        </div>
                    </div>
                </Card>
            </div>
            <PurchaseConfirmationDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handlePurchaseConfirm}
                productId={id}
                productName={productName}
                productCode={productCode}
                referralCode={referralCode}
                quantity={quantity}
                price={price}
            />

            <PurchaseSuccessDialog
                isOpen={showSuccessDialog}
                onClose={() => setShowSuccessDialog(false)}
                buyer={buyer}
                productId={id}
                productName={productName}
                quantity={quantity}
                ToalPrice={TotalPrice}
                transactionId={transactionId}
            />
        </>
    )
}

export default PaymentCard