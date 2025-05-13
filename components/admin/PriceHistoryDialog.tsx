"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PriceHistoryItem {
    _id: string;
    productId: string;
    price: number;
    date: string;
}

interface PriceHistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
}

const PriceHistoryDialog = ({ isOpen, onClose, productId }: PriceHistoryDialogProps) => {
    const [mode, setMode] = useState<'view' | 'add'>('view');
    const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
    const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && productId) {
            fetchPriceHistory();
        }
    }, [isOpen, productId]);

    const fetchPriceHistory = async () => {
        if (!productId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/admin/price-history?productId=${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch price history');
            }
            const data = await response.json();
            setPriceHistory(data);

            // Set default selection to the most recent price history if available
            if (data.length > 0) {
                setSelectedHistoryId(data[0]._id);
                setPrice(data[0].price.toString());
                setDate(new Date(data[0].date));
            }
        } catch (error) {
            console.error('Error fetching price history:', error);
            toast.error('Failed to load price history');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (value: string) => {
        setSelectedHistoryId(value);
        const selected = priceHistory.find(item => item._id === value);
        if (selected) {
            setPrice(selected.price.toString());
            setDate(new Date(selected.date));
        }
    };

    const handleSubmit = async () => {
        if (!price || !date) {
            toast.error('Please provide both price and date');
            return;
        }

        setSubmitting(true);
        try {
            if (mode === 'add') {
                // Create new price history entry
                const response = await fetch('/api/admin/price-history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId,
                        price: parseFloat(price),
                        date: date.toISOString(),
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to add price history');
                }

                toast.success('Price history added successfully');
            } else {
                // Update existing price history entry
                const response = await fetch('/api/admin/price-history', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: selectedHistoryId,
                        price: parseFloat(price),
                        date: date.toISOString(),
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update price history');
                }

                toast.success('Price history updated successfully');
            }

            // Refresh price history data
            await fetchPriceHistory();
        } catch (error) {
            console.error('Error saving price history:', error);
            toast.error('Failed to save price history');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        if (mode === 'add') {
            setPrice('');
            setDate(new Date());
        } else if (priceHistory.length > 0) {
            handleSelectChange(priceHistory[0]._id);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'view' ? 'add' : 'view');
        resetForm();
    };

    // Ensure body pointer-events are restored when dialog closes
    useEffect(() => {
        // When dialog opens, the body gets pointer-events: none from Radix UI
        // We need to clean this up when our component unmounts
        return () => {
            document.body.style.removeProperty('pointer-events');
        };
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                // Ensure pointer-events are restored when dialog closes
                document.body.style.pointerEvents = '';
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
                <DialogHeader>
                    <DialogTitle className='text-white'>{mode === 'view' ? 'Price History' : 'Add Price History'}</DialogTitle>
                </DialogHeader>

                <div className="flex justify-between items-center mb-4">
                    <Button
                        variant="outline"
                        onClick={toggleMode}
                        size="sm"
                    >
                        {mode === 'view' ? 'Add New Price' : 'View History'}
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                        <span className="ml-2">Loading price history...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mode === 'view' && priceHistory.length > 0 && (
                            <div className="space-y-2">
                                <label htmlFor="history-select" className="text-sm font-medium text-white">
                                    Select Date
                                </label>
                                <Select value={selectedHistoryId} onValueChange={handleSelectChange}>
                                    <SelectTrigger className='text-white'>
                                        <SelectValue placeholder="Select a date " />
                                    </SelectTrigger>
                                    <SelectContent className='text-white'>
                                        {priceHistory.map((item) => (
                                            <SelectItem className='text-white' key={item._id} value={item._id}>
                                                {format(new Date(item.date), 'PPP')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {mode === 'add' && (
                            <div className="space-y-2">
                                <label htmlFor="date-picker" className="text-sm font-medium text-white">
                                    Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}

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

                        {mode === 'view' && priceHistory.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                No price history available for this product.
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || !price || !date}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            mode === 'add' ? 'Add' : 'Update'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PriceHistoryDialog;