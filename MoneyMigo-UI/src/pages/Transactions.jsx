import { useState, useEffect } from "react";
import { DollarSign, Plus, MoreVertical, TrendingUp, TrendingDown, X, Filter } from "lucide-react";
import { transactionApi } from "../api/transactionsApi.js";

// Purpose enums
const PURPOSE_OPTIONS = [
  { value: "", label: "All Purposes" },
  { value: "home", label: "Home" },
  { value: "fuel", label: "Fuel" },
  { value: "shopping", label: "Shopping" },
  { value: "groceries", label: "Groceries" },
  { value: "grooming", label: "Grooming" },
  { value: "gym", label: "Gym" },
  { value: "utilities", label: "Utilities" },
  { value: "entertainment", label: "Entertainment" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "transportation", label: "Transportation" },
  {value:"medical", label:"Medical"},
  {value:"loan", label:"Loan"},
  { value: "food", label: "Food & Dining" },
  { value: "salary", label: "Salary" },
  { value: "business", label: "Business" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" }
];

const Transactions = () => {
  // Get current month's first day
  const getCurrentMonthStart = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  };

  const [showDialog, setShowDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [newPaymentType, setNewPaymentType] = useState('');
  const [showAddPaymentType, setShowAddPaymentType] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [filters, setFilters] = useState({
    filterType: "dateRange",
    startDate: getCurrentMonthStart(),
    endDate: "",
    month: "",
    year: "",
    purpose: ""
  });
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    transaction_date: new Date().toISOString().split('T')[0],
    purpose: "",
    description: "",
    payment_type: "cash",
  });

  // Simulated API fetch - replace with your actual API
  useEffect(() => {
    fetchTransactions();
    fetchStats();
    fetchPaymentTypes();
  }, [filters, sortOrder]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (filters.filterType === 'dateRange') {
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
    } else if (filters.filterType === 'month' && filters.month) {
      params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
    } else if (filters.filterType === 'year' && filters.year) {
      params.append('year', filters.year);
    }
    
    if (filters.purpose) {
      params.append('purpose', filters.purpose);
    }
    
    if (sortOrder) {
      params.append('sortOrder', sortOrder);
    }
    
    return params.toString();
  };

  const fetchTransactions = async () => {
    try {
      const queryString = buildQueryParams();
      const url = `http://localhost:5000/api/transactions${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const queryString = buildQueryParams();
      const url = `http://localhost:5000/api/transactions/stats${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchPaymentTypes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payment-types');
      const data = await response.json();
      setPaymentTypes(data);
    } catch (error) {
      console.error("Error fetching payment types:", error);
    }
  };

  const addPaymentType = async () => {
    if (!newPaymentType.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/payment-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPaymentType.trim() })
      });
      
      if (response.ok) {
        setNewPaymentType('');
        setShowAddPaymentType(false);
        fetchPaymentTypes();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add payment type');
      }
    } catch (error) {
      console.error("Error adding payment type:", error);
      alert('Failed to add payment type');
    }
  };

  const deletePaymentType = async (id, isDefault) => {
    if (isDefault) {
      alert('Cannot delete default payment types');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this payment type?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/payment-types/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchPaymentTypes();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error deleting payment type:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      filterType: "dateRange",
      startDate: getCurrentMonthStart(),
      endDate: "",
      month: "",
      year: "",
      purpose: ""
    });
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.filterType !== 'all' && (filters.startDate || filters.endDate || filters.month || filters.year)) {
      count++;
    }
    if (filters.purpose) count++;
    return count;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date,
        purpose: formData.purpose,
        description: formData.description,
        payment_type: formData.payment_type,
      };

      if (editingId) {
        // Update existing transaction
        await fetch(`http://localhost:5000/api/transactions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData)
        });
      } else {
        // Create new transaction
        await transactionApi.createTransaction(transactionData);
      }

      setShowDialog(false);
      setShowSuccess(true);
      setEditingId(null);
      
      setFormData({
        type: "expense",
        amount: "",
        transaction_date: new Date().toISOString().split('T')[0],
        purpose: "",
        description: "",
        payment_type: "cash",
      });

      fetchTransactions();
      fetchStats();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    
    // Fix timezone issue - extract date properly
    let dateValue = transaction.transaction_date;
    if (dateValue.includes('T')) {
      // If it's a full ISO string, extract just the date part
      dateValue = dateValue.split('T')[0];
    } else if (dateValue.length > 10) {
      // If it's a date string, take only the first 10 characters (YYYY-MM-DD)
      dateValue = dateValue.substring(0, 10);
    }
    
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      transaction_date: dateValue,
      purpose: transaction.purpose || '',
      description: transaction.description || '',
      payment_type: transaction.payment_type
    });
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'DELETE'
      });
      fetchTransactions();
      fetchStats();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const totalIncome = stats.totalIncome || 0;
  const totalExpense = stats.totalExpense || 0;
  const balance = stats.balance || 0;

  return (
    <div className="min-h-screen bg-[#d4c5b0] p-4 md:p-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-[#4ade80] text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span>Transaction added successfully!</span>
          <button onClick={() => setShowSuccess(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#2a2a2a] rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#d4af6a] flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-[#d4af6a]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#d4c5b0]">
            Financial Overview
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilterDialog(true)}
            className="bg-[#2a2a2a] hover:bg-[#3a3a3a] border-2 border-[#d4af6a] text-[#d4af6a] px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 relative"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#d4af6a] text-[#2a2a2a] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowDialog(true)}
            className="bg-[#d4af6a] hover:bg-[#c09d5a] text-[#2a2a2a] px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#2a2a2a] rounded-2xl p-6">
          <h3 className="text-[#d4c5b0] text-lg mb-2">Account Balance</h3>
          <p className="text-[#d4af6a] text-3xl md:text-4xl font-bold">
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-[#2a2a2a] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#d4c5b0] text-lg mb-2">Total Income</h3>
              <p className="text-[#4ade80] text-3xl md:text-4xl font-bold">
                +₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#4ade80]" />
          </div>
        </div>
        <div className="bg-[#2a2a2a] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#d4c5b0] text-lg mb-2">Total Expenses</h3>
              <p className="text-[#f87171] text-3xl md:text-4xl font-bold">
                -₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-[#f87171]" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2a2a2a]">Recent Transactions</h2>
          <button
            onClick={toggleSort}
            className="flex items-center gap-2 px-4 py-2 bg-[#d4c5b0] hover:bg-[#c4b5a0] text-[#2a2a2a] rounded-xl font-semibold text-sm transition-all"
          >
            <span>Sort by Date</span>
            <span className="text-lg">{sortOrder === 'desc' ? '↓' : '↑'}</span>
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#d4c5b0] rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-[#2a2a2a]" />
            </div>
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-gray-400 text-sm mt-2">
              Add your first transaction to get started!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2a2a2a] text-[#d4c5b0]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Purpose</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold hidden md:table-cell">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold hidden lg:table-cell">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-[#f5f5f5] transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(transaction.transaction_date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === "income"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}₹
                        {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {transaction.purpose ? (
                        <span className="inline-block px-3 py-1 bg-[#d4c5b0] text-[#2a2a2a] rounded-lg text-xs font-semibold">
                          {PURPOSE_OPTIONS.find(p => p.value === transaction.purpose)?.label || transaction.purpose}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                      {transaction.description || "-"}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="inline-block px-3 py-1 bg-[#d4af6a] text-[#2a2a2a] rounded-lg text-xs font-semibold uppercase">
                        {transaction.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-500 hover:text-red-700 font-semibold text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-[#2a2a2a] p-6 rounded-t-2xl flex items-center justify-between sticky top-0">
              <h2 className="text-xl font-bold text-[#d4c5b0]">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button
                onClick={() => { setShowDialog(false); setEditingId(null); }}
                className="text-[#d4c5b0] hover:text-[#d4af6a]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="transaction_date"
                  value={formData.transaction_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purpose
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                >
                  <option value="">Select Purpose</option>
                  {PURPOSE_OPTIONS.slice(1).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional details..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                >
                  <option value="">Select Payment Type</option>
                  {paymentTypes.map(type => (
                    <option key={type.id} value={type.name}>
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddPaymentType(!showAddPaymentType)}
                  className="mt-2 text-[#d4af6a] hover:text-[#c09d5a] text-sm font-semibold"
                >
                  {showAddPaymentType ? '- Cancel' : '+ Add Custom Payment Type'}
                </button>
                
                {showAddPaymentType && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      value={newPaymentType}
                      onChange={(e) => setNewPaymentType(e.target.value)}
                      placeholder="Enter payment type name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                      onKeyPress={(e) => e.key === 'Enter' && addPaymentType()}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addPaymentType}
                        className="px-4 py-2 bg-[#d4af6a] hover:bg-[#c09d5a] text-[#2a2a2a] rounded-xl font-semibold text-sm"
                      >
                        Add
                      </button>
                    </div>
                    
                    {/* List of payment types with delete option */}
                    <div className="mt-3 border-t pt-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Manage Payment Types:</p>
                      <div className="space-y-1">
                        {paymentTypes.map(type => (
                          <div key={type.id} className="flex items-center justify-between py-1">
                            <span className="text-sm text-gray-700">
                              {type.name.charAt(0).toUpperCase() + type.name.slice(1).replace('_', ' ')}
                              {type.is_default && <span className="text-xs text-gray-500 ml-2">(default)</span>}
                            </span>
                            {!type.is_default && (
                              <button
                                type="button"
                                onClick={() => deletePaymentType(type.id, type.is_default)}
                                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#d4af6a] hover:bg-[#c09d5a] text-[#2a2a2a] py-3 rounded-xl font-semibold transition-all"
                >
                  {editingId ? 'Update Transaction' : 'Add Transaction'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDialog(false); setEditingId(null); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Dialog */}
      {showFilterDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-[#2a2a2a] p-6 rounded-t-2xl flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-2">
                <Filter className="w-6 h-6 text-[#d4af6a]" />
                <h2 className="text-xl font-bold text-[#d4c5b0]">Filter Transactions</h2>
                {getActiveFilterCount() > 0 && (
                  <span className="bg-[#d4af6a] text-[#2a2a2a] text-xs font-bold px-2 py-1 rounded-full">
                    {getActiveFilterCount()} active
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowFilterDialog(false)}
                className="text-[#d4c5b0] hover:text-[#d4af6a]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Filter Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date Filter Type
                </label>
                <select
                  name="filterType"
                  value={filters.filterType}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                >
                  <option value="all">All Time</option>
                  <option value="dateRange">Date Range</option>
                  <option value="month">Specific Month</option>
                  <option value="year">Specific Year</option>
                </select>
              </div>

              {/* Date Range Filters */}
              {filters.filterType === 'dateRange' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                    />
                  </div>
                </div>
              )}

              {/* Month Filter */}
              {filters.filterType === 'month' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Month
                    </label>
                    <select
                      name="month"
                      value={filters.month}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                    >
                      <option value="">Select Month</option>
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Year (Optional)
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={filters.year}
                      onChange={handleFilterChange}
                      placeholder="e.g., 2025"
                      min="2000"
                      max="2100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                    />
                  </div>
                </div>
              )}

              {/* Year Filter */}
              {filters.filterType === 'year' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    placeholder="e.g., 2025"
                    min="2000"
                    max="2100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                  />
                </div>
              )}

              {/* Purpose Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purpose
                </label>
                <select
                  name="purpose"
                  value={filters.purpose}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af6a]"
                >
                  {PURPOSE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => setShowFilterDialog(false)}
                  className="flex-1 bg-[#d4af6a] hover:bg-[#c09d5a] text-[#2a2a2a] py-3 rounded-xl font-semibold transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
