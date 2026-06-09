import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import useCurrentChain from "../hooks/useCurrentChain";
import config from "../config";
import {
  ShoppingCartIcon,
  LockOpenIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Transaction {
  id: number;
  txHash: string;
  walletAddress: string;
  paymentToken: string;
  paymentAmount: string;
  tokenAmount: string;
  bonusCode: string | null;
  bonusPercentage: number;
  bonusTokens: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  chainId?: number;
  stage?: {
    name: string;
  };
}

interface TransactionHistoryProps {
  refreshKey?: number;
}

const ITEMS_PER_PAGE = 5; // Change this value to update items per page

const TransactionHistory = ({ refreshKey }: TransactionHistoryProps) => {
  const { address } = useAccount();
  const chain = useCurrentChain();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!address) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    fetchTransactions();
  }, [address, refreshKey]);

  const fetchTransactions = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://psmanager.vaultcoin.network/';
      const apiKey = import.meta.env.VITE_API_KEY || 'r5vtiwM+cGphTvXffy2jFkyKjmEPLeXsOjvEiAQM54A=';

      const response = await fetch(`${backendUrl}/api/widget/transactions/${address}`, {
        headers: {
          'x-api-key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-text-gray";
    }
  };

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "purchase":
        return ShoppingCartIcon;
      case "unlock":
        return LockOpenIcon;
      case "transfer":
        return ArrowUpTrayIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "purchase":
        return "Purchase";
      case "unlock":
        return "Unlock";
      case "transfer":
        return "Transfer";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="dashboard-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-light">Transaction History</h2>
            <p className="text-text-muted text-sm">Your recent transactions</p>
          </div>
        </div>
      </div>

      {/* Empty State or Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-text-muted text-sm mt-4">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-bgDark flex items-center justify-center mb-6">
            <ClockIcon className="w-10 h-10 text-text-gray" />
          </div>
          <h3 className="text-lg font-bold text-text-light mb-2">
            No Purchase History Yet
          </h3>
          <p className="text-text-muted text-sm text-center max-w-md">
            Your transaction history will appear here once you make your first purchase. Start by buying tokens above.
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="text-left py-3 px-4 text-text-muted text-xs uppercase tracking-wider font-semibold">
                    Tokens Bought
                  </th>
                  <th className="text-left py-3 px-4 text-text-muted text-xs uppercase tracking-wider font-semibold">
                    Paid
                  </th>
                  <th className="text-left py-3 px-4 text-text-muted text-xs uppercase tracking-wider font-semibold">
                    Bonus
                  </th>
                  <th className="text-left py-3 px-4 text-text-muted text-xs uppercase tracking-wider font-semibold">
                    Transaction
                  </th>
                  <th className="text-left py-3 px-4 text-text-muted text-xs uppercase tracking-wider font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((tx) => {
                    const baseTokens = parseFloat(tx.tokenAmount) - parseFloat(tx.bonusTokens);
                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-border-dark hover:bg-bgDark transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-text-light font-medium">
                              {parseFloat(tx.tokenAmount).toFixed(2)}
                            </p>
                            <p className="text-text-gray text-xs">VLTC</p>
                            {parseFloat(tx.bonusTokens) > 0 && (
                              <p className="text-green-400 text-xs">
                                ({baseTokens.toFixed(2)} + {parseFloat(tx.bonusTokens).toFixed(2)} bonus)
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-text-light font-medium">
                              {parseFloat(tx.paymentAmount).toFixed(4)}
                            </p>
                            <p className="text-text-gray text-xs">{tx.paymentToken}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {tx.bonusCode ? (
                            <div>
                              <p className="text-green-400 font-semibold text-sm">
                                {tx.bonusCode}
                              </p>
                              <p className="text-text-gray text-xs">
                                +{tx.bonusPercentage}%
                              </p>
                            </div>
                          ) : (
                            <span className="text-text-gray text-sm">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <a
                            href={`${config.chainDetails[tx.chainId || chain.id]?.explorer || 'https://etherscan.io'}/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-light font-mono text-xs hover:underline"
                          >
                            {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                          </a>
                          <p className="text-text-gray text-xs">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              tx.status
                            )}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
        </table>
      </div>

      {/* Pagination */}
      {transactions.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-text-muted text-sm">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, transactions.length)}-{Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)} of {transactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded bg-bgDark border border-border-gray text-text-light text-sm hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span className="text-text-muted text-sm px-2">
              {currentPage} / {Math.ceil(transactions.length / ITEMS_PER_PAGE)}
            </span>
            <button
              className="px-3 py-1 rounded bg-bgDark border border-border-gray text-text-light text-sm hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage >= Math.ceil(transactions.length / ITEMS_PER_PAGE)}
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(transactions.length / ITEMS_PER_PAGE), prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
      )}
    </div>
  );
};

export default TransactionHistory;