"use client";

import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import html2canvas from "html2canvas";

interface PurchaseSuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productId?: string;
    buyer?: string;
    productName?: string;
    quantity?: number;
    ToalPrice?: number;
    transactionId?: string;
}

const PurchaseSuccessDialog: React.FC<PurchaseSuccessDialogProps> = ({
    isOpen,
    onClose,
    productId,
    buyer,
    productName,
    quantity,
    ToalPrice,
    transactionId = "",
}) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const receiptRef = useRef<HTMLDivElement>(null);

    const handleDownloadReceipt = async () => {
        if (receiptRef.current) {
            const canvas = await html2canvas(receiptRef.current);
            const image = canvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.href = image;
            link.download = `receipt_${new Date().getTime()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#1A0B2E] text-white border-none" ref={receiptRef}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Success</DialogTitle>
                </DialogHeader>
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="bg-green-500/20 p-4 rounded-full">
                            <Check className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold">
                        We've received your request. We will confirm your details in 24 hrs.
                    </h2>

                    <div className="space-y-4 mt-6">
                        <div className="flex justify-between items-center">
                            <span>Product ID</span>
                            <span>{productId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Buyer</span>
                            <span>{buyer}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Transaction ID</span>
                            <span>{transactionId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Product Name</span>
                            <span>{productName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Quantity</span>
                            <span>{quantity}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Bought On</span>
                            <span>{currentDate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Total Price</span>
                            <span>${(ToalPrice ?? 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleDownloadReceipt}
                        >
                            Download Receipt
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PurchaseSuccessDialog;
