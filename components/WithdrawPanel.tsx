"use client"

import { useState, useEffect } from 'react';
import { DollarSign, XCircle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';

interface WithdrawHistory {
  id: string;
  amount: string;
  status: string;
  requestedOn: string;
  completedOn: string | null;
  accountTitle?: string;
  accountNumber?: string;
  bankName?: string;
}

interface WithdrawResponse {
  withdrawals: WithdrawHistory[];
  totalPages: number;
  currentPage: number;
  totalWithdrawals: number;
}

interface WithdrawPanelProps {
  onWithdraw: (amount: string, accountTitle: string, accountNumber: string, bankName: string) => Promise<boolean>;
}

const WithdrawPanel = ({ onWithdraw }: WithdrawPanelProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');

  const fetchWithdrawals = async (page = currentPage) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/withdraw?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }
      const data: WithdrawResponse = await response.json();
      setWithdrawalHistory(data.withdrawals);
      setTotalPages(data.totalPages);
      setTotalWithdrawals(data.totalWithdrawals);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchWithdrawals(page);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await onWithdraw(amount, accountTitle, accountNumber, bankName);
      if (success) {
        setAmount('');
        setAccountTitle('');
        setAccountNumber('');
        setBankName('');
        setIsDialogOpen(false);
        fetchWithdrawals(1); // Refresh the first page after new withdrawal
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 flex items-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          Withdraw
        </button>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md m-4 relative animate-fade-in">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold mb-4">Request Withdrawal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    PKR
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="20"
                    step="0.01"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="accountTitle" className="block text-sm font-medium text-slate-300 mb-2">
                  Account Title
                </label>
                <input
                  type="text"
                  id="accountTitle"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter account title"
                />
              </div>
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-slate-300 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-slate-300 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter bank name"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !amount || !accountTitle || !accountNumber || !bankName}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold ${isSubmitting || !amount || !accountTitle || !accountNumber || !bankName
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-700 hover:to-fuchsia-700'
                    } transition-all duration-300`}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-slate-900/70 rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b border-slate-800">Withdrawal History</h2>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <span className="ml-2 text-gray-400">Loading withdrawal history...</span>
            </div>
          ) : withdrawalHistory.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">No withdrawals yet</p>
            </div>
          ) : (
            <Table className="min-w-[800px] sm:min-w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-[#2A2F3E]">
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Requested</TableHead>
                  <TableHead className="text-gray-400">Completed On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalHistory.map((withdrawal) => (
                  <TableRow key={withdrawal.id} className="hover:bg-[#1F2937]/5 border-b border-[#2A2F3E]">
                    <TableCell>{withdrawal.amount}</TableCell>
                    <TableCell>
                      <Badge variant={
                        withdrawal.status.toLowerCase() === "cancelled"
                          ? "destructive"
                          : withdrawal.status.toLowerCase() === "pending"
                            ? "default"
                            : "secondary"
                      } className=''>{withdrawal.status}</Badge>
                    </TableCell>
                    <TableCell>{withdrawal.requestedOn}</TableCell>
                    <TableCell>{withdrawal.completedOn || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalWithdrawals}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default WithdrawPanel;