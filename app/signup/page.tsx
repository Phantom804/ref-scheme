"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import TermsModal from "@/components/TermsModal";
import PhoneInput from "@/components/ui/phone-input";


import { toast } from "sonner";

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [checked, setChecked] = useState(false);
    const [form, setForm] = useState({ name: "", phoneNumber: "", country: "", password: "", confirm: "" });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showTermsModal, setShowTermsModal] = useState(false);
    const router = useRouter();
    const { signUp, isAuthenticated } = useAuth();


    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated]);

    const handlePhoneChange = (phone: string, country: string) => {
        setForm({ ...form, phoneNumber: phone, country: country });
    }

    const validatePhoneNumber = (phone: string) => {

        const phoneRegex = /^[0-9]{10,15}$/;
        return phone === "" || phoneRegex.test(phone);
    };

    // Validate password strength
    const validatePassword = (password: string) => {
        return password.length >= 4 && password.length <= 40;
    };

    const sanitizeInput = (input: string) => {
        return input.trim()
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Basic validation
        if (!form.password || !form.confirm) {
            setError("Please fill in all required fields");
            setIsLoading(false);
            return;
        }



        // Phone validation (if provided)
        if (form.phoneNumber && !validatePhoneNumber(form.phoneNumber)) {
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

        // Password match validation
        if (form.password !== form.confirm) {
            setError("PINs do not match");
            setIsLoading(false);
            return;
        }

        // Terms acceptance validation
        if (!checked) {
            setError("Please accept the terms and conditions");
            setIsLoading(false);
            return;
        }

        try {
            // Sanitize all inputs before sending to API
            const sanitizedName = form.name ? sanitizeInput(form.name) : "";

            const sanitizedPhone = form.phoneNumber ? sanitizeInput(form.phoneNumber) : "";
            const sanitizedPassword = form.password.trim(); // Don't modify password content, just trim

            const result = await signUp(sanitizedName, form.country, sanitizedPhone, sanitizedPassword);

            if (result.success) {
                toast.success("Sign up successful! login Now");
                router.push("/signin");
            } else {
                setError(result.message || "Sign up failed");
            }
        } catch (error) {
            setError("An error occurred during sign up");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br py-1">
            <div className="rounded-2xl h-[90%] bg-[#1c0f2e]/80 p-8 px-12 shadow-xl w-full max-w-md relative">

                <div className="text-white text-2xl font-bold text-center mb-1">Register to our platform</div>
                <div className="text-gray-400 text-center mb-6 text-sm">Create your account</div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-1">Name</label>
                        <Input
                            type="text"
                            placeholder="Enter your name"
                            className="bg-[#372759] border-[#47396d] text-white focus:border-purple-400 placeholder:text-gray-400"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Phone</label>

                        <PhoneInput onPhoneChange={handlePhoneChange} country="PK" placeholder="eg : 03181210111" />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Pin</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Pin"
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
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Confirm Pin</label>
                        <div className="relative">
                            <Input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm Pin"
                                className="pr-10 bg-[#372759] border-[#47396d] text-white focus:border-purple-400 placeholder:text-gray-400"
                                value={form.confirm}
                                onChange={e => setForm({ ...form, confirm: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                onClick={() => setShowConfirm((v) => !v)}
                                tabIndex={-1}
                            >
                                {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-center mt-6 mb-3">
                        <Checkbox
                            id="signup-accept"
                            checked={checked}
                            onCheckedChange={(val: boolean | "indeterminate") => setChecked(val === true)}
                            className="mr-2 accent-purple-800"
                        />
                        <label htmlFor="signup-accept" className="text-white text-sm" >
                            I accept the <span

                                className="font-bold text-blue-400 cursor-pointer hover:underline"
                                onClick={(e) => {
                                    e.preventDefault();      // 🔒 Prevent label behavior
                                    e.stopPropagation();     // 🚫 Stop bubbling
                                    setShowTermsModal(true); // 📦 Open modal
                                }}
                            >
                                terms &amp; conditions.
                            </span>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-3 bg-[#715cff] hover:bg-[#5740b2] text-white font-bold text-base rounded-lg py-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                Registering...
                            </div>
                        ) : (
                            "Register"
                        )}
                    </Button>
                </form>

                <div className="mt-2 text-center text-gray-300 text-sm">
                    Already have an account?{" "}
                    <Link href="/signin" className="text-blue-400 underline">
                        Sign in
                    </Link>
                </div>
            </div>

            {/* Terms & Conditions Modal */}
            <TermsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
            />
        </div>
    );
}