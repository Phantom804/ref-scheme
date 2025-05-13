"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ phoneNumber: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const { signIn } = useAuth();

    // Validate phone number format
    const validatePhoneNumber = (phone: string) => {
        // Basic phone validation - can be adjusted based on your requirements
        const phoneRegex = /^[0-9]{10,15}$/;
        return phoneRegex.test(phone);
    };

    // Validate password strength
    const validatePassword = (password: string) => {
        return password.length >= 4; // Basic PIN validation
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Input validation
        if (!form.phoneNumber || !form.password) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        // Phone number validation
        if (!validatePhoneNumber(form.phoneNumber)) {
            setError("Please enter a valid phone number");
            setIsLoading(false);
            return;
        }

        // Password validation
        if (!validatePassword(form.password)) {
            setError("PIN must be at least 4 digits");
            setIsLoading(false);
            return;
        }


        try {
            // Sanitize inputs before sending to API
            const sanitizedPhone = form.phoneNumber.trim();
            const sanitizedPassword = form.password.trim();

            const result = await signIn(sanitizedPhone, sanitizedPassword);

            if (result.success) {

                router.push("/");
            } else {

                setError(result.message || "Sign in failed");
            }
        } catch (error) {
            setError("An error occurred during sign in");
        } finally {
            setIsLoading(false);
        }
    };
    const handleForgetPin = () => {
        toast.message("Chat With Admin By chatbox If You Forgate Old Pin")
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br">
            <div className="rounded-2xl h-[95vh] bg-[#1c0f2e]/80 p-8 px-12 shadow-xl w-full max-w-md relative">

                <div className="text-white text-2xl font-bold text-center mb-1">Sign in to our platform</div>
                <div className="text-gray-400 text-center mb-6 text-sm">Login to continue</div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-1">Phone</label>
                        <Input
                            type="number"
                            placeholder="Enter your phone"
                            className="bg-[#372759] border-[#47396d] text-white focus:border-purple-400 placeholder:text-gray-400"
                            value={form.phoneNumber}
                            onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Pin</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Your Pin"
                                className="pr-10 bg-[#372759] border-[#47396d] text-white focus:border-purple-400 placeholder:text-gray-400"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                onClick={() => setShowPassword((v) => !v)}
                                tabIndex={-1}
                            >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        <div className="text-right mt-1">
                            <span className="text-red-500 font-medium text-sm cursor-pointer" onClick={handleForgetPin}>Forgot Password?</span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-6 bg-[#715cff] hover:bg-[#5740b2] text-white font-bold text-base rounded-lg py-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                Signing in...
                            </div>
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                </form>

                <div className="mt-2 text-center text-gray-300 text-sm">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-400 underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}