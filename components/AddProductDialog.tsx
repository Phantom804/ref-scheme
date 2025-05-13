"use client";

import { Save, Image, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useRef, FormEvent, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

interface AddProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onProductAdded: () => void;
    productId?: string;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ isOpen, onClose, onProductAdded, productId }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        description: ''
    });
    const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

    // Fetch product data when editing
    useEffect(() => {
        const fetchProductData = async () => {
            if (productId) {
                setIsEditMode(true);
                setLoading(true);
                try {
                    const response = await fetch(`/api/admin/product?id=${productId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch product data');
                    }

                    const product = await response.json();
                    setFormData({
                        name: product.name,
                        price: product.price.toString(),
                        category: product.category,
                        description: product.description || ''
                    });

                    if (product.imageUrl) {
                        setExistingImageUrl(product.imageUrl);
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                    toast.error('Failed to load product data');
                } finally {
                    setLoading(false);
                }
            } else {
                setIsEditMode(false);
                resetForm();
            }
        };

        fetchProductData();
    }, [productId]);

    // Fetch categories when dialog opens
    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                try {
                    const response = await fetch('/api/admin/category');
                    const data = await response.json();
                    if (data.categories) {
                        setCategories(data.categories);
                    }
                } catch (error) {
                    console.error('Error fetching categories:', error);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            e.target.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const removeFile = () => {
        setFile(null);
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            category: '',
            description: ''
        });
        setFile(null);
        setExistingImageUrl(null);
        setIsEditMode(false);
    };

    const handleDialogClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Validate form data
            if (!formData.name || !formData.price || !formData.category || !formData.description) {
                toast.error('Please fill in all required fields');
                return;
            }

            // Create form data for submission
            const productFormData = new FormData();
            productFormData.append('name', formData.name);
            productFormData.append('price', formData.price);
            productFormData.append('category', formData.category);
            productFormData.append('description', formData.description);

            if (isEditMode && productId) {
                productFormData.append('id', productId);
            }

            if (file) {
                productFormData.append('image', file);
            }

            // Keep track if we're using the existing image
            if (isEditMode && existingImageUrl && !file) {
                productFormData.append('keepExistingImage', 'true');
            }

            // Submit to API
            const response = await fetch('/api/admin/product', {
                method: isEditMode ? 'PATCH' : 'POST',
                body: productFormData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'create'} product`);
            }

            toast.success(`Product ${isEditMode ? 'updated' : 'added'} successfully!`);

            // Reset form and close dialog
            resetForm();
            onProductAdded();
            onClose();
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to add product');
        } finally {
            setLoading(false);
        }
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
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    // Ensure pointer-events are restored when dialog closes
                    document.body.style.pointerEvents = '';
                    handleDialogClose();
                }
            }}
        >
            <DialogContent className="w-[70vw] max-w-[90vw] sm:max-w-[90vw] max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Add New Product</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Fill in the details to create a new product listing
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                        Product Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Enter product name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                                        Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                        value={formData.category}
                                        onChange={handleFormChange}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Enter product description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="space-y-4">
                                <input
                                    type="file"
                                    hidden
                                    accept="image/png, image/jpeg, image/gif"
                                    ref={fileInputRef}
                                    onChange={handleFileInputChange}
                                />
                                <div
                                    className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                >
                                    {file ? (
                                        <div className="w-full">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-300 truncate">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={removeFile}
                                                    className="text-gray-400 hover:text-white"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <div className="bg-gray-700 rounded-lg overflow-hidden">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="Product preview"
                                                    className="w-full h-48 object-contain"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">{formatBytes(file.size)}</p>
                                        </div>
                                    ) : existingImageUrl ? (
                                        <div className="w-full">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-300 truncate">Current Image</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setExistingImageUrl(null)}
                                                    className="text-gray-400 hover:text-white"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <div className="bg-gray-700 rounded-lg overflow-hidden">
                                                <img
                                                    src={existingImageUrl}
                                                    alt="Product preview"
                                                    className="w-full h-48 object-contain"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center">
                                            <Image className="h-12 w-12 text-gray-400 mb-3" />
                                            <p className="text-sm text-gray-400 mb-2">Drag and drop image files</p>
                                            <p className="text-xs text-gray-500 mb-3">PNG, JPG or GIF up to 5MB</p>
                                            <Button type="button" variant="outline" size="sm" onClick={openFileDialog}>
                                                Browse Files
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDialogClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            <Save size={16} className="mr-2" />
                            {loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Product' : 'Save Product')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddProductDialog;