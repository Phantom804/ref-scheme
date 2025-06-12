import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';


interface AppSettingsData {
    withdrawLimit: number;
    minWithdrawLimit: number;

}

function WithdrawSettings() {
    const [initialwithdrawLimit, setinitialwithdrawLimit] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [minWithdrawPercent, setminWithdrawPercent] = useState<number>(0);
    const [minWithdrawAmount, setminWithdrawAmount] = useState<number>(0);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/admin/settings');
                if (!response.ok) {
                    throw new Error('Failed to fetch settings');
                }
                const data = await response.json();
console.log(data);
                setminWithdrawPercent(data.minWithdrawPercent);
                setminWithdrawAmount(data.minWithdrawAmount);
                setinitialwithdrawLimit(data.minWithdrawPercent);
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
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ minWithdrawPercent, minWithdrawAmount }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save settings');
            }

            const updatedSettings: AppSettingsData = await response.json();
            setinitialwithdrawLimit(updatedSettings.withdrawLimit);
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
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-9">

                <Card>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <span className="ml-2 text-gray-400">Loading ...</span>
                        </div>
                    ) : (
                        <div className="space-y-6 p-6"> {/* Added padding to Card content */}
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label htmlFor="minWithdrawPercent" className="block text-sm font-medium text-gray-300 mb-1">
                                            Withdraw Limit (%)
                                        </label>
                                        <input
                                            type="number"
                                            id="minWithdrawPercent"
                                            value={minWithdrawPercent || ''}
                                            onChange={(e) => setminWithdrawPercent(parseFloat(e.target.value))}
                                            className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 pr-10 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="Enter withdrawal limit percentage"
                                            disabled={isLoading || isSaving}
                                        />
                                        <span className="absolute right-3 top-[38px] text-gray-400 text-sm pointer-events-none">%</span>
                                    </div>

                                    <div>
                                        <label htmlFor="swithdrawimit" className="block text-sm font-medium text-gray-300 mb-1">
                                            Minimun Withdraw in Number
                                        </label>
                                        <input
                                            type="number"
                                            id="minWithdrawAmount"
                                            value={minWithdrawAmount || ''}
                                            onChange={(e) => setminWithdrawAmount(parseFloat(e.target.value))}
                                            className="bg-gray-800 text-white text-sm rounded-lg block w-full p-2.5 border border-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="Enter minimum withdrawl in numbers"
                                            disabled={isLoading || isSaving}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleSaveSettings}
                                    disabled={isLoading || isSaving || minWithdrawPercent === initialwithdrawLimit}
                                >
                                    <Save size={16} className="mr-2" />
                                    Save Changes

                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

            </div>
        </div>
    )
}

export default WithdrawSettings