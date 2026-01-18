import { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, Tag, FileText, X } from 'lucide-react';
import { transactionApi, categoryApi, ApiError } from '../api/transactionsApi.js';

const TransactionForm = ({ isOpen, onClose, onTransactionAdded, editTransaction = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'expense',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    user_id: 1 // For now, hardcoded. In a real app, this would come from auth context
  });

  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApi.getGroupedCategories();
        setCategories(response.categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setError('Failed to load categories');
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editTransaction) {
      setFormData({
        title: editTransaction.title,
        description: editTransaction.description || '',
        amount: editTransaction.amount.toString(),
        type: editTransaction.type,
        category_id: editTransaction.category_id.toString(),
        transaction_date: editTransaction.transaction_date,
        user_id: 1
      });
    } else {
      // Reset form for new transaction
      setFormData({
        title: '',
        description: '',
        amount: '',
        type: 'expense',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
        user_id: 1
      });
    }
  }, [editTransaction, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      // Reset category when type changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        category_id: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    
    if (!formData.category_id) {
      setError('Category is required');
      return false;
    }
    
    if (!formData.transaction_date) {
      setError('Transaction date is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id)
      };

      if (editTransaction) {
        await transactionApi.updateTransaction(editTransaction.id, transactionData);
        setSuccess('Transaction updated successfully!');
      } else {
        await transactionApi.createTransaction(transactionData);
        setSuccess('Transaction added successfully!');
      }

      // Call callback to refresh transactions list
      if (onTransactionAdded) {
        onTransactionAdded();
      }

      // Reset form after successful submission
      if (!editTransaction) {
        setFormData({
          title: '',
          description: '',
          amount: '',
          type: 'expense',
          category_id: '',
          transaction_date: new Date().toISOString().split('T')[0],
          user_id: 1
        });
      }

      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);

    } catch (error) {
      console.error('Failed to save transaction:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to save transaction. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentCategories = categories[formData.type] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={handleChange}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">Expense</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={handleChange}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Income</span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter transaction title"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                required
              >
                <option value="">Select a category</option>
                {currentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="date"
                id="transaction_date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  {editTransaction ? 'Update' : 'Add'} Transaction
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;