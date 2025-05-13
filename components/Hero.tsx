"use client";

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";


const Hero: React.FC = () => {
    return (
        <div className="relative mt-3 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-[#4A1D96]">
            <div className="absolute inset-0 bg-[url('/rays.svg')] bg-right bg-no-repeat opacity-50" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-2">
                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:justify-between gap-8 sm:gap-0">
                    <div className="max-w-full sm:max-w-2xl text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white lg:text-6xl">
                            Refer your friend and get 10% bonus on your first sale.
                        </h1>
                        <div className="mt-6 sm:mt-10">
                            <Link href={"/products"} >
                                <Button className='bg-blue-600 hover:bg-blue-700 px-6 py-2 text-base rounded-3xl '>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Explore Products
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative block sm:hidden md:block ">
                        <div className="relative">
                            <Image
                                src="/character.svg"
                                alt="character talking"
                                width={200}
                                height={300}
                                className="w-auto sm:w-[250px] sm:h-[250px] md:w-[500px] md:h-[400px] "
                                priority
                            />
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 sm:left-10 md:left-20 w-full sm:w-auto">
                    <Image
                        src="/coins.svg"
                        alt="coins"
                        width={300}
                        height={240}
                        className="object-contain w-full sm:w-auto max-w-[300px] sm:max-w-[400px] md:max-w-[500px]"
                        priority
                    />
                </div>
            </div>
        </div>
    );
};

export default Hero;


