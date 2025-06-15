import Navbar from "@/components/Navbar";
import ProductsSection from '@/components/ProductsSection';
import { Loader2 } from "lucide-react";
import ProductLockPanel from "@/components/ProductLockPanel";
import PaymentCard from "@/components/PaymentCard";
import { format } from "date-fns";
import PriceGraphSection from "@/components/PriceGraphSection";
import type { Metadata, ResolvingMetadata } from 'next';

interface Product {
    id: string;
    description: string;
    name: string;
    productCode: string;
    price: number;
    isLocked?: boolean;
    imageUrl: string;
    category: string;
    createdAt: Date;
}

async function getProduct(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/products/detail?id=${id}`, {
            cache: 'no-store'
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error || 'Failed to fetch product' };
        return data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return { error: 'An unexpected error occurred' };
    }
}

async function getPriceHistory(id: string, range: 'yearly' | '6months' | 'monthly' = 'monthly') {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/price-history?productId=${id}&range=${range}`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch price history');
        return await res.json();
    } catch (error) {
        console.error('Error fetching price history:', error);
        return [];
    }
}

type GenerateMetadataProps = {
    params: Promise<{
        id: string;
    }>;
};

export async function generateMetadata(
    { params }: GenerateMetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // Await the params promise
    const { id } = await params;
    const product = await getProduct(id);

    if (product?.error) {
        return {
            title: 'Product Error | Cash Vibe',
            description: 'There was an error loading the product.',
        };
    }

    return {
        title: `${product.name}`,
        description: product.description,
        openGraph: {
            title: `${product.name}`,
            description: product.description,
            images: [
                {
                    url: product.imageUrl,
                    width: 800,
                    height: 600,
                },
            ],
        },
    };
}


type PageProps = {
    params: Promise<{
        id: string;
    }>;
    searchParams?: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
};

export default async function ProductDetail({ params }: PageProps) {

    const { id } = await params;
    const PRODUCT_ID = id;
    const product = await getProduct(PRODUCT_ID);
    const initialPriceData = product?.error ? [] : await getPriceHistory(PRODUCT_ID);

    return (
        <>
            <Navbar />
            {product?.error ? (
                <div className="flex flex-col justify-center items-center py-16 sm:py-20 px-4 text-center">
                    <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30 mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Error Loading Product</h2>
                        <p className="text-sm sm:text-base text-gray-300">{product.error}</p>
                    </div>
                    <p className="text-gray-400 mt-4">This may happen if the product ID is invalid or the product has been removed.</p>
                </div>
            ) : !product ? (
                <div className="flex justify-center items-center py-8 sm:py-10 px-4">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-purple-500" />
                    <span className="ml-2 text-sm sm:text-base text-gray-400">Loading...</span>
                </div>
            ) : (
                <div>
                    <div className="flex flex-col md:flex-row items-start gap-8 mt-6 pb-10 md:pb-20 px-4 sm:px-6">
                        <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                                <img
                                    src={product?.imageUrl}
                                    alt={product?.name || "Product"}
                                    className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl border border-purple-600 bg-gray-950 object-cover"
                                />
                                <div className="mt-3 sm:mt-0">
                                    <div className="text-xl sm:text-2xl font-semibold text-white flex gap-2 items-center">
                                        {product?.name}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-400 mt-1">{product?.createdAt ? `Listed on ${format(new Date(product.createdAt), 'dd MMM, yyyy')}` : 'Date unavailable'} </div>
                                    <div className="mt-2 sm:mt-3 text-white text-2xl sm:text-3xl font-bold"><span className="text-base sm:text-xs text-white">PKR</span> {product?.price} <span className="text-sm sm:text-base font-medium bg-gray-700/40 rounded px-2 py-1 ml-2 text-blue-200">Current Price</span></div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="my-6 sm:my-8">
                                <h3 className="text-lg sm:text-xl text-white font-bold mb-2">Description</h3>
                                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                                    {product?.description}
                                </p>
                            </div>

                            {/* Price Graph - Using client component */}
                            <PriceGraphSection productId={PRODUCT_ID} initialData={initialPriceData} />
                        </div>
                        {product?.isLocked ? (
                            <ProductLockPanel />
                        ) : (
                            <PaymentCard id={product?.id} productName={product?.name} price={product?.price} productCode={product?.productCode} />
                        )}
                    </div>
                    <div className="px-4 sm:px-6">
                        <ProductsSection TopHeading="Suggested Products" viewAll={false} />
                    </div>
                </div>
            )}
        </>
    );
}