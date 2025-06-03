export interface PriceHistoryItem {
    _id: string;
    productId: string;
    price: number;
    date: string;
}

export interface PriceHistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
}

export interface PriceAutomationData {
    productId: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    startPrice: number;
    targetPercentage: number;
}

export interface ActiveAutomation {
    _id: string;
    productId: string;
    startDate: string;
    endDate: string;
    startPrice: number;
    targetPercentage: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}