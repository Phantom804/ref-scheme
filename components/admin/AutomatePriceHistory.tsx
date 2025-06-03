import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";

interface AutomatePriceHistoryProps {
    currentPrice: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    startTime: string;
    endTime: string;
    percentage: string;
    submitting: boolean;
    setStartDate: (date: Date | undefined) => void;
    setEndDate: (date: Date | undefined) => void;
    setStartTime: (time: string) => void;
    setEndTime: (time: string) => void;
    setPercentage: (percentage: string) => void;
}

const AutomatePriceHistory = ({
    currentPrice,
    startDate,
    endDate,
    startTime,
    endTime,
    percentage,
    submitting,
    setStartDate,
    setEndDate,
    setStartTime,
    setEndTime,
    setPercentage
}: AutomatePriceHistoryProps) => {
    // Calculate the estimated final price based on percentage
    const calculateEstimatedPrice = () => {
        if (!currentPrice || !percentage) return "";

        const basePrice = parseFloat(currentPrice);
        const percentChange = parseFloat(percentage);

        if (isNaN(basePrice) || isNaN(percentChange)) return "";

        const finalPrice = basePrice * (1 + percentChange / 100);
        return finalPrice.toFixed(2);
    };

    // Calculate time difference in minutes
    const calculateTimeDifference = () => {
        if (!startDate || !endDate || !startTime || !endTime) return null;

        const start = new Date(startDate);
        const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
        start.setHours(startHours, startMinutes, startSeconds || 0);

        const end = new Date(endDate);
        const [endHours, endMinutes, endSeconds] = endTime.split(':').map(Number);
        end.setHours(endHours, endMinutes, endSeconds || 0);

        // Calculate difference in minutes
        const diffMs = end.getTime() - start.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);

        return diffMinutes > 0 ? diffMinutes : null;
    };

    // Calculate the increment per minute
    const calculateIncrementPerMinute = () => {
        const timeDiff = calculateTimeDifference();
        if (!timeDiff || !currentPrice || !percentage) return "";

        const basePrice = parseFloat(currentPrice);
        const percentChange = parseFloat(percentage);

        if (isNaN(basePrice) || isNaN(percentChange)) return "";

        // Calculate total price change
        const totalChange = basePrice * (percentChange / 100);

        // Calculate change per minute
        const changePerMinute = totalChange / timeDiff;

        // Calculate percentage per minute
        const percentPerMinute = (percentChange / timeDiff).toFixed(4);

        return `${percentPerMinute}% per minute`;
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                    <Label className="text-sm font-medium text-white block mb-2">
                        Start Date
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground"
                                )}
                                disabled={submitting}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} autoFocus />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* End Date */}
                <div>
                    <Label className="text-sm font-medium text-white block mb-2">
                        End Date
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground"
                                )}
                                disabled={submitting}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} autoFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div>
                    <Label className="text-sm font-medium text-white block mb-2">
                        Start Time
                    </Label>
                    <div className="relative">
                        <Input
                            type="time"
                            step="1"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="peer appearance-none ps-9 text-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            readOnly={submitting}
                        />
                        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <ClockIcon size={16} aria-hidden="true" />
                        </div>
                    </div>
                </div>

                {/* End Time */}
                <div>
                    <Label className="text-sm font-medium text-white block mb-2">
                        End Time
                    </Label>
                    <div className="relative">
                        <Input
                            type="time"
                            step="1"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="peer appearance-none ps-9 text-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            readOnly={submitting}
                        />
                        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <ClockIcon size={16} aria-hidden="true" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Percentage Change */}
            <div className="space-y-2">
                <Label htmlFor="percentage-input" className="text-sm font-medium text-white">
                    Percentage Change (+ for increase, - for decrease)
                </Label>
                <Input className='text-white'
                    id="percentage-input"
                    type="number"
                    step="0.01"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="Enter percentage (e.g., 20 for 20% increase)"
                    disabled={submitting}
                />
            </div>

            {/* Current Price */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                    Current Price
                </Label>
                <div className="bg-gray-800 p-2 rounded text-white">
                    PKR {currentPrice}
                </div>
            </div>

            {/* Estimated Final Price */}
            {percentage && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-white">
                        Estimated Final Price
                    </Label>
                    <div className="bg-gray-800 p-2 rounded text-white">
                        PKR {calculateEstimatedPrice()}
                    </div>
                </div>
            )}

            {/* Time Difference and Rate */}
            {calculateTimeDifference() && percentage && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-white">
                        Time Period and Rate
                    </Label>
                    <div className="bg-gray-800 p-2 rounded text-white">
                        <div>Duration: {calculateTimeDifference()} minutes</div>
                        <div>Rate: {calculateIncrementPerMinute()}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutomatePriceHistory;