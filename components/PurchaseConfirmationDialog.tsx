"use client";

import React, { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface PurchaseConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (receiptFile?: File) => void;
    productId: string | undefined;
    productName: string | undefined;
    referralCode: string | undefined;
    productCode: string | undefined;
    quantity: number | undefined;
    price: number | undefined;
}

const PurchaseConfirmationDialog: React.FC<PurchaseConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    productId,
    productName,
    referralCode,
    productCode,
    quantity,
    price,
}) => {
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const totalPrice = (price ?? 0) * (quantity ?? 0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError(null);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file size (max 1MB)
            if (file.size > 1024 * 1024) {
                setFileError("File size must be less than 1MB");
                return;
            }

            // Validate file type (only JPEG and PNG)
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                setFileError("Only JPEG and PNG formats are supported");
                return;
            }

            setReceiptFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            e.target.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setFileError(null);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];

            // Validate file size (max 1MB)
            if (file.size > 1024 * 1024) {
                setFileError("File size must be less than 1MB");
                return;
            }

            // Validate file type (only JPEG and PNG)
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                setFileError("Only JPEG and PNG formats are supported");
                return;
            }

            setReceiptFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const handleConfirm = () => {
        if (!receiptFile) {
            toast.error("Please upload a receipt image");
            return;
        }
        onConfirm(receiptFile);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#1A0B2E] text-white border-none">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Confirmation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span>Product ID</span>
                        <span className="text-right text-xs sm:text-sm md:text-base truncate max-w-[150px] sm:max-w-[200px] md:max-w-none" title={productId || ""}>{productId}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span>Product Name</span>
                        <span className="text-right text-xs sm:text-sm md:text-base truncate max-w-[150px] sm:max-w-[200px] md:max-w-none" title={productName || ""}>{productName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Quantity</span>
                        <span className="text-right text-xs sm:text-sm md:text-base">{quantity}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span>Referral Code</span>
                        <span className="text-right text-xs sm:text-sm md:text-base truncate max-w-[150px] sm:max-w-[200px] md:max-w-none" title={referralCode || ""}>{referralCode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Total Price</span>
                        <span className="text-right text-xs sm:text-sm md:text-base">${totalPrice.toFixed(2)}</span>
                    </div>

                    <input
                        type="file"
                        hidden
                        accept="image/png, image/jpeg"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                    />
                    <div
                        className={`border border-dashed ${previewUrl ? 'border-green-500' : 'border-gray-600'} rounded-lg p-6 text-center cursor-pointer transition-colors`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={openFileDialog}
                    >
                        {previewUrl ? (
                            <div className="flex flex-col items-center">
                                <div className="relative w-full h-32 mb-2">
                                    <Image
                                        src={previewUrl}
                                        alt="Receipt preview"
                                        fill
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                                <div className="text-sm text-green-500 flex items-center gap-1">
                                    <Check size={16} />
                                    <span>{receiptFile?.name}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="mb-2 flex items-center gap-2">
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                    <span>Drag and drop or click to upload receipt image</span>
                                </div>
                                <div className="text-sm text-gray-400">JPEG, PNG formats supported (max 1MB)</div>
                            </div>
                        )}
                        {fileError && (
                            <div className="mt-2 text-sm text-red-500">{fileError}</div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleConfirm}
                            disabled={!receiptFile}
                        >
                            Confirm
                        </Button>
                        <Button
                            className="flex-1 bg-transparent border border-gray-600 hover:bg-gray-800 text-white"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PurchaseConfirmationDialog;