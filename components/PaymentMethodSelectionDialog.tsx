"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentMethodSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMethod: (method: 'regular' | 'earnings') => void;
    totalPrice: Number;
}

const PaymentMethodSelectionDialog: React.FC<PaymentMethodSelectionDialogProps> = ({
    isOpen,
    onClose,
    onSelectMethod,
    totalPrice,
}) => {
    const { user } = useAuth();
    const hasEnoughEarnings = user?.totalEarning && user.totalEarning >= totalPrice;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#1A0B2E] text-white border-none">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Choose Payment Method</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="text-center mb-4">
                        <p className="text-gray-300">How would you like to pay for this purchase?</p>
                        <p className="text-sm text-gray-400 mt-1">Total: PKR {totalPrice.toFixed(2)}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Button
                            onClick={() => onSelectMethod('regular')}
                            className="flex items-center justify-between p-4 h-auto bg-[#2D1B4E] hover:text-white hover:bg-[#3D2B5E] border border-[#47396d] text-white"
                            variant="outline"
                        >
                            <div className="flex items-center">
                                <CreditCard className="w-5 h-5 mr-3 text-blue-400" />
                                <div className="text-left">
                                    <p className="font-medium">Regular Payment</p>
                                    <p className="text-xs text-gray-400">Pay using bank transfer</p>
                                </div>
                            </div>
                        </Button>

                        <Button
                            onClick={() => onSelectMethod('earnings')}
                            className={`flex items-center justify-between p-4 h-auto border text-white ${hasEnoughEarnings
                                ? 'bg-[#2D1B4E] hover:bg-[#3D2B5E] border-[#47396d] hover:text-white'
                                : 'bg-[#2D1B4E]/50 border-[#47396d]/50 cursor-not-allowed'}`}
                            variant="outline"
                            disabled={!hasEnoughEarnings}
                        >
                            <div className="flex items-center">
                                <Wallet className="w-5 h-5 mr-3 text-green-400" />
                                <div className="text-left">
                                    <p className="font-medium">Pay with Earnings</p>
                                    <p className="text-xs text-gray-400">
                                        {hasEnoughEarnings
                                            ? `Available: PKR ${user?.totalEarning?.toFixed(2)}`
                                            : `Insufficient funds (PKR ${user?.totalEarning?.toFixed(2)})`}
                                    </p>
                                </div>
                            </div>
                        </Button>
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button
                            onClick={onClose}
                            className="bg-transparent border border-gray-600 hover:bg-gray-800 text-white"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentMethodSelectionDialog;