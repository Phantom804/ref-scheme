import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck } from "lucide-react";
import { toast } from "sonner";

interface DeliveryDetailsSheetProps {
    orderId: string;
    deliveryStatus: "Pending" | "In Transit" | "Delivered";
    deliveryDate?: string;
    deliveryAddress?: string;
    deliveryContactPhone?: string;
    onStatusUpdate: () => void;
}

export function DeliveryDetailsSheet({
    orderId,
    deliveryStatus,
    deliveryDate,
    deliveryAddress,
    deliveryContactPhone,
    onStatusUpdate
}: DeliveryDetailsSheetProps) {
    const handleDeliveryStatusChange = async (value: typeof deliveryStatus) => {
        try {
            const response = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId, deliveryStatus: value }),
            });
            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error)
            }else{
                toast.success('Delivery status updated successfully');
            onStatusUpdate();

            }

            
        } catch (error) {
            console.error('Error updating delivery status:', error);
            toast.error('Failed to update delivery status. Please try again.');
        }
    };

    const getDeliveryStatusColor = (status: typeof deliveryStatus) => {
        switch (status) {
            case 'Delivered':
                return 'bg-[#1A392C] text-[#4ADE80]';
            case 'In Transit':
                return 'bg-[#1C2F4C] text-[#3B82F6]';
            case 'Pending':
                return 'bg-[#3A341D] text-[#F5A623]';
            default:
                return '';
        }
    };

    return (
        <Sheet>
            <SheetTrigger>
                <Truck className="h-4 w-4 text-green" />
            </SheetTrigger>
            <SheetContent className="bg-[#0A0A0F] text-white">
                <SheetHeader>
                    <SheetTitle className="text-white">Delivery Details</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400">Delivery Status</h4>
                        <Select
                            value={deliveryStatus}
                            onValueChange={handleDeliveryStatusChange}
                        >
                            <SelectTrigger className={`w-[140px] ${getDeliveryStatusColor(deliveryStatus)}`}>
                                <SelectValue>{deliveryStatus}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Transit">In Transit</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {deliveryDate && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-400">Delivery Date</h4>
                            <p className="text-white">{deliveryDate}</p>
                        </div>
                    )}

                    {deliveryAddress && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-400">Delivery Address</h4>
                            <p className="text-white">{deliveryAddress}</p>
                        </div>
                    )}

                    {deliveryContactPhone && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-400">Contact Phone</h4>
                            <p className="text-white">{deliveryContactPhone}</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
