"use client";

import React, { useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PurchaseSuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productId?: string;
    buyer?: string;
    productName?: string;
    referralCode?: string;
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
    referralCode,
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
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Handle download receipt using Canvas
    const handleDownloadReceipt = () => {
        try {
            if (!receiptRef.current) return;

            // Create canvas with appropriate dimensions
            const receiptElement = receiptRef.current;
            const width = receiptElement.offsetWidth;
            const height = receiptElement.offsetHeight;

            // Set up canvas with 2x resolution for better quality
            const canvas = document.createElement('canvas');
            const scale = 2;
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error("Could not get canvas context");
            }

            // Scale everything for higher resolution
            ctx.scale(scale, scale);

            // Set background
            ctx.fillStyle = "#1A0B2E";
            ctx.fillRect(0, 0, width, height);

            // Draw the check mark
            const checkmarkX = width / 2;
            const checkmarkY = 80;
            ctx.beginPath();
            ctx.arc(checkmarkX, checkmarkY, 30, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
            ctx.fill();

            // Draw checkmark
            ctx.beginPath();
            ctx.moveTo(checkmarkX - 10, checkmarkY);
            ctx.lineTo(checkmarkX - 2, checkmarkY + 8);
            ctx.lineTo(checkmarkX + 10, checkmarkY - 8);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#22C55E";
            ctx.stroke();

            // Draw title
            ctx.font = "bold 18px Arial";
            ctx.fillStyle = "#FFFFFF";
            ctx.textAlign = "center";
            ctx.fillText("Success", width / 2, 30);

            // Draw confirmation message
            ctx.font = "bold 14px Arial";
            ctx.fillStyle = "#FFFFFF";
            ctx.textAlign = "center";
            const message = "We've received your request. We will confirm your details in 24 hrs.";
            const maxWidth = width - 40;
            wrapText(ctx, message, width / 2, checkmarkY + 50, maxWidth, 20);

            // Draw receipt details
            const startY = checkmarkY + 150;
            const padding = 20;
            const lineHeight = 30;

            // Helper function to draw a row
            const drawRow = (label: string, value: string, y: number) => {
                ctx.font = "14px Arial";
                ctx.fillStyle = "#FFFFFF";
                ctx.textAlign = "left";
                ctx.fillText(label, padding, y);

                ctx.textAlign = "right";
                ctx.fillText(value, width - padding, y);
            };

            // Draw all rows
            drawRow("Product ID", productId || "", startY);
            drawRow("Buyer", buyer || "", startY + lineHeight);
            drawRow("Transaction ID", transactionId || "", startY + lineHeight * 2);
            drawRow("Product Name", productName || "", startY + lineHeight * 3);
            if (referralCode) {
                drawRow("referral Code", referralCode?.toString() || "", startY + lineHeight * 4);
            }
            drawRow("Quantity", quantity?.toString() || "", startY + lineHeight * 5);
            drawRow("Bought On", currentDate, startY + lineHeight * 6);
            drawRow("Total Price", `PKR ${(ToalPrice ?? 0)}`, startY + lineHeight * 7);

            // Convert canvas to image and download
            const dataUrl = canvas.toDataURL('image/png');
            const filename = `receipt_${transactionId || new Date().getTime()}.png`;
            downloadFile(dataUrl, filename);
        } catch (error) {
            console.error("Failed to download receipt:", error);
            alert("Failed to download receipt. Please try again.");
        }
    };

    // Helper function to wrap text
    const wrapText = (
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineHeight: number
    ) => {
        const words = text.split(' ');
        let line = '';
        let testLine = '';
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
            testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y + (lineCount * lineHeight));
                line = words[n] + ' ';
                lineCount++;
            } else {
                line = testLine;
            }
        }

        ctx.fillText(line, x, y + (lineCount * lineHeight));
    };

    // Utility function to handle downloading
    const downloadFile = (url: string, filename: string) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
            <DialogContent className="sm:max-w-md bg-[#1A0B2E] text-white border-none p-3 sm:p-6">
                {/* Visible receipt for display */}
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
                            {referralCode && (
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-sm sm:text-base font-medium">Referral Code</span>
                                    <span className="text-xs sm:text-sm md:text-base truncate max-w-[150px] sm:max-w-[200px] md:max-w-none" title={referralCode}>{referralCode}</span>
                                </div>
                            )}
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
                                <span className="text-xs sm:text-sm md:text-base">PKR {ToalPrice || 0}</span>
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