"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Download, UserPlus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PhoneNumbersDialog from '@/components/admin/PhoneNumbersDialog';

interface User {
    _id: string;
    name?: string;
    email: string;
    country?: string;
    phoneNumber?: string;
    idCardFrontUrl: string;
    idCardBackUrl: string;
    password?: string;
    role: string;
    isBlocked: boolean;
    isVerified: boolean;
}

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [filters, setFilters] = useState({
        role: 'all',
        isBlocked: 'all'
    });
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const usersPerPage = 5;
    const [isPhoneNumbersDialogOpen, setIsPhoneNumbersDialogOpen] = useState(false);
    const [allPhoneNumbers, setAllPhoneNumbers] = useState<string[]>([]);
    const [numbersLoading, setNumbersLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm]);

    useEffect(() => {
        if (isPhoneNumbersDialogOpen) {
            const fetchAllPhoneNumbers = async () => {
                setNumbersLoading(true);
                try {
                    const response = await fetch('/api/admin/users/phone-numbers');
                    if (!response.ok) {
                        throw new Error('Failed to fetch phone numbers');
                    }
                    const data = await response.json();
                    setAllPhoneNumbers(data.phoneNumbers);
                } catch (error) {

                    toast.error('Failed to load all phone numbers.');
                } finally {
                    setNumbersLoading(false);
                }
            };
            fetchAllPhoneNumbers();
        }
    }, [isPhoneNumbersDialogOpen]);

    const fetchUsers = async (page = currentPage, search = searchTerm, currentFilters = filters) => {
        try {
            setIsLoading(true);
            let queryString = `/api/admin/users?page=${page}&limit=${usersPerPage}&search=${search}`;

            if (currentFilters.role && currentFilters.role !== 'all') {
                queryString += `&role=${currentFilters.role}`;
            }

            if (currentFilters.isBlocked && currentFilters.isBlocked !== 'all') {
                queryString += `&isBlocked=${currentFilters.isBlocked}`;
            }

            const response = await fetch(queryString);
            const data = await response.json();
            if (response.ok) {
                setUsers(data.users);
                setTotalPages(data.totalPages);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };

    const handleSaveUser = async (userData: Partial<User & { password?: string }>) => {

        try {
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedUser?._id,
                    ...userData,
                    password: userData.password && userData.password.trim() !== '' ? userData.password : undefined
                }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("User updated successfully");
                fetchUsers();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this user?');
            if (!confirmDelete) return;

            const response = await fetch(`/api/admin/users?id=${userId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("User deleted successfully");
                fetchUsers();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            fetchUsers(1, value, filters);
            setCurrentPage(1);
        }, 500);

        setSearchTimeout(timeout);
    };

    const handleDownloadReceipts = async (idCardFrontUrl: string, idCardBackUrl: string) => {
        const downloadImage = async (url: string, index: number) => {
            if (!url) {
                toast.error(`Receipt ${index} URL not provided`);
                return;
            }

            try {
                const response = await fetch(url, { mode: 'cors' });
                if (!response.ok) {
                    throw new Error(`Failed to fetch image ${index}: ${response.status} ${response.statusText}`);
                }

                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                let fileExtension = '.png';
                if (url.includes('.')) {
                    const urlParts = url.split('.');
                    const extension = urlParts[urlParts.length - 1].toLowerCase();
                    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
                        fileExtension = `.${extension}`;
                    }
                }

                const filename = `idcard${index}_${new Date().getTime()}${fileExtension}`;
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                }, 100);
            } catch (error) {
                console.error(`Error downloading receipt ${index}:`, error);
                toast.error(`Failed to download receipt ${index}`);
            }
        };

        toast.loading('Preparing downloads...');

        await downloadImage(idCardFrontUrl, "front");
        await downloadImage(idCardBackUrl, "back");

        toast.dismiss();
        toast.success('Receipts downloaded successfully');
    };



    return (
        <div className="pt-8 md:ml-16 lg:ml-64 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Users</h1>
                    <p className="text-gray-400">Manage user accounts and permissions</p>
                </div>
                <Button
                    className="mt-4 sm:mt-0"
                    onClick={() => setIsPhoneNumbersDialogOpen(true)}
                >
                    <UserPlus size={16} />
                    All numbers
                </Button>
            </div>

            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 p-4">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search size={16} className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            className="bg-gray-800 text-white text-sm rounded-lg block w-full pl-10 p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className='bg-gray-800'
                            >
                                <Filter size={16} className="mr-2" />
                                Filters
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-gray-800 border-gray-700 text-white p-4 space-y-4">
                            <div className="space-y-4">


                                <div className="space-y-2">
                                    <Label>Block Status</Label>
                                    <Select
                                        value={filters.isBlocked}
                                        onValueChange={(value) => {
                                            setFilters(prev => ({ ...prev, isBlocked: value }));
                                            fetchUsers(1, searchTerm, { ...filters, isBlocked: value });
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="true">Blocked</SelectItem>
                                            <SelectItem value="false">Not Blocked</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                                        onClick={() => {
                                            const defaultFilters = {
                                                role: 'all',
                                                isBlocked: 'all'
                                            };
                                            setFilters(defaultFilters);
                                            fetchUsers(1, searchTerm, defaultFilters);
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                </div>

                <div className="relative overflow-x-auto rounded-lg">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <span className="ml-2 text-gray-400">Loading users...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No users found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-[#2A2F3E]">
                                    <TableHead className="text-gray-400">Name</TableHead>
                                    <TableHead className="text-gray-400">Role</TableHead>
                                    <TableHead className="text-gray-400">Country</TableHead>
                                    <TableHead className="text-gray-400">Phone</TableHead>
                                    <TableHead className="text-gray-400">ID Card</TableHead>
                                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id} className="hover:bg-[#1F2937]/5 border-b border-[#2A2F3E]">
                                        <TableCell className="text-white font-medium whitespace-nowrap">
                                            {user.name}
                                        </TableCell>
                                        <TableCell className="text-white">
                                            <Badge
                                                variant={user.role === 'admin' ? 'default' : 'secondary'}
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-white">
                                            {user.country || '-'}
                                        </TableCell>
                                        <TableCell className="text-white">
                                            {user.phoneNumber}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                className="text-[#3B82F6] hover:text-[#3B82F6]/80 p-0"
                                                onClick={() => handleDownloadReceipts(user.idCardFrontUrl, user.idCardBackUrl)}
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </TableCell>

                                        <TableCell className="text-right space-x-2">
                                            <button
                                                className="text-blue-500 hover:text-blue-400"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-400"
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                    }}
                    loading={isLoading}
                />
            </Card>

            <EditUserDialog
                user={selectedUser}
                isOpen={isEditDialogOpen}
                onClose={() => {
                    setIsEditDialogOpen(false);
                    setSelectedUser(null);
                }}
                onSave={handleSaveUser}
            />

            <PhoneNumbersDialog
                isOpen={isPhoneNumbersDialogOpen}
                onClose={() => setIsPhoneNumbersDialogOpen(false)}
                phoneNumbers={allPhoneNumbers}
                isNumLoading={numbersLoading}
            />
        </div>
    );
};

export default Users;