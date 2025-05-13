'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

interface Category {
    _id: string;
    name: string;
    description: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [open, setOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/category');
            const data = await response.json();
            if (data.categories) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpen = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = '/api/admin/category';

            const method = editingCategory ? 'PUT' : 'POST';
            const body = editingCategory
                ? { ...formData, id: editingCategory._id }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess(editingCategory ? 'Category updated successfully' : 'Category created successfully');
            fetchCategories();
            handleClose();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);

        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/category?id=${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete category');
            }

            setSuccess('Category deleted successfully');
            fetchCategories();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);

        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <div className="pt-8 md:ml-16 lg:ml-64 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Categories</h1>
                    <p className="text-gray-400">Manage your categories</p>
                </div>
                <Button className="mt-4 sm:mt-0" onClick={() => handleOpen()}>
                    <Plus size={16} className="mr-2" />
                    Add Category
                </Button>
            </div>
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-2 text-gray-400">Loading categories...</span>
                </div>
            ) : (

                <Card>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 p-4">

                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                        {categories.map((category) => (
                            <Card key={category._id} className="bg-gray-900 text-white p-4 flex flex-col justify-between">
                                <div>
                                    <div className="font-semibold text-lg mb-1">{category.name}</div>
                                    <div className="text-gray-400 text-sm mb-4">{category.description}</div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpen(category)}>
                                        <Edit size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(category._id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </Card>
            )}
            <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
                <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Category Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={handleClose} className="border-gray-700">Cancel</Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">{editingCategory ? 'Update' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}