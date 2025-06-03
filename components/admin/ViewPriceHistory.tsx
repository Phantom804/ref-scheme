import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { PriceHistoryItem } from './Types/PriceHistoryTypes';

interface ViewPriceHistoryProps {
    priceHistory: PriceHistoryItem[];
    selectedHistoryId: string;
    price: string;
    submitting: boolean;
    handleSelectChange: (value: string) => void;
    handleDelete: () => void;
    setPrice: (price: string) => void;
}

const ViewPriceHistory = ({
    priceHistory,
    selectedHistoryId,
    price,
    submitting,
    handleSelectChange,
    handleDelete,
    setPrice
}: ViewPriceHistoryProps) => {
    return (
        <div className="space-y-4">
            {priceHistory.length > 0 ? (
                <>
                    <div className="space-y-2">
                        <label htmlFor="history-select" className="text-sm font-medium text-white">
                            Select Date
                        </label>
                        <div className="flex gap-2">
                            <Select value={selectedHistoryId} onValueChange={handleSelectChange}>
                                <SelectTrigger className='text-white'>
                                    <SelectValue placeholder="Select a date " />
                                </SelectTrigger>
                                <SelectContent className='text-white'>
                                    {priceHistory.map((item) => {
                                        const itemDate = new Date(item.date);
                                        const formattedDateTime = format(itemDate, 'PPP') + ' ' +
                                            itemDate.getHours().toString().padStart(2, '0') + ':' +
                                            itemDate.getMinutes().toString().padStart(2, '0');
                                        return (
                                            <SelectItem className='text-white' key={item._id} value={item._id}>
                                                {formattedDateTime}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDelete}
                                disabled={!selectedHistoryId || submitting}
                                className="bg-white"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="price-input" className="text-sm font-medium text-white">
                            Price
                        </label>
                        <Input className='text-white'
                            id="price-input"
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Enter price"
                        />
                    </div>
                </>
            ) : (
                <div className="text-center py-4 text-gray-500">
                    No price history available for this product.
                </div>
            )}
        </div>
    );
};

export default ViewPriceHistory;