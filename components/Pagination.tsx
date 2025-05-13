import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    loading = false
}) => {
    return (

        !loading && (


            <div className="p-4 flex items-center justify-between border-t border-[#2A2F3E]">
                <span className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-lg border-[#2A2F3E] bg-transparent hover:bg-[#9b87f5]/90"
                        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                    >
                        <ChevronLeft className="h-5 w-5 text-white hover:bg-white" />
                    </Button>
                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Logic to show pages around current page
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <Button
                                    key={pageNum}
                                    variant="ghost"
                                    className={`h-10 w-10 rounded-lg ${currentPage === pageNum ? 'text-white bg-[#9b87f5] hover:bg-[#9b87f5]/90 hover:text-white' : 'text-gray-400 hover:bg-[#1F2937]/5 hover:text-white'}`}
                                    onClick={() => onPageChange(pageNum)}
                                    disabled={loading}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                                <span className="flex items-center text-gray-400">...</span>
                                <Button
                                    variant="ghost"
                                    className="h-10 w-10 rounded-lg text-gray-400 hover:bg-[#1F2937]/5"
                                    onClick={() => onPageChange(totalPages)}
                                    disabled={loading}
                                >
                                    {totalPages}
                                </Button>
                            </>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-lg border-[#2A2F3E] bg-transparent hover:bg-[#9b87f5]/90 "
                        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                    >
                        <ChevronRight className="h-5 w-5 text-white" />
                    </Button>
                </div>
            </div>
        )
    );
};

export default Pagination;