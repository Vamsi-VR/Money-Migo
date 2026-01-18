import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Archive, RotateCcw, Eye, EyeOff } from "lucide-react";

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState({ totalInvested: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showWithdrawn, setShowWithdrawn] = useState(false);

  useEffect(() => {
    fetchInvestments();
  }, [showWithdrawn]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      // Fetch transactions where purpose is 'investment'
      const url = showWithdrawn 
        ? 'http://localhost:5000/api/transactions?purpose=investment&includeWithdrawn=true'
        : 'http://localhost:5000/api/transactions?purpose=investment';
      const response = await fetch(url);
      const data = await response.json();
      setInvestments(data);
      
      // Calculate total invested (excluding withdrawn)
      const activeInvestments = data.filter(inv => !inv.withdrawn);
      const total = activeInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
      setStats({
        totalInvested: total,
        count: activeInvestments.length
      });
    } catch (error) {
      console.error("Error fetching investments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}/withdraw`, {
        method: 'PATCH'
      });
      fetchInvestments();
    } catch (error) {
      console.error("Error withdrawing investment:", error);
    }
  };

  const handleReopen = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}/reopen`, {
        method: 'PATCH'
      });
      fetchInvestments();
    } catch (error) {
      console.error("Error reopening investment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#d4c5b0] p-4 md:p-8">
      {/* Header */}
      <div className="bg-[#2a2a2a] rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#d4af6a] flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#d4af6a]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#d4c5b0]">
            Investments
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#2a2a2a] rounded-2xl p-6">
          <h3 className="text-[#d4c5b0] text-lg mb-2">Total Invested</h3>
          <p className="text-[#d4af6a] text-3xl md:text-4xl font-bold">
            ₹{stats.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-[#2a2a2a] rounded-2xl p-6">
          <h3 className="text-[#d4c5b0] text-lg mb-2">Total Investments</h3>
          <p className="text-[#d4af6a] text-3xl md:text-4xl font-bold">
            {stats.count}
          </p>
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#2a2a2a]">Investment Transactions</h2>
          <button
            onClick={() => setShowWithdrawn(!showWithdrawn)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-[#d4c5b0] rounded-lg hover:bg-[#3a3a3a] transition-colors"
          >
            {showWithdrawn ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showWithdrawn ? 'Hide Withdrawn' : 'Show Withdrawn'}
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">Loading...</p>
          </div>
        ) : investments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#d4c5b0] rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-[#2a2a2a]" />
            </div>
            <p className="text-gray-500 text-lg">No investments found</p>
            <p className="text-gray-400 text-sm mt-2">
              Add transactions with 'Investment' purpose to track them here!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2a2a2a] text-[#d4c5b0]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold hidden md:table-cell">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold hidden lg:table-cell">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {investments.map((investment) => (
                  <tr key={investment.id} className={`hover:bg-[#f5f5f5] transition-colors ${investment.withdrawn ? 'opacity-50 bg-gray-50' : ''}`}>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(investment.transaction_date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${investment.withdrawn ? 'text-gray-400 line-through' : 'text-blue-600'}`}>
                        ₹{parseFloat(investment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {investment.withdrawn ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                          <Archive className="w-3 h-3" />
                          Withdrawn
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          investment.type === "income"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {investment.type}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                      {investment.description || "-"}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="inline-block px-3 py-1 bg-[#d4af6a] text-[#2a2a2a] rounded-lg text-xs font-semibold uppercase">
                        {investment.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {investment.withdrawn ? (
                        <button
                          onClick={() => handleReopen(investment.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reopen
                        </button>
                      ) : (
                        <button
                          onClick={() => handleWithdraw(investment.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                          <Archive className="w-4 h-4" />
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}