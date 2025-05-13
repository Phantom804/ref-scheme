"use client";

import { Save, Image, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AddProduct: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        description: ''
    });
    const router = useRouter();

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

            if (file) {
                productFormData.append('image', file);
            }

            // Submit to API
            const response = await fetch('/api/admin/product', {
                method: 'POST',

                body: productFormData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create product');
            }

            toast.success('Product added successfully!');

            // Reset form
            setFormData({
                name: '',
                price: '',
                category: '',
                description: ''
            });
            setFile(null);

            // Redirect to products list or stay on the page
            // router.push('/admin/products');
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-8 md:ml-16 lg:ml-64 transition-all duration-300">
            <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Add Product</h1>
                        <p className="text-gray-400">Create a new product listing</p>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        <Save size={16} className="mr-2" />
                        {loading ? 'Saving...' : 'Save Product'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card title="Product Information">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        <option value="electronics">Electronics</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="home">Home & Kitchen</option>
                                        <option value="books">Books</option>
                                        <option value="beauty">Beauty</option>
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
                        </Card>
                    </div>

                    <div>
                        <Card title="Product Images">
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
                                    <div className="flex flex-col items-center justify-center">
                                        <Image className="h-12 w-12 text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-400 mb-2">Drag and drop image files</p>
                                        <p className="text-xs text-gray-500 mb-3">PNG, JPG or GIF up to 5MB</p>
                                        <Button type="button" variant="outline" size="sm" onClick={openFileDialog}>
                                            Browse Files
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {file && (
                                        <div className="bg-gray-800 p-3 rounded-lg flex items-center">
                                            <div className="h-12 w-12 bg-purple-800/30 rounded flex items-center justify-center mr-3">
                                                <Image size={20} className="text-purple-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                                <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="ml-2 text-gray-400 hover:text-gray-300"
                                                onClick={removeFile}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;