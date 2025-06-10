"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Pagination from '@/components/Pagination';

interface Withdrawal {
    id: string;
    userId: string;
    userName: string;
    phoneNumber: string;
    accountTitle: string;
    accountNumber: string;
    bankName: string;
    amount: string;
    status: "Pending" | "Approved" | "Cancelled";
    requestedOn: string;
    completedOn?: string;
}

interface WithdrawalsResponse {
    withdrawals: Withdrawal[];
    totalPages: number;
    currentPage: number;
    totalWithdrawals: number;
}

const Withdraw: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalWithdrawals, setTotalWithdrawals] = useState(0);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: 0,
        maxPrice: 1000,
        showApprovedRequests: false,
        showCancelledRequests: false
    });
    const withdrawalsPerPage = 10;

    // Fetch withdrawals from API
    const fetchWithdrawals = async (page = currentPage, search = searchTerm, currentFilters = filters) => {
        try {
            setLoading(true);

            // Build query string with all filters
            let queryString = `/api/admin/withdraw?page=${page}&limit=${withdrawalsPerPage}`;

            if (search) {
                queryString += `&search=${encodeURIComponent(search)}`;
            }

            if (currentFilters.minPrice > 0) {
                queryString += `&minPrice=${currentFilters.minPrice}`;
            }

            if (currentFilters.maxPrice < 1000) {
                queryString += `&maxPrice=${currentFilters.maxPrice}`;
            }

            // Add status filters
            queryString += `&showApprovedRequests=${currentFilters.showApprovedRequests}`;
            queryString += `&showCancelledRequests=${currentFilters.showCancelledRequests}`;

            const response = await fetch(queryString);

            if (!response.ok) {
                throw new Error('Failed to fetch withdrawal requests');
            }

            const data: WithdrawalsResponse = await response.json();
            setWithdrawals(data.withdrawals);
            setTotalPages(data.totalPages);
            setTotalWithdrawals(data.totalWithdrawals);
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
            toast.error('Failed to load withdrawal requests. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (status: Withdrawal['status'], withdrawalId: string) => {
        if (window.confirm('Update the status to ' + status + '?')) {
            try {
                const response = await fetch('/api/admin/withdraw', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ withdrawalId, status }),
                });

                const resData = await response.json();
                if (response.ok) {
                    // Update local state
                    setWithdrawals(withdrawals.map(withdrawal =>
                        withdrawal.id === withdrawalId ? { ...withdrawal, status } : withdrawal
                    ));

                    toast.success('Withdrawal status updated successfully');
                } else {
                    toast.error(resData.error);
                }


            } catch (error) {
                console.error('Error updating withdrawal status:', error);
                toast.error('Failed to update withdrawal status. Please try again.');
            }
        }
    };

    const getStatusColor = (status: Withdrawal['status']) => {
        switch (status) {
            case 'Approved':
                return 'bg-[#1A392C] text-[#4ADE80]';
            case 'Cancelled':
                return 'bg-[#3A1D1D] text-[#F75555]';
            case 'Pending':
                return 'bg-[#1C2F4C] text-[#3B82F6]';
            default:
                return '';
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            fetchWithdrawals(1, value, filters);
            setCurrentPage(1);
        }, 500);

        setSearchTimeout(timeout);
    };

    const handleFilterChange = (name: string, value: string | number | number[] | boolean) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
    };

    const applyFilters = () => {
        fetchWithdrawals(1, searchTerm, filters);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        const defaultFilters = {
            minPrice: 0,
            maxPrice: 1000,
            showApprovedRequests: false,
            showCancelledRequests: false
        };
        setFilters(defaultFilters);
        fetchWithdrawals(1, searchTerm, defaultFilters);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchWithdrawals(page, searchTerm, filters);
    };

    // Initial data fetch
    useEffect(() => {
        fetchWithdrawals();

        // Cleanup timeout on component unmount
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, []);

    return (
        <div className="pt-8 md:ml-16 lg:ml-64 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
                    <p className="text-gray-400">Manage withdrawal requests</p>
                </div>
            </div>

            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search size={16} className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            className="bg-gray-800 text-white text-sm rounded-lg block w-full pl-10 p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Search by Name or Phone"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <Popover open={showFilters} onOpenChange={setShowFilters}>
                        <PopoverTrigger asChild>
                            <Button
                                className='bg-gray-800'
                                size="sm"
                            >
                                <Filter size={16} className="mr-2" />
                                Filters
                                {(filters.minPrice > 0 || filters.maxPrice < 1000 || filters.showApprovedRequests || filters.showCancelledRequests) && (
                                    <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full"></span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-gray-800 border-gray-700 text-white p-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium">Filters</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetFilters}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Reset
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="showApprovedRequests" className="text-sm text-gray-400">Show Approved Requests</Label>
                                        <Switch
                                            id="showApprovedRequests"
                                            checked={filters.showApprovedRequests}
                                            onCheckedChange={(checked) => handleFilterChange('showApprovedRequests', checked)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="showCancelledRequests" className="text-sm text-gray-400">Show Cancelled Requests</Label>
                                        <Switch
                                            id="showCancelledRequests"
                                            checked={filters.showCancelledRequests}
                                            onCheckedChange={(checked) => handleFilterChange('showCancelledRequests', checked)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label className="text-sm text-gray-400">Amount Range</Label>
                                        <span className="text-sm text-gray-400">
                                            ${filters.minPrice} - ${filters.maxPrice}
                                        </span>
                                    </div>
                                    <div className="pt-4 pb-2">
                                        <Slider
                                            defaultValue={[filters.minPrice, filters.maxPrice]}
                                            max={1000}
                                            step={10}
                                            value={[filters.minPrice, filters.maxPrice]}
                                            onValueChange={(value) => {
                                                handleFilterChange('minPrice', value[0]);
                                                handleFilterChange('maxPrice', value[1]);
                                            }}
                                            className="text-purple-500"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={() => {
                                        applyFilters();
                                        setShowFilters(false);
                                    }}
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="relative overflow-x-auto rounded-lg">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <span className="ml-2 text-gray-400">Loading withdrawal requests...</span>
                        </div>
                    ) : withdrawals.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No withdrawal requests found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-[#2A2F3E]">
                                    <TableHead className="text-gray-400">User</TableHead>
                                    <TableHead className="text-gray-400">User Phone</TableHead>
                                    <TableHead className="text-gray-400">Amount</TableHead>
                                    <TableHead className="text-gray-400">Account Title</TableHead>
                                    <TableHead className="text-gray-400">Account Number</TableHead>
                                    <TableHead className="text-gray-400">Bank Name</TableHead>
                                    <TableHead className="text-gray-400">Requested On</TableHead>
                                    <TableHead className="text-gray-400">Completed On</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {withdrawals.map((withdrawal) => (
                                    <TableRow key={withdrawal.id} className="hover:bg-[#1F2937]/5 border-b border-[#2A2F3E]">
                                        <TableCell className="text-white">
                                            {withdrawal.userName}
                                        </TableCell>
                                        <TableCell className="text-white">{withdrawal.phoneNumber}</TableCell>
                                        <TableCell className="text-[#3B82F6]">{withdrawal.amount}</TableCell>
                                        <TableCell className="text-white">{withdrawal.accountTitle}</TableCell>
                                        <TableCell className="text-white">{withdrawal.accountNumber}</TableCell>
                                        <TableCell className="text-white">{withdrawal.bankName}</TableCell>
                                        <TableCell className="text-white">{withdrawal.requestedOn}</TableCell>
                                        <TableCell className="text-white">{withdrawal.completedOn || "-"}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={withdrawal.status}
                                                onValueChange={(value: Withdrawal['status']) => handleStatusChange(value, withdrawal.id)}
                                            >
                                                <SelectTrigger className={`w-[110px] border-none ${getStatusColor(withdrawal.status)}`}>
                                                    <SelectValue>{withdrawal.status}</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Approved">Approved</SelectItem>
                                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalWithdrawals}
                        onPageChange={handlePageChange}
                        loading={loading}
                    />
                </div>
            </Card>
        </div>
    );
};

export default Withdraw;