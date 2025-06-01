"use client"

import React from 'react'
import { Lock, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

function ProductLockPanel() {
    return (
        <div className="bg-gradient-to-br w-full md:max-w-sm from-red-900/20 to-red-950/40 rounded-2xl p-8 border border-red-800/30 backdrop-blur-sm">
            <div className="text-center space-y-6">

                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg animate-pulse"></div>
                    <div className="relative bg-red-900/50 rounded-full p-4 border border-red-700/50">
                        <Lock className="w-8 h-8 text-red-400" />
                    </div>
                </div>


                <div>
                    <h2 className="text-2xl font-bold text-red-300 mb-2">Product Locked</h2>
                    <p className="text-red-400/80 text-lg">This item is currently unavailable</p>
                </div>


                <div className="bg-red-950/30 rounded-xl p-4 border border-red-800/20">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                        <Shield className="w-5 h-5 text-red-400" />
                        <span className="text-red-300 font-medium">Access Restricted</span>
                    </div>
                    <p className="text-red-400/70 text-sm leading-relaxed">
                        This product is temporarily locked and cannot be purchased at this time.
                        Please check back later for availability updates.
                    </p>
                </div>





            </div>
        </div>
    )
}

export default ProductLockPanel