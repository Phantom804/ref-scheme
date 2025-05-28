"use client";


import React, { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Settings from '@/components/Settings';
import BoughtProducts from '@/components/BoughtProducts';
import RefrenceProducts from '@/components/RefrenceProducts';
import ReferralTree from '@/components/ReferralTree';
import WithdrawPanel from '@/components/WithdrawPanel';
import { Layers, Users, DollarSign, Loader, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';


import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation';


interface DashboardStat {
    title: string;
    value: string;

}


const UserDashboard = () => {
    const [stats, setStats] = useState<DashboardStat[]>([]);
    const [loading, setLoading] = useState(true);


    const handleWithdraw = async (amount: string, accountTitle: string, accountNumber: string, bankName: string) => {
        try {
            const response = await fetch('/api/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, accountTitle, accountNumber, bankName }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast.warning(data.message || 'Failed to submit withdraw request');
            } else {
                toast.success('Withdrawal submitted');
                setStats(prevStats => prevStats.map(stat =>
                    stat.title === 'Total Commission' ? { ...stat, value: data.updatedBalance } : stat
                ));
            }
            return true;
        } catch (error) {
            console.error('Error submitting withdrawal:', error);
            return false;
        }
    };

    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/signin');
        }
    }, [isAuthenticated, authLoading, router]);



    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/orders/stats');
                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }
                const data = await response.json();
                setStats([
                    { title: 'Total Earning', value: data.totalEarning },
                    { title: 'Pending Commission', value: data.pendingCommission },
                    { title: 'Purchased Products', value: data.purchasedProductsCount },
                    { title: 'Total Investment', value: data.totalInvestment }
                ]);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);



    const [activeTab, setActiveTab] = useState<'bought' | 'refrence' | 'settings' | 'withdraw' | 'ReferralTree'>('bought');


    return (
        <>
            <Navbar />
            {authLoading ? (
                <div className="min-h-screen bg-[#271843] text-white flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-[#9b87f5]" />
                        <p className="mt-4 text-lg">Loading your dashboard...</p>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen bg-[#271843] text-white p-8  px-4 sm:px-6">


                    <div className="flex flex-row justify-between flex-wrap gap-2 mb-8">

                        {loading ? (
                            <Card className="border-0 bg-transparent shadow-none">
                                <CardContent className="flex items-center gap-2 p-0">
                                    <div className="text-[#9b87f5] text-xl sm:text-2xl">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-800">
                                            <Loader className="text-purple-500" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-gray-300 text-xs sm:text-sm md:text-md animate-pulse">Loading...</p>
                                        <p className="text-white text-lg sm:text-xl md:text-3xl font-bold animate-pulse">---</p>
                                    </div>

                                </CardContent>
                            </Card>

                        ) : (

                            stats.map((stat, index) => (
                                <Card key={index} className="border-0 bg-transparent shadow-none">
                                    <CardContent className="flex items-center gap-2 p-0">
                                        <div className="text-[#9b87f5] text-xl sm:text-2xl">
                                            {stat.title === 'Total Earning' ? (

                                                <DollarSign className="text-purple-500 sm:w-6 sm:h-6" />

                                            ) : stat.title === 'Pending Commission' ? (
                                                <DollarSign className="text-purple-500 sm:w-6 sm:h-6" />
                                            ) : (
                                                <Layers className="text-indigo-500 sm:w-6 sm:h-6" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-gray-300 text-xs sm:text-sm md:text-base">{stat.title}</p>
                                            <p className="text-white text-base sm:text-lg md:text-2xl font-bold">{stat.value}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                            ))
                        )}
                    </div>

                    <div className="flex justify-between items-center mb-8">
                        <div className="overflow-x-auto pb-2 ">
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
                                    className={`rounded-md px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base ${activeTab === 'withdraw' ? 'bg-[#9b87f5] text-white' : 'text-gray-400'}`}
                                    onClick={() => setActiveTab('withdraw')}
                                >
                                    Withdraw
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
                    ) : activeTab === 'withdraw' ? (
                        <WithdrawPanel onWithdraw={handleWithdraw} />
                    ) : (
                        <Settings />
                    )}
                </div>
            )}
        </>
    );
};

export default UserDashboard;