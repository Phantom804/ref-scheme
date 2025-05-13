"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";




const Settings = () => {
    const { user, updateUserInfo } = useAuth();
    const [userID, setUserID] = useState(user?.id || '');
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showCurrentPin, setShowCurrentPin] = useState(false);
    const [showNewPin, setShowNewPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);

    // Update state when user data changes
    useEffect(() => {
        if (user) {
            setUserID(user.id || '');
            setName(user.name || '');
            setEmail(user.email || '');
            setPhoneNumber(user.phoneNumber || '');
        }
    }, [user]);

    console.log("user ID", userID);
    const handleUpdate = async () => {
        if (!user?.id) return;
        const result = await updateUserInfo({
            id: user.id,
            name,
            email,
            phoneNumber
        });
        if (result.success) {
            toast.success('User information updated successfully');
        } else {
            toast.error(result.message || 'Failed to update user information');
        }
    };

    const handlePinUpdate = async () => {
        if (!user?.id) return;
        if (!currentPin || !newPin || !confirmPin) {
            toast.error('Please fill in all PIN fields');
            return;
        }
        if (newPin !== confirmPin) {
            toast.error('New PIN and Confirm PIN do not match');
            return;
        }
        if (newPin.length < 4) {
            toast.error('PIN must be at least 4 digits');
            return;
        }
        const result = await updateUserInfo({
            id: user.id,
            oldpin: currentPin,
            newpin: newPin
        });
        if (result.success) {
            toast.success('PIN updated successfully');
            setCurrentPin('');
            setNewPin('');
            setConfirmPin('');
        } else {
            toast.error(result.message || 'Failed to update PIN');
        }
    };

    const handleForgetPin = () => {
        toast.message("Chat With Admin By chatbox If You Forgate Old Pin")
    }


    return (
        <>

            <div className="min-h-screen bg-transparent text-white p-8">

                <div defaultValue="personal-info" className="w-full max-w-3xl">


                    <div className="space-y-6 bg-[#1A0B2E] rounded-2xl p-8">
                        <h2 className="text-xl font-semibold mb-1">Personal Info</h2>
                        <p className="text-gray-400 mb-6">Edit your personal info here.</p>

                        {/* <div className="flex items-center mb-8">
                            <div className="w-24 h-24 bg-[#2A1B3D] rounded-full flex items-center justify-center mr-6 cursor-pointer hover:bg-[#392A4D] transition-colors">
                                <Camera size={32} className="text-gray-400" />
                            </div>
                            <div>
                                <div className="text-base text-white mb-1">Upload Image</div>
                                <div className="text-sm text-gray-400">
                                    Max size 2MB. Format supported PNG, JPEG.
                                </div>
                            </div>
                        </div> */}

                        <div className="space-y-6">
                            <div>
                                <Label className="text-gray-400 mb-2 block">Name</Label>
                                <Input
                                    className="bg-[#2A1B3D] border-none text-white placeholder-gray-500 py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-600"
                                    placeholder="Adam Sandlers"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-gray-400 mb-2 block">Email</Label>
                                <Input
                                    className="bg-[#2A1B3D] border-none text-white placeholder-gray-500 py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-600"
                                    placeholder="Adamsandlers@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-gray-400 mb-2 block">Phone No</Label>
                                <Input
                                    className="bg-[#2A1B3D] border-none text-white placeholder-gray-500 py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-600"
                                    placeholder="+44 122-343-34343"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">

                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUpdate}>
                                Update
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6 mt-5 bg-[#1A0B2E] rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-1">PIN</h2>
                        <p className="text-gray-400 mb-6">Set up your PIN.</p>

                        <div className="space-y-6">


                            <div>
                                <Label className="text-gray-400 mb-2 block">{"Current PIN"}</Label>
                                <div className="relative flex items-center bg-[#2A1B3D] rounded-xl focus-within:ring-2 focus-within:ring-blue-600">
                                    <input
                                        type={showCurrentPin ? "text" : "password"}
                                        className="bg-transparent border-none text-white placeholder-gray-500 py-3 px-4 pr-10 w-full focus:outline-none"
                                        placeholder="Enter PIN"
                                        value={currentPin}
                                        onChange={(e) => setCurrentPin(e.target.value)}
                                        maxLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 text-gray-400"
                                        onClick={() => setShowCurrentPin((v) => !v)}
                                        tabIndex={-1}
                                    >
                                        {showCurrentPin ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>


                            <div >
                                <Label className="text-gray-400 mb-2 ">New PIN</Label>
                                <div className="relative flex items-center bg-[#2A1B3D] rounded-xl focus-within:ring-2 focus-within:ring-blue-600">
                                    <Input
                                        type={showNewPin ? "text" : "password"}
                                        className="bg-[#2A1B3D] border-none text-white placeholder-gray-500 py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-600"
                                        placeholder="Enter PIN"
                                        value={newPin}
                                        onChange={(e) => setNewPin(e.target.value)}
                                        maxLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 text-gray-400"
                                        onClick={() => setShowNewPin((v) => !v)}
                                        tabIndex={-1}
                                    >
                                        {showNewPin ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>


                            <div >
                                <Label className="text-gray-400 mb-2 block">Confirm PIN</Label>
                                <div className="relative flex items-center bg-[#2A1B3D] rounded-xl focus-within:ring-2 focus-within:ring-blue-600">
                                    <Input
                                        type={showConfirmPin ? "text" : "password"}
                                        className="bg-[#2A1B3D] border-none text-white placeholder-gray-500 py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-600"
                                        placeholder="Enter PIN"
                                        value={confirmPin}
                                        onChange={(e) => setConfirmPin(e.target.value)}
                                        maxLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 text-gray-400"
                                        onClick={() => setShowConfirmPin((v) => !v)}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPin ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>


                            <div className="flex gap-4 mt-6">
                                <Button
                                    variant="outline"
                                    className="bg-transparent border-gray-600"
                                    onClick={handleForgetPin}
                                >
                                    {"Forgot PIN"}
                                </Button>
                                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handlePinUpdate}>
                                    Update
                                </Button>
                            </div>





                        </div>
                    </div>
                </div>
            </div>







        </>
    );
};

export default Settings;