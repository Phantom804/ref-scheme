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
            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: "#1A0B2E",
                useCORS: true,
                scale: 2, // Higher resolution
                logging: false,
                removeContainer: true,
                // Avoid using CSS color functions that might not be supported
                onclone: (document) => {
                    const elements = document.querySelectorAll('*');
                    elements.forEach(el => {
                        // Use type assertion to access style property
                        const htmlElement = el as HTMLElement;
                        if (htmlElement.style.backgroundColor && htmlElement.style.backgroundColor.includes('oklch')) {
                            htmlElement.style.backgroundColor = '#1A0B2E';
                        }
                        if (htmlElement.style.color && htmlElement.style.color.includes('oklch')) {
                            htmlElement.style.color = '#FFFFFF';
                        }
                    });
                    return document;
                }
            });
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
            <DialogContent className="sm:max-w-md bg-[#1A0B2E] text-white border-none p-3 sm:p-6">
                <div ref={receiptRef} className="bg-[#1A0B2E] text-white p-2 sm:p-4 rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl font-semibold">Success</DialogTitle>
                    </DialogHeader>
                    <div className="text-center space-y-3 sm:space-y-4">
                        <div className="flex justify-center">
                            <div className="bg-green-500/20 p-3 sm:p-4 rounded-full">
                                <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                            </div>
                        </div>
                        <h2 className="text-base sm:text-xl font-semibold px-1">
                            We've received your request. We will confirm your details in 24 hrs.
                        </h2>

                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-sm sm:text-base font-medium">Product ID</span>
                                <span className="text-xs sm:text-sm md:text-base truncate max-w-[150px] sm:max-w-[200px] md:max-w-none" title={productId || ""}>{productId}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-sm sm:text-base font-medium">Buyer</span>
                                <span className="text-xs sm:text-sm md:text-base truncate max-w-[150px] sm:max-w-[200px] md:max-w-none" title={buyer || ""}>{buyer}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-sm sm:text-base font-medium">Transaction ID</span>
                                <span className="text-xs sm:text-sm md:text-base truncate max-w-[150px] sm:max-w-[200px] md:max-w-none" title={transactionId || ""}>{transactionId}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-sm sm:text-base font-medium">Product Name</span>
                                <span className="text-xs sm:text-sm md:text-base truncate max-w-[150px] sm:max-w-[200px] md:max-w-none" title={productName || ""}>{productName}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-sm sm:text-base font-medium">Quantity</span>
                                <span className="text-xs sm:text-sm md:text-base">{quantity}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-sm sm:text-base font-medium">Bought On</span>
                                <span className="text-xs sm:text-sm md:text-base">{currentDate}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-sm sm:text-base font-medium">Total Price</span>
                                <span className="text-xs sm:text-sm md:text-base">${(ToalPrice ?? 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4 sm:mt-6">
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2 h-auto sm:h-10"
                                onClick={handleDownloadReceipt}
                            >
                                Download Receipt
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PurchaseSuccessDialog;
