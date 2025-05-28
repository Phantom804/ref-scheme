'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner'

interface Term {
    _id: string;
    title: string;
    content: string;
    order: number;
}

function TermsAndCondition() {
    const [terms, setTerms] = useState<Term[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTerm, setCurrentTerm] = useState<Partial<Term> | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch terms on component mount
    useEffect(() => {
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/settings/terms');
            if (!response.ok) {
                throw new Error('Failed to fetch terms');
            }
            const data = await response.json();
            setTerms(data.terms || []);
        } catch (err) {
            setError('Error fetching terms');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTerm = () => {
        setCurrentTerm({ title: '', content: '', order: terms.length + 1 });
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const handleEditTerm = (term: Term) => {
        setCurrentTerm(term);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleDeleteTerm = async (id: string) => {
        if (!confirm('Are you sure you want to delete this term?')) return;

        try {
            const response = await fetch(`/api/admin/settings/terms/byid?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Term deleted successfully');
            }


            setTerms(terms.filter(term => term._id !== id));
        } catch (err) {
            setError('Error deleting term');
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentTerm || !currentTerm.title || !currentTerm.content) {
            setError('Title and content are required');
            return;
        }

        try {
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing ? `/api/admin/settings/terms/byid?id=${currentTerm._id}` : '/api/admin/settings/terms';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentTerm),
            });

            if (response.ok) {
                toast.success(`Term ${isEditing ? 'updated' : 'created'} successfully`);

            }

            const savedTerm = await response.json();

            if (isEditing) {
                // Update the existing term in the state
                setTerms(terms.map(term => term._id === savedTerm._id ? savedTerm : term));
            } else {
                // Add the new term to the state
                setTerms([...terms, savedTerm]);
            }

            // Close the dialog and reset the form
            setIsDialogOpen(false);
            setCurrentTerm(null);
        } catch (err) {
            setError(`Error ${isEditing ? 'updating' : 'creating'} term`);
            console.error(err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentTerm(prev => prev ? { ...prev, [name]: value } : null);
    };

    return (
        <div className="p-6 bg-[#1A1F2C] rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Terms & Conditions Management</h2>
                <Button
                    onClick={handleAddTerm}
                    className="bg-[#9b87f5] hover:bg-[#8a74f9] text-white"
                >
                    <Plus size={16} className="mr-2" /> Add New Term
                </Button>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-md mb-4">
                    {error}
                    <button
                        onClick={() => setError('')}
                        className="ml-2 text-red-200 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-8 text-gray-400">Loading terms...</div>
            ) : terms.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No terms found. Add your first term!</div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-[#2A2F3E]">
                                <TableHead className="text-gray-400">Order</TableHead>
                                <TableHead className="text-gray-400">Title</TableHead>
                                <TableHead className="text-gray-400">Content</TableHead>
                                <TableHead className="text-gray-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {terms.map((term) => (
                                <TableRow key={term._id} className="hover:bg-[#1F2937]/5 border-b border-[#2A2F3E]">
                                    <TableCell className="text-gray-300">{term.order}</TableCell>
                                    <TableCell className="text-gray-300">{term.title}</TableCell>
                                    <TableCell className="text-gray-300">
                                        {term.content.length > 50 ? `${term.content.substring(0, 50)}...` : term.content}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="text-blue-500 hover:text-blue-400"
                                                onClick={() => handleEditTerm(term)}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-400"
                                                onClick={() => handleDeleteTerm(term._id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Add/Edit Term Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#1c0f2e] text-white border-none">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Term' : 'Add New Term'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium text-gray-300">Title</label>
                            <Input
                                id="title"
                                name="title"
                                value={currentTerm?.title || ''}
                                onChange={handleInputChange}
                                placeholder="Enter term title"
                                className="bg-[#2d1d45] border-[#372759] text-white"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="content" className="text-sm font-medium text-gray-300">Content</label>
                            <textarea
                                id="content"
                                name="content"
                                value={currentTerm?.content || ''}
                                onChange={handleInputChange}
                                placeholder="Enter term content"
                                className="w-full px-3 py-2 bg-[#2d1d45] border border-[#372759] rounded-md text-white min-h-[100px]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="order" className="text-sm font-medium text-gray-300">Order</label>
                            <Input
                                id="order"
                                name="order"
                                type="number"
                                value={currentTerm?.order || ''}
                                onChange={handleInputChange}
                                placeholder="Enter display order"
                                className="bg-[#2d1d45] border-[#372759] text-white"
                            />
                        </div>



                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#9b87f5] hover:bg-[#8a74f9] text-white"
                            >
                                <Save size={16} className="mr-2" />
                                {isEditing ? 'Update' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default TermsAndCondition