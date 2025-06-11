"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import TermsAndCondition from '@/components/admin/TermsAndCondition';
import WithdrawSettings from '@/components/admin/WithdrawSettings';
import SettingsTab from '@/components/admin/SettingsTab';

const Settings: React.FC = () => {

    const [activeTab, setActiveTab] = useState<'referral' | 'terms' | 'withdraw' | 'app'>('referral');

    return (
        <div className="pt-16 md:ml-16 lg:ml-64 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex justify-between items-center mb-8">
                    <div className="overflow-x-auto pb-2 ">
                        <div className="flex gap-2 bg-[#1A1F2C] rounded-lg p-1 min-w-max">
                            <Button
                                variant="ghost"
                                className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${activeTab === 'referral' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab('referral')}
                            >
                                Referral
                            </Button>
                            <Button
                                variant="ghost"
                                className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${activeTab === 'terms' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab('terms')}
                            >
                                Terms
                            </Button>
                            <Button
                                variant="ghost"
                                className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${activeTab === 'app' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab('app')}
                            >
                                Others
                            </Button>

                        </div>
                    </div>
                </div>

            </div>

            {activeTab === 'terms' ? (
                <TermsAndCondition />
            ) : activeTab === 'app' ? (
                <SettingsTab />
            ) : (
                <WithdrawSettings />
            )}
        </div>

    );
};

export default Settings;