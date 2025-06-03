"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ViewPriceHistory from './ViewPriceHistory';
import AddPriceHistory from './AddPriceHistory';
import AutomatePriceHistory from './AutomatePriceHistory';
import ViewCronJobs from './ViewCronJobs';
import { PriceHistoryItem, PriceHistoryDialogProps } from './Types/PriceHistoryTypes';

const PriceHistoryDialog = ({ isOpen, onClose, productId }: PriceHistoryDialogProps) => {
    const [mode, setMode] = useState<'view' | 'add' | 'automation' | 'cron'>('view');
    const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
    const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState<string>('12:00:00');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    // Automation state
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [startTime, setStartTime] = useState<string>('12:00:00');
    const [endTime, setEndTime] = useState<string>('12:00:00');
    const [percentage, setPercentage] = useState<string>('');

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
                const dateObj = new Date(data[0].date);
                setDate(dateObj);

                // Format time from the date object
                const hours = dateObj.getHours().toString().padStart(2, '0');
                const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                const seconds = dateObj.getSeconds().toString().padStart(2, '0');
                setTime(`${hours}:${minutes}:${seconds}`);
            }
        } catch (error) {
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
            const dateObj = new Date(selected.date);
            setDate(dateObj);

            // Format time from the date object
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            const seconds = dateObj.getSeconds().toString().padStart(2, '0');
            setTime(`${hours}:${minutes}:${seconds}`);
        }
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent the default behavior which would close the dialog
        e.preventDefault();

        setSubmitting(true);
        try {
            if (mode === 'add') {
                if (!price || !date) {
                    toast.error('Please provide both price and date');
                    setSubmitting(false);
                    return;
                }

                // Create new price history entry
                const response = await fetch('/api/admin/price-history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId,
                        price: parseFloat(price),
                        date: date.toISOString(),
                        time: time
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    toast.warning(data.message || "Failed to add price history");
                }

                if (response.ok) {
                    toast.success('Price history added successfully');
                }
            } else if (mode === 'view') {
                if (!price || !date || !selectedHistoryId) {
                    toast.error('Please select a price history entry to update');
                    setSubmitting(false);
                    return;
                }

                // Update existing price history entry
                const response = await fetch('/api/admin/price-history', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: selectedHistoryId,
                        price: parseFloat(price),
                        date: date.toISOString(),
                        time: time
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update price history');
                }

                toast.success('Price history updated successfully');
            } else if (mode === 'automation') {
                if (!startDate || !endDate || !startTime || !endTime || !percentage) {
                    toast.error('Please fill in all automation fields');
                    setSubmitting(false);
                    return;
                }

                // Create price automation
                const response = await fetch('/api/admin/price-automation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId,
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                        startTime,
                        endTime,
                        percentage
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    toast.error(data.error || 'Failed to create price automation');
                    setSubmitting(false);
                    return;
                }

                toast.success('Price automation scheduled successfully');

                // Refresh price history data and trigger cron jobs refresh
                await fetchPriceHistory();
                setRefreshTrigger(prev => prev + 1);
            }
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
            setTime('12:00:00');
        } else if (mode === 'automation') {
            // Set default values for automation
            if (priceHistory.length > 0) {
                const latestEntry = priceHistory[0];
                const latestDate = new Date(latestEntry.date);

                setStartDate(latestDate);
                setEndDate(new Date(latestDate.getTime() + 24 * 60 * 60 * 1000)); // Default to 1 day later

                const hours = latestDate.getHours().toString().padStart(2, '0');
                const minutes = latestDate.getMinutes().toString().padStart(2, '0');
                const seconds = latestDate.getSeconds().toString().padStart(2, '0');

                setStartTime(`${hours}:${minutes}:${seconds}`);
                setEndTime(`${hours}:${minutes}:${seconds}`);
                setPercentage('10'); // Default 10% increase
            } else {
                setStartDate(new Date());
                setEndDate(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
                setStartTime('12:00:00');
                setEndTime('12:00:00');
                setPercentage('10');
            }
        } else if (priceHistory.length > 0) {
            handleSelectChange(priceHistory[0]._id);
        }
    };

    const toggleMode = (newMode: 'view' | 'add' | 'automation' | 'cron') => {
        setMode(newMode);
        resetForm();
    };

    const handleDelete = async () => {
        if (!selectedHistoryId) {
            toast.error('Please select a price history entry to delete');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`/api/admin/price-history?id=${selectedHistoryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete price history');
            }

            toast.success('Price history deleted successfully');
            await fetchPriceHistory();
            setSelectedHistoryId('');
            setPrice('');
            setDate(new Date());
            setTime('12:00:00');
        } catch (error) {
            console.error('Error deleting price history:', error);
            toast.error('Failed to delete price history');
        } finally {
            setSubmitting(false);
        }
    };

    // Ensure body pointer-events are restored when dialog closes
    useEffect(() => {
        return () => {
            document.body.style.removeProperty('pointer-events');
        };
    }, []);

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTime(e.target.value);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                // Ensure pointer-events are restored when dialog closes
                document.body.style.pointerEvents = '';
                onClose();
            }
        }}>
            <DialogContent className="md:w-[70vw] max-w-[90vw] sm:max-w-[90vw] sm:w[90vw] max-h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto overflow-x-hidden">
                <DialogHeader>
                    <DialogTitle className='text-white'>
                        {mode === 'view' ? 'Price History' :
                            mode === 'add' ? 'Add Price History' :
                                'Automate Price Changes'}
                    </DialogTitle>
                </DialogHeader>



                <div className="flex justify-between items-center mb-8 overflow-y-auto">
                    <div className="overflow-y-auto pb-2 ">
                        <div className="flex gap-2 bg-[#1A1F2C] rounded-lg p-1 min-w-max">
                            <Button
                                variant="ghost"
                                className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${mode === 'view' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => toggleMode('view')}
                            >
                                View History
                            </Button>
                            <Button
                                variant="ghost"
                                className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${mode === 'add' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => toggleMode('add')}
                            >
                                Add New Price
                            </Button>
                            <Button
                                variant="ghost"
                                className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${mode === 'automation' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => toggleMode('automation')}
                            >
                                Automate
                            </Button>
                            <Button
                                variant="ghost"
                                className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${mode === 'cron' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => toggleMode('cron')}
                            >
                                Active Automations
                            </Button>

                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                        <span className="ml-2 text-white ">Loading price history...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mode === 'view' ? (
                            <ViewPriceHistory
                                priceHistory={priceHistory}
                                selectedHistoryId={selectedHistoryId}
                                price={price}
                                submitting={submitting}
                                handleSelectChange={handleSelectChange}
                                handleDelete={handleDelete}
                                setPrice={setPrice}
                            />
                        ) : mode === 'add' ? (
                            <AddPriceHistory
                                date={date}
                                time={time}
                                price={price}
                                submitting={submitting}
                                setDate={setDate}
                                handleTimeChange={handleTimeChange}
                                setPrice={setPrice}
                            />
                        ) : mode === 'automation' ? (
                            <AutomatePriceHistory
                                currentPrice={priceHistory.length > 0 ? priceHistory[0].price.toString() : '0'}
                                startDate={startDate}
                                endDate={endDate}
                                startTime={startTime}
                                endTime={endTime}
                                percentage={percentage}
                                submitting={submitting}
                                setStartDate={setStartDate}
                                setEndDate={setEndDate}
                                setStartTime={setStartTime}
                                setEndTime={setEndTime}
                                setPercentage={setPercentage}
                            />
                        ) : (
                            <ViewCronJobs
                                productId={productId}
                                refreshTrigger={refreshTrigger}
                            />
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    {mode !== 'cron' && (
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
                                mode === 'add' ? 'Add' :
                                    mode === 'view' ? 'Update' :
                                        'Schedule Automation'
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PriceHistoryDialog;


