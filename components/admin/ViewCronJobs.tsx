import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ActiveAutomation } from './Types/PriceHistoryTypes';

interface ViewCronJobsProps {
    productId: string;
    refreshTrigger: number;
}

const ViewCronJobs = ({ productId, refreshTrigger }: ViewCronJobsProps) => {
    const [automations, setAutomations] = useState<ActiveAutomation[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (productId) {
            fetchAutomations();
        }
    }, [productId, refreshTrigger]);

    const fetchAutomations = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/price-automation?productId=${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch automations');
            }
            const data = await response.json();
            setAutomations(data);
        } catch (error) {
            console.error('Error fetching automations:', error);
            toast.error('Failed to load active automations');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try {
            const response = await fetch(`/api/admin/price-automation?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to cancel automation');
            }

            toast.success('Automation cancelled successfully');
            // Remove the deleted automation from the list
            setAutomations(automations.filter(item => item._id !== id));
        } catch (error) {
            console.error('Error cancelling automation:', error);
            toast.error('Failed to cancel automation');
        } finally {
            setDeleting(null);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'PPP') + ' ' +
            date.getHours().toString().padStart(2, '0') + ':' +
            date.getMinutes().toString().padStart(2, '0') + ':' +
            date.getSeconds().toString().padStart(2, '0');
    };

    const calculateProgress = (automation: ActiveAutomation) => {
        const now = new Date();
        const start = new Date(automation.startDate);
        const end = new Date(automation.endDate);

        // If not started yet
        if (now < start) return 0;
        // If already ended
        if (now > end) return 100;

        // Calculate progress percentage
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        return Math.round((elapsed / totalDuration) * 100);
    };

    const calculateCurrentPrice = (automation: ActiveAutomation) => {
        const now = new Date();
        const start = new Date(automation.startDate);
        const end = new Date(automation.endDate);
        const startPrice = automation.startPrice;
        const targetPercentage = automation.targetPercentage;

        // If not started yet
        if (now < start) return startPrice.toFixed(2);
        // If already ended
        if (now > end) return (startPrice * (1 + targetPercentage / 100)).toFixed(2);

        // Calculate current price based on elapsed time
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        const progress = elapsed / totalDuration;

        const totalPriceChange = startPrice * (targetPercentage / 100);
        const currentPrice = startPrice + (totalPriceChange * progress);

        return parseFloat(currentPrice.toFixed(2));
    };

    return (
        <div className="space-y-4 w-full">
            <h3 className="text-lg font-medium text-white text-center sm:text-left">Active Price Automations</h3>

            {loading ? (
                <div className="flex flex-col sm:flex-row justify-center items-center py-4 sm:py-8">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-purple-500" />
                    <span className="mt-2 sm:mt-0 sm:ml-2 text-white text-sm sm:text-base">Loading automations...</span>
                </div>
            ) : automations.length > 0 ? (
                <div className="space-y-4">
                    {automations.map((automation) => {
                        const progress = calculateProgress(automation);
                        const currentPrice = calculateCurrentPrice(automation);
                        return (
                            <div key={automation._id} className="bg-gray-800 p-3 sm:p-4 rounded-md">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                                    <div className="flex-1">
                                        <div className="text-xs sm:text-sm text-gray-400 break-words">Created: {formatDateTime(automation.createdAt)}</div>
                                        <div className="text-white font-medium mt-1 text-sm sm:text-base">
                                            {automation.targetPercentage > 0 ? 'Increasing' : 'Decreasing'} by {Math.abs(automation.targetPercentage)}%
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(automation._id)}
                                        disabled={deleting === automation._id}
                                        className="bg-white self-end sm:self-auto"
                                    >
                                        {deleting === automation._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-2 text-xs sm:text-sm mb-2">
                                    <div className="overflow-hidden text-ellipsis">
                                        <span className="text-gray-400">Start: </span>
                                        <span className="text-white break-words">{formatDateTime(automation.startDate)}</span>
                                    </div>
                                    <div className="overflow-hidden text-ellipsis">
                                        <span className="text-gray-400">End: </span>
                                        <span className="text-white break-words">{formatDateTime(automation.endDate)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Start Price: </span>
                                        <span className="text-white">PKR {automation.startPrice.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Current Price: </span>
                                        <span className="text-white">PKR {currentPrice}</span>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-gray-700 rounded-full h-2 sm:h-2.5 mb-1">
                                    <div
                                        className="bg-purple-500 h-2 sm:h-2.5 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-right text-gray-400">{progress}% complete</div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-4 text-gray-500 text-sm sm:text-base">
                    No active price automations for this product.
                </div>
            )}
        </div>
    );
};

export default ViewCronJobs;