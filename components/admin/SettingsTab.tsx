"use client";

import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';


const SettingsTab: React.FC = () => {
    const [requireIdCardUpload, setRequireIdCardUpload] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmiting, setisSubmiting] = useState(false)
    const [email, setEmail] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [messanger, setMessanger] = useState('');

    useEffect(() => {
        setIsLoading(true)
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                const data = await res.json();
                if (res.ok) {
                    setRequireIdCardUpload(data.requireIdCardUpload || false);
                    setEmail(data.email || '');
                    setWhatsappNumber(data.whatsappNumber || '');
                    setMessanger(data.messanger || '');
                }
            } catch (error) {
                console.error('Failed to fetch app settings:', error);
                toast.error('Failed to fetch app settings.');
            } finally {
                setIsLoading(false)
            }
        };
        fetchSettings();
    }, []);

    const handleUpdateSettings = async () => {
        setisSubmiting(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ requireIdCardUpload, email, whatsappNumber, messanger }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("updated sucessfully");
            } else {
                toast.error(data.message || 'Failed to update settings.');
            }
        } catch (error) {
            console.error('Failed to update app settings:', error);
            toast.error('Failed to update settings.');
        } finally {
            setisSubmiting(false);
        }
    };

    return (
        <>
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-2 text-gray-400">Loading ...</span>
                </div>
            ) : (
                <div className="p-4 bg-[#1A1F2C] rounded-lg space-y-6">

                    <div>
                        <h2 className="text-white text-lg font-semibold mb-4">ID Card Upload Settings</h2>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="require-id-card-upload"
                                checked={requireIdCardUpload}
                                onCheckedChange={setRequireIdCardUpload}
                            />
                            <Label htmlFor="require-id-card-upload" className="text-gray-300">
                                Require ID Card Upload on Signup
                            </Label>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-white text-lg font-semibold mb-4">Contact Information</h2>
                        <div className="space-y-4">

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email || ''}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Email contact"

                                />
                            </div>

                            <div>
                                <Label htmlFor="whatsapp" className="block text-sm font-medium text-gray-300 mb-1">WhatsApp Number</Label>
                                <Input
                                    id="whatsapp"
                                    type="text"
                                    value={whatsappNumber || ''}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="whatsapp contact"
                                />
                            </div>
                            <div>
                                <Label htmlFor="messanger" className="block text-sm font-medium text-gray-300 mb-1">Messanger</Label>
                                <Input
                                    id="messanger"
                                    type="text"
                                    value={messanger}
                                    onChange={(e) => setMessanger(e.target.value)}
                                    className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="messanger contact"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleUpdateSettings}
                        disabled={isSubmiting}
                        className="bg-purple-600 hover:bg-purple-700 text-white">
                        {isSubmiting ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                Saving...
                            </div>
                        ) : (
                            "Save Settings"
                        )}

                    </Button>

                </div>
            )}
        </>

    );
};

export default SettingsTab;