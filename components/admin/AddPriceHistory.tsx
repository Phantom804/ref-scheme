import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";

interface AddPriceHistoryProps {
    date: Date | undefined;
    time: string;
    price: string;
    submitting: boolean;
    setDate: (date: Date | undefined) => void;
    handleTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setPrice: (price: string) => void;
}

const AddPriceHistory = ({
    date,
    time,
    price,
    submitting,
    setDate,
    handleTimeChange,
    setPrice
}: AddPriceHistoryProps) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-white block mb-2">
                    Date
                </label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} autoFocus />
                    </PopoverContent>
                </Popover>
            </div>

            <div>
                <label className="text-sm font-medium text-white block mb-2">
                    Time
                </label>
                <div className="relative">
                    <Input
                        type="time"
                        step="1"
                        value={time}
                        onChange={handleTimeChange}
                        className="peer appearance-none ps-9 text-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        readOnly={submitting}
                    />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                        <ClockIcon size={16} aria-hidden="true" />
                    </div>
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
        </div>
    );
};

export default AddPriceHistory;