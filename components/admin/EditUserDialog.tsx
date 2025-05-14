'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

interface User {
    _id: string;
    name?: string; // Made optional to align with IUser
    email: string;
    phoneNumber?: string; // Added phoneNumber
    password?: string; // Added password for editing
    role: string;
    isBlocked: boolean;
}

interface EditUserDialogProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>) => Promise<void>;
}

export function EditUserDialog({ user, isOpen, onClose, onSave }: EditUserDialogProps) {
    const { isSuperAdmin } = useAuth();
    const [formData, setFormData] = useState<Partial<User>>(
        user || { name: '', email: '', phoneNumber: '', password: '', role: 'user', isBlocked: false }
    );

    // Effect to update formData when user prop changes
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                _id: user._id,
                name: user.name || '',
                email: user.email,
                phoneNumber: user.phoneNumber || '',
                role: user.role,
                isBlocked: user.isBlocked,
                password: user.password, // Clear password field on open for security
            });
        } else if (isOpen && !user) {
            // For 'Add User' case, initialize all fields
            setFormData({ name: '', email: '', phoneNumber: '', password: '', role: 'user', isBlocked: false });
        }
    }, [isOpen, user]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="bg-gray-800 border-gray-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            className="bg-gray-800 border-gray-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                                setFormData({ ...formData, phoneNumber: e.target.value })
                            }
                            className="bg-gray-800 border-gray-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password (optional)</Label>
                        <Input
                            id="password"
                            type="text"
                            placeholder="Leave blank to keep current password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            className="bg-gray-800 border-gray-700"
                        />
                    </div>
                    {isSuperAdmin && (
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, role: value })
                                }
                            >
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="blocked"
                            checked={formData.isBlocked}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, isBlocked: checked })
                            }
                        />
                        <Label htmlFor="blocked">Block User</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}