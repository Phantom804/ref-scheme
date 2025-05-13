"use client";

import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AppSettingsData {
    referralCommission: number;

}

const Settings: React.FC = () => {
    const [referralCommission, setreferralCommission] = useState<number>(0);
    const [initialreferralCommission, setInitialreferralCommission] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/admin/settings');
                if (!response.ok) {
                    throw new Error('Failed to fetch settings');
                }
                const data: AppSettingsData = await response.json();
                setreferralCommission(data.referralCommission);
                setInitialreferralCommission(data.referralCommission);
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error('Failed to load settings.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        // disable toast loading when response is come
        let toastID = toast.loading('Saving settings...');

        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ referralCommission }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save settings');
            }

            const updatedSettings: AppSettingsData = await response.json();
            setInitialreferralCommission(updatedSettings.referralCommission);
            toast.success('Settings saved successfully!');

        } catch (error) {
            console.error('Error saving settings:', error);

            toast.error((error as Error).message || 'Failed to save settings.');
            // Optionally revert to initial value if save fails
            // setreferralCommission(initialreferralCommission);
        } finally {
            toast.dismiss(toastID);
            setIsSaving(false);
        }
    };

    return (
        <div className="pt-16 md:ml-16 lg:ml-64 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-gray-400">Manage your account and application settings</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-9">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <span className="ml-2 text-gray-400">Loading ...</span>
                        </div>
                    ) : (
                        <Card>
                            <div className="space-y-6 p-6"> {/* Added padding to Card content */}
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="referralCommission" className="block text-sm font-medium text-gray-300 mb-1">
                                                Referral Comission (%)
                                            </label>
                                            <input
                                                type="number"
                                                id="referralCommission"
                                                value={referralCommission}
                                                onChange={(e) => setreferralCommission(parseFloat(e.target.value))}
                                                className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                                placeholder="Enter referral comission percentage"
                                                disabled={isLoading || isSaving}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSaveSettings}
                                        disabled={isLoading || isSaving || referralCommission === initialreferralCommission}
                                    >
                                        <Save size={16} className="mr-2" />
                                        Save Changes

                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;