import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PhoneNumbersDialogProps {
    isOpen: boolean;
    onClose: () => void;
    phoneNumbers: string[];
    isNumLoading: boolean;
}

const PhoneNumbersDialog: React.FC<PhoneNumbersDialogProps> = ({
    isOpen,
    onClose,
    phoneNumbers,
    isNumLoading,
}) => {
    const handleCopyAll = () => {
        const allNumbers = phoneNumbers.join('\n');
        navigator.clipboard.writeText(allNumbers)
            .then(() => {
                toast.success('All phone numbers copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy numbers:', err);
                toast.error('Failed to copy phone numbers.');
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-white">All User Phone Numbers</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Here are all the phone numbers of your users.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-60 overflow-y-auto">
                    {isNumLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <span className="ml-2 text-gray-400">Loading orders...</span>
                        </div>
                    ) : phoneNumbers.length === 0 ? (
                        <p className="text-gray-400">No phone numbers found.</p>
                    ) : (
                        phoneNumbers.map((number, index) => (
                            <p key={index} className="text-gray-300">{number}</p>
                        ))
                    )}
                </div>
                <Button onClick={handleCopyAll} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Copy All Numbers
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default PhoneNumbersDialog;