"use client";

import { useState, useEffect } from 'react';
import { Save, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';


// Sample data - replace with actual data from your backend
type PaymentMethod = {
    _id: string;
    accountTitle: string;
    accountNumber: string;
    bankName: string;
    logoUrl: string;
    isDefault: boolean;
}

const PaymentMethods: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/admin/payment-methods');
                const data = await response.json();
                if (data.success) {
                    setPaymentMethods(data.paymentMethods);
                }
            } catch (error) {
                console.error('Error fetching payment methods:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentMethods();
    }, []);
    const [formData, setFormData] = useState({
        accountTitle: '',
        accountNumber: '',
        bankName: '',
        logoUrl: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            const methodToEdit = paymentMethods.find(method => method._id === editingId);
            if (methodToEdit) {
                await handleEdit({ ...methodToEdit, ...formData });
            }
        } else {
            try {
                const response = await fetch('/api/admin/payment-methods', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();
                if (data.success) {
                    toast.success(data.message);
                    setPaymentMethods(methods => [
                        ...methods,
                        data.paymentMethod
                    ]);
                } else {
                    toast.error(data.message);
                }
                setShowForm(false);
                setEditingId(null);
                setFormData({ accountTitle: '', accountNumber: '', bankName: '', logoUrl: '' });
            } catch (error) {
                toast.error('Failed to add payment method');
            }
        }
    };
    const handleEditButtonClick = (method: PaymentMethod) => {
        setFormData({
            accountTitle: method.accountTitle,
            accountNumber: method.accountNumber,
            bankName: method.bankName,
            logoUrl: method.logoUrl
        });
        setEditingId(method._id);
        setShowForm(true);
    };

    const handleEdit = async (method: typeof paymentMethods[0]) => {
        try {
            const response = await fetch(`/api/admin/payment-methods`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: method._id,
                    accountTitle: method.accountTitle,
                    accountNumber: method.accountNumber.replace('****', ''),
                    bankName: method.bankName,
                    logoUrl: method.logoUrl

                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                setFormData({
                    accountTitle: method.accountTitle,
                    accountNumber: method.accountNumber.replace('****', ''),
                    bankName: method.bankName,
                    logoUrl: method.logoUrl



                });
                setEditingId(method._id);
                setShowForm(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to edit payment method');
        }
    };

    const handleDelete = async (id: string) => {
        console.log(id);
        try {
            const response = await fetch(`/api/admin/payment-methods`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                setPaymentMethods(methods => methods.filter(method => method._id !== id));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to delete payment method');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="pt-8 md:ml-16 lg:ml-64 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Payment Details</h1>
                    <p className="text-gray-400">Manage your payment information</p>
                </div>
                {!showForm && (
                    <Button

                        onClick={() => setShowForm(true)}
                    >
                        <Plus size={16} />
                        Add New Payment Method
                    </Button>
                )}
            </div>

            {showForm ? (
                <Card title={editingId ? "Edit Payment Method" : "Add New Payment Method"}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="accountTitle" className="block text-sm font-medium text-gray-300 mb-1">
                                Account Title
                            </label>
                            <input
                                type="text"
                                id="accountTitle"
                                name="accountTitle"
                                value={formData.accountTitle}
                                onChange={handleChange}
                                className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Enter account Title"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-300 mb-1">
                                Account Number
                            </label>
                            <input
                                type="text"
                                id="accountNumber"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Enter account number"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="bankName" className="block text-sm font-medium text-gray-300 mb-1">
                                Bank Name
                            </label>
                            <input
                                type="text"
                                id="bankName"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Enter bank name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-300 mb-1">
                                Logo URL
                            </label>
                            <input
                                type="text"
                                id="logoUrl"
                                name="logoUrl"
                                value={formData.logoUrl}
                                onChange={handleChange}
                                className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Enter logo URL"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                    setFormData({ accountTitle: '', accountNumber: '', bankName: '', logoUrl: '' });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button

                            >
                                <Save size={16} />
                                {editingId ? 'Update' : 'Save'} Payment Method
                            </Button>
                        </div>
                    </form>
                </Card>
            ) : (

                <Card title="Saved Payment Methods">
                    {loading && <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        <span className="ml-2 text-gray-400">Loading ...</span>
                    </div>}
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <div
                                key={method._id}
                                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                                            <img
                                                src={method.logoUrl || `https://logo.clearbit.com/${method.bankName.toLowerCase().replace(/\s+/g, '')}.com`}
                                                alt={method.bankName}
                                                className="w-6 h-6 rounded"

                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-medium text-white">{method.bankName}</h3>
                                            {method.isDefault && <Badge >Default</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            {method.accountTitle} • {method.accountNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"

                                        onClick={() => handleEditButtonClick(method)}
                                    >
                                        <Pencil size={14} />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(method._id)}
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {paymentMethods.length === 0 && !loading && (
                            <div className="text-center py-6">
                                <p className="text-gray-400">No payment methods added yet.</p>
                            </div>
                        )}
                    </div>

                </Card>
            )}
        </div>
    );
};

export default PaymentMethods;