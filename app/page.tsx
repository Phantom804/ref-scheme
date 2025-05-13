"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductsSection from '@/components/ProductsSection';

export default function Home() {


  return (
    <>
      <Navbar />
      <main className='px-4 sm:px-6'>
        <Hero />
        <ProductsSection TopHeading='Suggested Products' viewAll={true} />
      </main>
    </>
  );
}
