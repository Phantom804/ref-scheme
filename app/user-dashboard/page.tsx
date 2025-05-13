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
                    <div className="flex gap-2 bg-[#1A1F2C] rounded-lg p-1">
                        <Button
                            variant="ghost"
                            className={`rounded-md px-6 py-2 ${activeTab === 'bought' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('bought')}
                        >
                            Bought
                        </Button>
                        <Button
                            variant="ghost"
                            className={`rounded-md px-6 py-2 ${activeTab === 'refrence' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('refrence')}
                        >
                            Refrence
                        </Button>
                        <Button
                            variant="ghost"
                            className={`rounded-md px-6 py-2 ${activeTab === 'ReferralTree' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('ReferralTree')}
                        >
                            Referral Tree
                        </Button>
                        <Button
                            variant="ghost"
                            className={`rounded-md px-6 py-2 ${activeTab === 'settings' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Settings
                        </Button>

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