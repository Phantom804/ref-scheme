"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DeliveryRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (deliveryDetails: DeliveryDetails) => void;
    loading: boolean;
    order: {
        id: string;
        productName: string;
    };
}

interface DeliveryDetails {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    contactPhone: string;
}

const DeliveryRequestDialog: React.FC<DeliveryRequestDialogProps> = ({
    open,
    onOpenChange,
    onSubmit,
    loading,
    order,
}) => {
    const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
        address: "",
        city: "",
        state: "",
        zipCode: "",
        contactPhone: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDeliveryDetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!deliveryDetails.address || !deliveryDetails.city || !deliveryDetails.contactPhone) {
            toast.error("Please fill in all required fields");
            return;
        }

        onSubmit(deliveryDetails);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-[#1A0B2E] text-white border-none">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Request Delivery</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="productName">Product</Label>
                        <Input
                            id="productName"
                            value={order.productName}
                            disabled
                            className="mt-1 bg-[#2D1B4E] text-gray-300 border-gray-700"
                        />
                    </div>

                    <div>
                        <Label htmlFor="address" className="required">Delivery Address</Label>
                        <Input
                            id="address"
                            name="address"
                            value={deliveryDetails.address}
                            onChange={handleChange}
                            placeholder="Enter your full address"
                            className="mt-1 bg-[#2D1B4E] border-gray-700 focus:border-purple-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="city" className="required">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={deliveryDetails.city}
                                onChange={handleChange}
                                placeholder="City"
                                className="mt-1 bg-[#2D1B4E] border-gray-700 focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                                id="state"
                                name="state"
                                value={deliveryDetails.state}
                                onChange={handleChange}
                                placeholder="State/Province"
                                className="mt-1 bg-[#2D1B4E] border-gray-700 focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="zipCode">Zip/Postal Code</Label>
                            <Input
                                id="zipCode"
                                name="zipCode"
                                value={deliveryDetails.zipCode}
                                onChange={handleChange}
                                placeholder="Zip/Postal Code"
                                className="mt-1 bg-[#2D1B4E] border-gray-700 focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="contactPhone" className="required">Contact Phone</Label>
                            <Input
                                id="contactPhone"
                                name="contactPhone"
                                value={deliveryDetails.contactPhone}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                className="mt-1 bg-[#2D1B4E] border-gray-700 focus:border-purple-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Request Delivery"}
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 bg-transparent border border-gray-600 hover:bg-gray-800 text-white"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DeliveryRequestDialog;