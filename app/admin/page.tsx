"use client";

import { Layers, Users, DollarSign, ShoppingCart, TrendingUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import BarChart from '@/components/charts/BarChart';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DashboardStat {
    title: string;
    value: string;
    icon?: React.ReactNode;
}

interface TopProduct {
    name: string;
    sales: number;
    price: string;
    category?: string;
}

interface CategoryData {
    name: string;
    sales: number;
}

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStat[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

    const router = useRouter();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/admin/dashboard');

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const data = await response.json();

                const statsWithIcons = data.stats.map((stat: DashboardStat) => ({
                    ...stat,
                    icon: getIconForStat(stat.title)
                }));

                setStats(statsWithIcons);
                setTopProducts(data.topProducts || []);
                setCategoryData(data.categoryData || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getIconForStat = (title: string) => {
        switch (title) {
            case 'Total Revenue':
                return <DollarSign className="text-purple-500" />;
            case 'Total Users':
                return <Users className="text-blue-500" />;
            case 'Total Products':
                return <Layers className="text-indigo-500" />;
            case 'Total Orders':
                return <ShoppingCart className="text-pink-500" />;
            default:
                return <TrendingUp className="text-green-500" />;
        }
    };

    if (loading) {
        return (
            <div className="pt-8 md:ml-16 lg:ml-64 transition-all duration-300 flex justify-center items-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
                    <p className="mt-2 text-gray-400">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-8 md:ml-16 lg:ml-64 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        className="border-t-4 border-t-purple-600 cursor-pointer"
                        onClick={() => {
                            if (stat.title === 'Total Orders') {
                                router.push('/admin/Orders'); // Replace with your actual orders page path
                            } else if (stat.title === 'Total Products') {
                                router.push('/admin/products'); // Replace with your actual products page path
                            } else if (stat.title === 'Total Users') {
                                router.push('/admin/users'); // Replace with your actual products page path
                            }
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-800">
                                {stat.icon}
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">{stat.title}</p>
                                <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>

                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Show top category in chart */}
                <Card title="Sales by Category" >
                    <h1 className='text-white font-bold mb-4'>Sales by Category</h1>
                    {categoryData.length > 0 ? (
                        <BarChart
                            data={categoryData}
                            datasets={[
                                { key: 'sales', color: '#7e22ce', label: 'Sales' }
                            ]}
                        />
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            No category data available
                        </div>
                    )}
                </Card>

                <Card title="Top Products">
                    <h1 className='text-white font-bold'>Top Products</h1>
                    <div className="space-y-4">
                        {topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded bg-purple-600/20 flex items-center justify-center mr-3">
                                            <Layers size={14} className="text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{product.name}</p>
                                            <p className="text-xs text-gray-400">{product.sales} sales</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-white">{product.price}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                No product data available
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;