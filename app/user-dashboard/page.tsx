"use client";


import React, { useState } from 'react';

import { Button } from "@/components/ui/button";

import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import Settings from '@/components/setting';
import BoughtProducts from '@/components/BoughtProducts';
import RefrenceProducts from '@/components/RefrenceProducts';
import ReferralTree from '@/components/ReferralTree';



const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState<'bought' | 'refrence' | 'settings' | 'ReferralTree'>('bought');


    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#271843] text-white p-8  px-4 sm:px-6">
                <h1 className="text-2xl font-semibold mb-8">Dashboard</h1>

                <div className="flex justify-between items-center mb-8">
                    <div className="overflow-x-auto pb-2 w-full">
                        <div className="flex gap-2 bg-[#1A1F2C] rounded-lg p-1 min-w-max">
                            <Button
                                variant="ghost"
                                className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${activeTab === 'bought' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab('bought')}
                            >
                                Bought
                            </Button>
                            <Button
                                variant="ghost"
                                className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${activeTab === 'refrence' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab('refrence')}
                            >
                                Refrence
                            </Button>
                            <Button
                                variant="ghost"
                                className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${activeTab === 'ReferralTree' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab('ReferralTree')}
                            >
                                Referral Tree
                            </Button>
                            <Button
                                variant="ghost"
                                className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${activeTab === 'settings' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                Settings
                            </Button>
                        </div>
                    </div>
                </div>

                {activeTab === 'bought' ? (
                    <BoughtProducts />
                ) : activeTab === 'refrence' ? (
                    <RefrenceProducts />
                ) : activeTab === 'ReferralTree' ? (
                    <ReferralTree />
                ) : (
                    <Settings />
                )}
            </div>
        </>
    );
};

export default UserDashboard;